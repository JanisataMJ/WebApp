import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spin } from "antd";
import { ArticleInterface } from "../../../interface/article_interface/article";
import { getArticleByID } from "../../../services/https/Article/article";
import "./TipsDetail.css";
import Headers from '../../../compronents/Pubblic_components/headerselect';
import moment from "moment";

const TipsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (id) {
          const data = await getArticleByID(Number(id));
          setArticle(data);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <Spin size="large" />;
  if (!article) return <p>ไม่พบบทความ</p>;

  return (
    <>
      <Headers />
      <div className="tips-detail-dashboard">
        <div className="tips-detail-container">
          <Link to="/tips" className="tips-back">⬅️ กลับไปหน้าบทความ</Link>
          
          <h1 className="tips-detail-title">{article.Title}</h1>

          {article.PublishDate && (
            <p className={`tips-publish-date ${article.Published ? "published" : "unpublished"}`}>
              วันที่เผยแพร่: {moment(article.PublishDate).format("YYYY-MM-DD HH:mm")}
            </p>
          )}

          {article.Image && (
            <img
              src={article.Image.startsWith("http") ? article.Image : `http://localhost:8000/${article.Image}`}
              alt={article.Title}
              className="tips-detail-img"
            />
          )}

          <p className="tips-detail-info">{article.Information}</p>
          <p className="tips-detail-ref">📌 แหล่งอ้างอิง: {article.Reference}</p>
        </div>
      </div>
    </>
  );
};

export default TipsDetail;
