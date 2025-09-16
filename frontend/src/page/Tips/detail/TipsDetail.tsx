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

  if (loading) {
    return (
      <div className="tips-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="tips-detail-not-found">
        <Headers />
        <div className="tips-detail-error-container">
          <h2>ไม่พบบทความ</h2>
          <Link to="/tips" className="tips-detail-back-link">
            กลับไปหน้าบทความ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Headers />
      <div className="tips-detail-page">
        <div className="tips-detail-wrapper">
          <nav className="tips-detail-navigation">
            <Link to="/tips" className="tips-detail-back-button">
              <span className="tips-detail-back-icon">←</span>
              กลับไปหน้าบทความ
            </Link>
          </nav>

          <article className="tips-detail-article">
            <header className="tips-detail-header">
              <h1 className="tips-detail-title">{article.Title}</h1>
              
              {article.PublishDate && (
                <div className="tips-detail-meta">
                  <time 
                    className={`tips-detail-publish-date ${article.Published ? "tips-detail-published" : "tips-detail-unpublished"}`}
                    dateTime={article.PublishDate}
                  >
                    <span className="tips-detail-date-icon">📅</span>
                    {moment(article.PublishDate).format("DD MMMM YYYY • HH:mm")}
                  </time>
                </div>
              )}
            </header>

            {article.Image && (
              <figure className="tips-detail-image-container">
                <img
                  src={article.Image.startsWith("http") ? article.Image : `http://localhost:8000/${article.Image}`}
                  alt={article.Title}
                  className="tips-detail-image"
                />
              </figure>
            )}

            <div className="tips-detail-content">
              <div className="tips-detail-information">
                <p>{article.Information}</p>
              </div>

              {article.Reference && (
                <footer className="tips-detail-reference">
                  <div className="tips-detail-reference-header">
                    <span className="tips-detail-reference-icon">📚</span>
                    <h3>แหล่งอ้างอิง</h3>
                  </div>
                  <p className="tips-detail-reference-text">{article.Reference}</p>
                </footer>
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default TipsDetail;