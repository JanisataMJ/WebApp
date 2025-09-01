import React, { useState, useEffect } from 'react';
import { Card, Spin, Button, Popconfirm, message } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Headers from '../../../compronents/Pubblic_components/headerselect';
import AddArticle from './create_article/create_article';
import EditArticle from './edit_article/edit_article';
import { ArticleInterface } from '../../../interface/article_interface/article';
import { getAllArticles, deleteArticle, updateArticleOrder } from '../../../services/https/Article/article';
import './article.css';

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

  if (loading) return <Spin size="large" />;

  return (
    <div>
      <Headers />
      <div className="health-dashboard-article p-4">
        <h2>Admin Home</h2>

        <AddArticle
          adminID={currentAdminID}
          onSuccess={fetchArticles} // refresh list after adding
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="articles">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {articles.map((article, index) => (
                  <Draggable key={article.ID} draggableId={article.ID.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card
                          key={article.ID}
                          hoverable
                          cover={
                            article.Image ? (
                              <img
                                alt={article.Title}
                                src={article.Image.startsWith("http") ? article.Image : `http://localhost:8000/${article.Image}`}
                                className="h-48 object-cover"
                              />
                            ) : (
                              <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500">
                                No Image
                              </div>
                            )
                          }
                          actions={[
                            <Button type="link" onClick={() => setEditing(article)}>✏️ แก้ไข</Button>,
                            <Popconfirm
                              title="ยืนยันการลบ?"
                              onConfirm={() => handleDelete(article.ID)}
                              okText="ใช่"
                              cancelText="ยกเลิก"
                            >
                              <Button type="link" danger>🗑️ ลบ</Button>
                            </Popconfirm>,
                          ]}
                        >
                          <Meta
                            title={article.Title}
                            description={
                              <div>
                                <p className="line-clamp-2">{article.Information}</p>
                                <small className="text-gray-500">แหล่งอ้างอิง: {article.Reference}</small>
                              </div>
                            }
                          />
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
