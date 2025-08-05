import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, User, Heart, Share2, MessageCircle, ChevronLeft, Filter, TrendingUp, Calendar } from 'lucide-react';
import Headers from '../../compronents/Pubblic_components/headerselect';
<<<<<<< HEAD
import CategoryNav from '../../compronents/Home_components/CategoryNav';
import './Tips.css';
=======
import CategoryNav from '../../compronents/Home_components/Navbar';
<<<<<<< HEAD
import Notification from '../../compronents/Home_components/Notifiation/notice';
>>>>>>> mj
=======
import './Tips.css';
>>>>>>> mj

const Tips = () => {
  type Article = {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    readTime: string;
    category: string;
    date: string;
    likes: number;
    comments: number;
    image: string;
  };
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [savedArticles, setSavedArticles] = useState(new Set());

  // Mock data for articles
  const articles = [
    {
      id: 1,
      title: "10 วิธีการเพิ่มประสิทธิภาพในการทำงาน",
      excerpt: "เทคนิคที่จะช่วยให้คุณทำงานได้อย่างมีประสิทธิภาพมากขึ้น พร้อมเคล็ดลับที่ใช้ได้จริง",
      content: "การทำงานอย่างมีประสิทธิภาพเป็นสิ่งสำคัญในยุคปัจจุบัน ต่อไปนี้คือ 10 วิธีที่จะช่วยเพิ่มประสิทธิภาพการทำงานของคุณ...",
      author: "สมชาย ใจดี",
      readTime: "5 นาที",
      category: "productivity",
      date: "2025-01-15",
      likes: 45,
      comments: 12,
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "เทคนิคการจัดการเวลาสำหรับคนยุคใหม่",
      excerpt: "วิธีการจัดการเวลาที่เหมาะสมกับไลฟ์สไตล์ของคนรุ่นใหม่ที่ต้องรับมือกับความเร่งรีบ",
      content: "การจัดการเวลาในยุคดิจิทัลต้องมีเทคนิคพิเศษ เริ่มจากการตั้งเป้าหมายที่ชัดเจน...",
      author: "ปรีชา สมาร์ท",
      readTime: "7 นาที",
      category: "lifestyle",
      date: "2025-01-10",
      likes: 32,
      comments: 8,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "การลงทุนเบื้องต้นสำหรับมือใหม่",
      excerpt: "คู่มือการลงทุนสำหรับผู้เริ่มต้น ครอบคลุมตั้งแต่พื้นฐานจนถึงกลยุทธ์การลงทุน",
      content: "การลงทุนไม่ได้ยากอย่างที่คิด สิ่งสำคัญคือต้องเข้าใจพื้นฐานและมีแผนการที่ชัดเจน...",
      author: "วิชัย เงินดี",
      readTime: "10 นาที",
      category: "finance",
      date: "2025-01-08",
      likes: 67,
      comments: 15,
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "เคล็ดลับการดูแลสุขภาพในวัยทำงาน",
      excerpt: "วิธีการดูแลตัวเองให้สุขภาพแข็งแรงแม้จะต้องทำงานหนัก รวมเทคนิคออกกำลังกายง่ายๆ",
      content: "การดูแลสุขภาพในวัยทำงานต้องสมดุลระหว่างการทำงานและการพักผ่อน เริ่มจากการออกกำลังกายเบาๆ...",
      author: "หมอหญิง สุขใจ",
      readTime: "6 นาที",
      category: "health",
      date: "2025-01-05",
      likes: 89,
      comments: 23,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
    }
  ];

  const categories = [
    { id: 'all', name: 'ทั้งหมด', icon: BookOpen },
    { id: 'productivity', name: 'ประสิทธิภาพ', icon: TrendingUp },
    { id: 'lifestyle', name: 'ไลฟ์สไตล์', icon: Heart },
    { id: 'finance', name: 'การเงิน', icon: Calendar },
    { id: 'health', name: 'สุขภาพ', icon: User }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (articleId: unknown) => {
    const newLikedArticles = new Set(likedArticles);
    if (newLikedArticles.has(articleId)) {
      newLikedArticles.delete(articleId);
    } else {
      newLikedArticles.add(articleId);
    }
    setLikedArticles(newLikedArticles);
  };

  const handleSave = (articleId: unknown) => {
    const newSavedArticles = new Set(savedArticles);
    if (newSavedArticles.has(articleId)) {
      newSavedArticles.delete(articleId);
    } else {
      newSavedArticles.add(articleId);
    }
    setSavedArticles(newSavedArticles);
  };

  if (selectedArticle) {
    return (
      <div><Headers />
        <div className='category-tips'><CategoryNav /></div>
        <div className="health-dashboard">
      <div className="min-h-screen bg-transparent">
        {/* Article Header */}
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              กลับไปหน้าบทความ
            </button>
          </div>
        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 ">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-64 object-cover"
            />
            
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime}
                </span>
                <span>{selectedArticle.date}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedArticle.title}
              </h1>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
                <p className="text-xl text-gray-600 mb-6">{selectedArticle.excerpt}</p>
                <p>{selectedArticle.content}</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              </div>

              {/* Article Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(selectedArticle.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      likedArticles.has(selectedArticle.id)
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${likedArticles.has(selectedArticle.id) ? 'fill-current' : ''}`}
                    />
                    {selectedArticle.likes + (likedArticles.has(selectedArticle.id) ? 1 : 0)}
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {selectedArticle.comments}
                   </button>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Share2 className="w-5 h-5" />
                    แชร์
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div><Headers />
      <div className='category-tips'><CategoryNav /></div>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> mj
      <div className="health-dashboard">
    <div className="min-h-screen bg-transparent">
      {/* Header Section */}
      
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p style={{ fontFamily: 'Monospace', fontSize: '40px' }} className="text-3xl font-bold text-gray-900 mb-6">Healthy Tips</p>
          
          {/* Search Bar */}
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="ค้นหาบทความ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-1">
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="article-card"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(article.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      savedArticles.has(article.id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {categories.find(cat => cat.id === article.category)?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(article.id);
                      }}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${likedArticles.has(article.id) ? 'fill-current text-red-600' : ''}`}
                      />
                      {article.likes + (likedArticles.has(article.id) ? 1 : 0)}
                    </button>
                    
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      {article.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบบทความ</h3>
            <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ใหม่</p>
          </div>
        )}
      </div>
<<<<<<< HEAD
=======
      <div className="tips-dashboard"></div>
      <Notification />
>>>>>>> mj
=======
>>>>>>> mj
    </div>
    </div>
  </div>
  );
};

export default Tips;