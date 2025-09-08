import React, { useState, useEffect } from 'react';
import { Card, Spin, Button, Popconfirm, message, Tag } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Headers from '../../../compronents/Pubblic_components/headerselect';
import AddArticle from './create_article/create_article';
import EditArticle from './edit_article/edit_article';
import { ArticleInterface } from '../../../interface/article_interface/article';
import {
  getAllArticles,
  deleteArticle,
  updateArticleOrder,
  publishArticleNow,
  unpublishArticle
} from '../../../services/https/Article/article';
import './article.css';
import moment from "moment";

const { Meta } = Card;

const ArticlePage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<ArticleInterface | null>(null);
  const currentAdminID = Number(localStorage.getItem("id"));

  // Fetch all articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await getAllArticles();
      setArticles(data.sort((a, b) => (a.Order || 0) - (b.Order || 0)));
    } catch (err: any) {
      message.error("Failed to fetch articles: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Delete article
  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      message.success("ลบบทความแล้ว");
      fetchArticles();
    } catch (err) {
      message.error("ลบไม่สำเร็จ");
    }
  };

  // Publish / Unpublish
  const handlePublish = async (id: number) => {
    try {
      await publishArticleNow(id);
      message.success("เผยแพร่บทความแล้ว");
      fetchArticles();
    } catch (err) {
      message.error("เผยแพร่ไม่สำเร็จ");
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishArticle(id);
      message.success("เลิกเผยแพร่บทความแล้ว");
      fetchArticles();
    } catch (err) {
      message.error("เลิกเผยแพร่ไม่สำเร็จ");
    }
  };

  // Drag and drop
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newArticles = Array.from(articles);
    const [moved] = newArticles.splice(result.source.index, 1);
    newArticles.splice(result.destination.index, 0, moved);

    const updated = newArticles.map((art, index) => ({ ...art, Order: index + 1 }));
    setArticles(updated);

    try {
      await updateArticleOrder(updated);
      message.success("Article order updated!");
    } catch (err: any) {
      message.error("Failed to update order: " + err.message);
    }
  };

  if (loading) {
    return (
      <div>
        <Headers />
        <div className="loading-container-article">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Headers />
      <div className="health-dashboard-article">
        <div className="page-header-article">
          <h2 className="page-title-article">📝 จัดการบทความ</h2>
        </div>

        <div className="add-article-section-article">
          <AddArticle
            adminID={currentAdminID}
            onSuccess={fetchArticles}
          />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="articles">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="articles-grid-article"
              >
                {articles.map((article, index) => (
                  <Draggable key={article.ID} draggableId={article.ID.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="article-card-wrapper-article"
                      >
                        <Card
                          key={article.ID}
                          hoverable
                          className={`article-card-article ${article.Published
                              ? "published-card-article"
                              : "unpublished-card-article"
                            }`}
                          cover={
                            article.Image ? (
                              <div className="card-image-container-article">
                                <img
                                  alt={article.Title}
                                  src={article.Image.startsWith("http")
                                    ? article.Image
                                    : `http://localhost:8000/${article.Image}`}
                                  className="card-image-article"
                                />
                              </div>
                            ) : (
                              <div className="no-image-placeholder-article">
                                <span>📷 No Image</span>
                              </div>
                            )
                          }
                        >
                          {/* ปุ่มเผยแพร่เป็นวงกลม มุมบนขวา */}
                          <Button
                            shape="circle"
                            size="small"
                            className={`publish-button-article ${article.Published
                                ? "published-button-article"
                                : "unpublished-button-article"
                              }`}
                            onClick={() =>
                              article.Published
                                ? handleUnpublish(article.ID)
                                : handlePublish(article.ID)
                            }
                          />

                          <Meta
                            title={<span className="card-title-article">{article.Title}</span>}
                            description={
                              <div className="card-description-article">
                                <p className="card-info-article">{article.Information}</p>
                                <div className="card-reference-article">
                                  <small>แหล่งอ้างอิง: {article.Reference}</small>
                                </div>
                                {article.PublishDate && (
                                  <div className={`publish-date-article ${article.Published ? "published-date-article" : "unpublished-date-article"
                                    }`}>
                                    <small>
                                      วันที่เผยแพร่ล่าสุด: {moment(article.PublishDate).format("DD/MM/YYYY HH:mm")}
                                    </small>
                                  </div>
                                )}
                              </div>
                            }
                          />

                          {/* ปุ่มแก้ไขและลบ */}
                          <div className="card-actions-article">
                            <Button
                              type="link"
                              className="edit-button-article"
                              onClick={() => setEditing(article)}
                            >
                              ✏️ Edit
                            </Button>

                            <Popconfirm
                              title="ยืนยันการลบบทความ?"
                              onConfirm={() => handleDelete(article.ID)}
                              okText="ใช่"
                              cancelText="ยกเลิก"
                              placement="topRight"
                            >
                              {/* เปลี่ยน type เป็น "default" หรือ "text" แทน "link" */}
                              <Button
                                type="text"
                                danger
                                className="delete-button-article"
                              >
                                🗑️ Delete
                              </Button>
                            </Popconfirm>
                          </div>

                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Modal แก้ไข */}
        {editing && (
          <EditArticle
            article={editing}
            visible={true}
            onClose={() => setEditing(null)}
            onSuccess={fetchArticles}
          />
        )}
      </div>
    </div>
  );
};

export default ArticlePage;