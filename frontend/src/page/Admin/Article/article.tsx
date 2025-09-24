import React, { useState, useEffect } from 'react';
import { Card, Spin, Button, Popconfirm, message, Tag } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PictureOutlined } from "@ant-design/icons";
import Headers from '../../../compronents/Pubblic_components/headerselect';
import AddArticle from './create_article/create_article';
import EditArticle from './edit_article/edit_article';
import { ArticleInterface } from '../../../interface/article_interface/article';
import {
  getAllArticles,
  deleteArticle,
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
      setArticles(data.sort((a, b) =>
        new Date(b.PublishDate || "").getTime() - new Date(a.PublishDate || "").getTime()
      ));
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

        <div className="articles-grid-article">
          {articles.map((article) => (
            <div
              key={article.ID}
              className="article-card-wrapper-article"
            >
              <Card
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
                      <PictureOutlined style={{ fontSize: 40, color: "#bbb" }} />
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
                    ✏️ แก้ไข
                  </Button>

                  <Popconfirm
                    title="ยืนยันการลบบทความ?"
                    onConfirm={() => handleDelete(article.ID)}
                    okText="ใช่"
                    cancelText="ยกเลิก"
                    placement="topRight"
                  >
                    <Button
                      type="text"
                      danger
                      className="delete-button-article"
                    >
                      🗑️ ลบ
                    </Button>
                  </Popconfirm>
                </div>

              </Card>
            </div>
          ))}
        </div>

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