import React, { useState, useEffect } from 'react';
import { Card, Spin, Input, Select, message } from "antd";
import { Link } from "react-router-dom";
import { ArticleInterface } from "../../interface/article_interface/article";
import { getAllArticles } from "../../services/https/Article/article";
import Headers from '../../compronents/Pubblic_components/headerselect';
import moment from "moment";
import './Tips.css';
import 'antd/dist/reset.css'; // สำหรับ v5


const { Meta } = Card;
const { Option } = Select;

const Tips = () => {
  const [articles, setArticles] = useState<ArticleInterface[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc'>('date_desc');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getAllArticles();
        const publishedArticles = data.filter(a => a.Published);
        setArticles(publishedArticles);
        setFilteredArticles(publishedArticles);
      } catch (err) {
        console.error("Error fetching articles:", err);
        message.error("โหลดบทความไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    let data = [...articles];

    // Filter by search text
    if (searchText.trim() !== '') {
      data = data.filter(a =>
        a.Title.toLowerCase().includes(searchText.toLowerCase()) ||
        a.Information.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort data
    switch (sortBy) {
      case 'date_desc':
        data.sort((a, b) => {
          const dateA = a.PublishDate ? new Date(a.PublishDate).getTime() : 0;
          const dateB = b.PublishDate ? new Date(b.PublishDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'date_asc':
        data.sort((a, b) => {
          const dateA = a.PublishDate ? new Date(a.PublishDate).getTime() : 0;
          const dateB = b.PublishDate ? new Date(b.PublishDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'title_asc':
        data.sort((a, b) => a.Title.localeCompare(b.Title, 'th'));
        break;
      case 'title_desc':
        data.sort((a, b) => b.Title.localeCompare(a.Title, 'th'));
        break;
      default:
        break;
    }

    setFilteredArticles(data);
  }, [searchText, sortBy, articles]);

  if (loading) {
    return (
      <div>
        <Headers />
        <div className="health-dashboard-container-tips">
          <div className="loading-spinner-wrapper-tips">
            <Spin size="large" />
            <p className="loading-text-message-tips">กำลังโหลดบทความ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Headers />
      <div className="health-dashboard-container-tips">
        <div className="main-content-wrapper-tips">
          <div className="page-header-section-tips">
            <h2 className="page-main-title-tips">📚 บทความสุขภาพ</h2>
            <p className="page-subtitle-description-tips">ความรู้และคำแนะนำด้านสุขภาพที่น่าสนใจ</p>
          </div>

          <div className="filter-controls-section-tips">
            <div className="search-input-wrapper-tips">
              <Input
                placeholder="🔍 ค้นหาชื่อบทความ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="article-search-input-tips"
                allowClear
                size="large"
              />
            </div>
            <div className="sort-select-wrapper-tips">
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSortBy(e.target.value as 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc')
                }
                className="article-sort-select-tips"
              >
                <option value="date_desc">📅 วันที่เผยแพร่ : ล่าสุด</option>
                <option value="date_asc">📅 วันที่เผยแพร่ : เก่าสุด</option>
                <option value="title_asc">🔤 ชื่อบทความ : A → Z</option>
                <option value="title_desc">🔤 ชื่อบทความ : Z → A</option>
              </select>
            </div>

          </div>

          <div className="articles-count-display-tips">
            <span>พบบทความทั้งหมด <strong>{filteredArticles.length}</strong> บทความ</span>
          </div>

          <div className="articles-grid-layout-tips">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div key={article.ID} className="article-card-container-tips">
                  <Link to={`/tips/${article.ID}`} className="article-card-link-tips">
                    <Card
                      hoverable
                      className="article-display-card-tips"
                      cover={
                        article.Image ? (
                          <div className="article-image-container-tips">
                            <img
                              alt={article.Title}
                              src={article.Image.startsWith("http") ? article.Image : `http://localhost:8000/${article.Image}`}
                              className="article-cover-image-tips"
                            />
                            <div className="image-hover-overlay-tips"></div>
                          </div>
                        ) : (
                          <div className="no-image-placeholder-tips">
                            <div className="no-image-icon-tips">📄</div>
                            <span>ไม่มีรูปภาพ</span>
                          </div>
                        )
                      }
                    >
                      <Meta
                        title={<div className="article-title-text-tips">{article.Title}</div>}
                        description={
                          <div className="article-content-section-tips">
                            <p className="article-description-text-tips">{article.Information}</p>
                            {article.PublishDate && (
                              <div className="publish-date-container-tips">
                                <span className="date-icon-tips">📅</span>
                                <span className="formatted-date-tips">
                                  {moment(article.PublishDate).format("DD MMMM YYYY")}
                                </span>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-results-message-tips">
                <div className="no-results-icon-tips">🔍</div>
                <h3>ไม่พบบทความที่ค้นหา</h3>
                <p>ลองเปลี่ยนคำค้นหาหรือเลือกการเรียงลำดับใหม่</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tips;