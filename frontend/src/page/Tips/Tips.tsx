import React, { useState, useEffect } from 'react';
import { Card, Spin, Input, Select, message } from "antd";
import { Link } from "react-router-dom";
import { ArticleInterface } from "../../interface/article_interface/article";
import { getAllArticles } from "../../services/https/Article/article";
import Headers from '../../compronents/Pubblic_components/headerselect';
import moment from "moment";
import './Tips.css';

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

    // ค้นหาชื่อบทความ
    if (searchText.trim() !== '') {
      data = data.filter(a =>
        a.Title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // เรียงลำดับ
    switch(sortBy) {
      case 'date_desc':
        data.sort((a, b) => (b.PublishDate ? new Date(b.PublishDate).getTime() : 0) - (a.PublishDate ? new Date(a.PublishDate).getTime() : 0));
        break;
      case 'date_asc':
        data.sort((a, b) => (a.PublishDate ? new Date(a.PublishDate).getTime() : 0) - (b.PublishDate ? new Date(b.PublishDate).getTime() : 0));
        break;
      case 'title_asc':
        data.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
      case 'title_desc':
        data.sort((a, b) => b.Title.localeCompare(a.Title));
        break;
    }

    setFilteredArticles(data);
  }, [searchText, sortBy, articles]);

  if (loading) {
    return (
      <div>
        <Headers />
        <div className="health-dashboard">
          <div className="loading-container">
            <Spin size="large" />
            <p className="loading-text">กำลังโหลดบทความ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Headers />
      <div className="health-dashboard-tips">
        <div className="tips-container">
          <div className="tips-header">
            <h2 className="tips-title">📚 บทความสุขภาพ</h2>
            <p className="tips-subtitle">ความรู้และคำแนะนำด้านสุขภาพที่น่าสนใจ</p>
          </div>

          <div className="tips-controls">
            <div className="search-wrapper">
              <Input
                placeholder="🔍 ค้นหาชื่อบทความ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                allowClear
              />
            </div>
            <div className="sort-wrapper">
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value)}
                className="sort-select"
                placeholder="เรียงลำดับตาม"
              >
                <Option value="date_desc">📅 วันที่เผยแพร่: ล่าสุด → เก่า</Option>
                <Option value="date_asc">📅 วันที่เผยแพร่: เก่า → ล่าสุด</Option>
                <Option value="title_asc">🔤 ชื่อบทความ: A → Z</Option>
                <Option value="title_desc">🔤 ชื่อบทความ: Z → A</Option>
              </Select>
            </div>
          </div>

          <div className="articles-count">
            <span>พบบทความทั้งหมด <strong>{filteredArticles.length}</strong> บทความ</span>
          </div>

          <div className="tips-grid">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div key={article.ID} className="article-card-wrapper">
                  <Link to={`/tips/${article.ID}`} className="article-link">
                    <Card
                      hoverable
                      className="article-card"
                      cover={
                        article.Image ? (
                          <div className="image-wrapper">
                            <img
                              alt={article.Title}
                              src={article.Image.startsWith("http") ? article.Image : `http://localhost:8000/${article.Image}`}
                              className="tips-img"
                            />
                            <div className="image-overlay"></div>
                          </div>
                        ) : (
                          <div className="tips-no-img">
                            <div className="no-img-icon">📄</div>
                            <span>ไม่มีรูปภาพ</span>
                          </div>
                        )
                      }
                    >
                      <Meta
                        title={<div className="article-title">{article.Title}</div>}
                        description={
                          <div className="article-description">
                            <p className="article-info">{article.Information}</p>
                            {article.PublishDate && (
                              <div className="publish-date">
                                <span className="date-icon">📅</span>
                                <span className="date-text">
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
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
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