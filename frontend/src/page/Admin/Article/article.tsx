import React, { useState, useRef } from 'react';
import { GripVertical, Plus, Trash2, Edit3, Eye, Settings, Save, RotateCcw, Layout, Image, Type, Calendar, User } from 'lucide-react';
import './article.css';
import Headers from '../../../compronents/Pubblic_components/headerselect';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishDate: string;
  image: string;
  readTime: string;
}

interface SectionSettings {
  showImage?: boolean;
  showExcerpt?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  overlayColor?: string;
  columns?: number;
  compact?: boolean;
  imageSize?: 'small' | 'medium' | 'large';
}

interface LayoutSection {
  id: string;
  type: 'hero' | 'grid' | 'list' | 'sidebar' | 'card';
  title: string;
  width: number;
  height: number;
  articles: Article[];
  settings: SectionSettings;
}

const Articles: React.FC = () => {
  const [articles] = useState<Article[]>([
    { 
      id: 1, 
      title: 'การพัฒนาเทคโนโลยี AI ในปี 2024',
      excerpt: 'ความก้าวหน้าของปัญญาประดิษฐ์ที่เปลี่ยนโลก การใช้งาน AI ในชีวิตประจำวันและผลกระทบต่ออนาคต',
      category: 'เทคโนโลยี',
      author: 'สมชาย ใจดี',
      publishDate: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      readTime: '5 นาที'
    },
    {
      id: 2,
      title: 'เทคนิคการเดินทางประหยัดในไทย',
      excerpt: 'คู่มือการเดินทางที่จะช่วยให้คุณประหยัดค่าใช้จ่าย พร้อมเคล็ดลับสำคัญ',
      category: 'ท่องเที่ยว',
      author: 'สุดา มีสุข',
      publishDate: '2024-03-14',
      image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&h=400&fit=crop',
      readTime: '7 นาที'
    },
    {
      id: 3,
      title: 'สูตรอาหารไทยโบราณที่หายไป',
      excerpt: 'ค้นพบความอร่อยที่สืบทอดมาจากบรรพบุรุษ รสชาติต้นตำรับที่หาไม่ได้แล้ว',
      category: 'อาหาร',
      author: 'พิมพ์ใจ กินดี',
      publishDate: '2024-03-13',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
      readTime: '4 นาที'
    },
    {
      id: 4,
      title: 'การออกกำลังกายที่บ้านอย่างมีประสิทธิภาพ',
      excerpt: 'เคล็ดลับการออกกำลังกายโดยไม่ต้องไปยิม ท่าออกกำลังกายง่ายๆ ที่บ้าน',
      category: 'สุขภาพ',
      author: 'วิทย์ แข็งแรง',
      publishDate: '2024-03-12',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      readTime: '6 นาที'
    },
    {
      id: 5,
      title: 'ศิลปะการถ่ายภาพในยุคดิจิทัล',
      excerpt: 'เทคนิคการถ่ายภาพด้วยสมาร์ทโฟนให้ได้ภาพสวยระดับมืออาชีพ',
      category: 'ศิลปะ',
      author: 'กิตติ จับภาพ',
      publishDate: '2024-03-11',
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop',
      readTime: '8 นาที'
    }
  ]);

  const [layoutSections, setLayoutSections] = useState<LayoutSection[]>([
    {
      id: 'hero-section',
      type: 'hero',
      title: 'Hero Section',
      width: 12,
      height: 400,
      articles: [articles[0]],
      settings: { showImage: true, showExcerpt: true, overlayColor: 'rgba(87, 100, 142, 0.7)' }
    },
    {
      id: 'featured-section',
      type: 'grid',
      title: 'Featured Articles',
      width: 12,
      height: 350,
      articles: [articles[1], articles[2], articles[3]],
      settings: { columns: 3, showDate: true, showAuthor: true, showImage: true }
    },
    {
      id: 'latest-section',
      type: 'list',
      title: 'Latest Articles',
      width: 8,
      height: 450,
      articles: [articles[2], articles[3], articles[4]],
      settings: { compact: false, showImage: true, showDate: true }
    },
    {
      id: 'sidebar-section',
      type: 'sidebar',
      title: 'Popular Articles',
      width: 4,
      height: 450,
      articles: [articles[0], articles[1], articles[4]],
      settings: { showImage: true, imageSize: 'small', compact: true }
    }
  ]);

  const [draggedArticle, setDraggedArticle] = useState<Article | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<LayoutSection | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Drag and Drop handlers
  const handleArticleDragStart = (e: React.DragEvent, article: Article) => {
    setDraggedArticle(article);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleArticleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (draggedArticle) {
      setLayoutSections(prev => 
        prev.map(section => 
          section.id === targetSectionId
            ? { ...section, articles: [...section.articles, draggedArticle] }
            : section
        )
      );
      setDraggedArticle(null);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSection) {
      const draggedIndex = layoutSections.findIndex(s => s.id === draggedSection);
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const newSections = [...layoutSections];
        const [draggedItem] = newSections.splice(draggedIndex, 1);
        newSections.splice(targetIndex, 0, draggedItem);
        setLayoutSections(newSections);
      }
      setDraggedSection(null);
    }
  };

  const removeArticleFromSection = (sectionId: string, articleId: number) => {
    setLayoutSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, articles: section.articles.filter(a => a.id !== articleId) }
          : section
      )
    );
  };

  const updateSectionSettings = (sectionId: string, newSettings: Partial<SectionSettings>) => {
    setLayoutSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, settings: { ...section.settings, ...newSettings } }
          : section
      )
    );
  };

  const addNewSection = (type: LayoutSection['type']) => {
    const newSection: LayoutSection = {
      id: `section-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      width: type === 'sidebar' ? 4 : 12,
      height: 300,
      articles: [],
      settings: { showImage: true, showDate: true }
    };
    setLayoutSections(prev => [...prev, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setLayoutSections(prev => prev.filter(s => s.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const renderArticleCard = (article: Article, isDraggable = true) => (
    <div
      key={article.id}
      className="article-card"
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && handleArticleDragStart(e, article)}
    >
      <img src={article.image} alt={article.title} className="article-image" />
      <div className="article-content">
        <span className="article-category">{article.category}</span>
        <h4 className="article-title">{article.title}</h4>
        <p className="article-excerpt">{article.excerpt}</p>
        <div className="article-meta">
          <span className="article-author">โดย {article.author}</span>
          <span className="article-date">{article.publishDate}</span>
          <span className="article-read-time">{article.readTime}</span>
        </div>
      </div>
    </div>
  );

  const renderHeroSection = (section: LayoutSection) => {
    const article = section.articles[0];
    if (!article) return <div className="empty-section">ลากบทความมาที่นี่</div>;

    return (
      <div className="hero-section" style={{ height: section.height }}>
        <div className="hero-image-container">
          <img src={article.image} alt={article.title} className="hero-image" />
          <div className="hero-overlay" style={{ background: section.settings.overlayColor }}>
            <div className="hero-content">
              <span className="hero-category">{article.category}</span>
              <h1 className="hero-title">{article.title}</h1>
              {section.settings.showExcerpt && (
                <p className="hero-excerpt">{article.excerpt}</p>
              )}
              <div className="hero-meta">
                <span>โดย {article.author}</span>
                <span>{article.publishDate}</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGridSection = (section: LayoutSection) => (
    <div 
      className="grid-section" 
      style={{ 
        height: section.height,
        gridTemplateColumns: `repeat(${section.settings.columns || 2}, 1fr)`
      }}
    >
      {section.articles.map(article => (
        <div key={article.id} className="grid-item">
          <img src={article.image} alt={article.title} className="grid-image" />
          <div className="grid-content">
            <span className="grid-category">{article.category}</span>
            <h3 className="grid-title">{article.title}</h3>
            <p className="grid-excerpt">{article.excerpt}</p>
            {(section.settings.showDate || section.settings.showAuthor) && (
              <div className="grid-meta">
                {section.settings.showAuthor && <span>โดย {article.author}</span>}
                {section.settings.showDate && <span>{article.publishDate}</span>}
                <span>{article.readTime}</span>
              </div>
            )}
          </div>
          <button 
            className="remove-article-btn"
            onClick={() => removeArticleFromSection(section.id, article.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderListSection = (section: LayoutSection) => (
    <div className="list-section" style={{ height: section.height }}>
      {section.articles.map(article => (
        <div key={article.id} className="list-item">
          {section.settings.showImage && (
            <img src={article.image} alt={article.title} className="list-image" />
          )}
          <div className="list-content">
            <span className="list-category">{article.category}</span>
            <h3 className="list-title">{article.title}</h3>
            <p className="list-excerpt">{article.excerpt}</p>
            <div className="list-meta">
              <span>โดย {article.author}</span>
              {section.settings.showDate && <span>{article.publishDate}</span>}
              <span>{article.readTime}</span>
            </div>
          </div>
          <button 
            className="remove-article-btn"
            onClick={() => removeArticleFromSection(section.id, article.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSidebarSection = (section: LayoutSection) => (
    <div className="sidebar-section" style={{ height: section.height }}>
      {section.articles.map(article => (
        <div key={article.id} className="sidebar-item">
          {section.settings.showImage && (
            <img src={article.image} alt={article.title} className="sidebar-image" />
          )}
          <div className="sidebar-content">
            <span className="sidebar-category">{article.category}</span>
            <h4 className="sidebar-title">{article.title}</h4>
            <div className="sidebar-meta">
              <span>{article.readTime}</span>
            </div>
          </div>
          <button 
            className="remove-article-btn"
            onClick={() => removeArticleFromSection(section.id, article.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSection = (section: LayoutSection) => {
    switch (section.type) {
      case 'hero':
        return renderHeroSection(section);
      case 'grid':
        return renderGridSection(section);
      case 'list':
        return renderListSection(section);
      case 'sidebar':
        return renderSidebarSection(section);
      default:
        return <div>Unknown section type</div>;
    }
  };

  return (
    <div><Headers />
      <div className="health-dashboard-article">
        Admin Home
      </div>
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <Layout className="header-icon" />
          <h1>Article Layout Manager</h1>
        </div>
        <div className="header-right">
          <button 
            className={`mode-btn ${!isPreviewMode ? 'active' : ''}`}
            onClick={() => setIsPreviewMode(false)}
          >
            <Edit3 size={16} />
            Edit Mode
          </button>
          <button 
            className={`mode-btn ${isPreviewMode ? 'active' : ''}`}
            onClick={() => setIsPreviewMode(true)}
          >
            <Eye size={16} />
            Preview
          </button>
          <button className="save-btn">
            <Save size={16} />
            Save Layout
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Article Library */}
        {!isPreviewMode && (
          <aside className="article-library">
            <h2>Article Library</h2>
            <div className="article-list">
              {articles.map(article => renderArticleCard(article))}
            </div>
            
            <div className="section-templates">
              <h3>Add New Section</h3>
              <div className="template-buttons">
                <button onClick={() => addNewSection('hero')} className="template-btn">
                  <Image size={16} />
                  Hero
                </button>
                <button onClick={() => addNewSection('grid')} className="template-btn">
                  <Layout size={16} />
                  Grid
                </button>
                <button onClick={() => addNewSection('list')} className="template-btn">
                  <Type size={16} />
                  List
                </button>
                <button onClick={() => addNewSection('sidebar')} className="template-btn">
                  <GripVertical size={16} />
                  Sidebar
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Layout Canvas */}
        <main className={`layout-canvas ${isPreviewMode ? 'preview-mode' : ''}`}>
          <div className="layout-grid">
            {layoutSections.map((section, index) => (
              <div
                key={section.id}
                className={`layout-section ${selectedSection?.id === section.id ? 'selected' : ''}`}
                style={{
                  gridColumn: `span ${section.width}`,
                  minHeight: section.height
                }}
                draggable={!isPreviewMode}
                onDragStart={(e) => !isPreviewMode && handleSectionDragStart(e, section.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => !isPreviewMode && handleArticleDrop(e, section.id)}
                onClick={() => !isPreviewMode && setSelectedSection(section)}
              >
                {!isPreviewMode && (
                  <div className="section-header">
                    <div className="section-title">
                      <GripVertical className="drag-handle" size={16} />
                      <span>{section.title}</span>
                    </div>
                    <div className="section-controls">
                      <button
                        className="control-btn"
                        onClick={() => setSelectedSection(section)}
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        className="control-btn danger"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="section-content">
                  {renderSection(section)}
                </div>

                {!isPreviewMode && section.articles.length === 0 && (
                  <div className="drop-zone">
                    <Plus size={24} />
                    <span>ลากบทความมาที่นี่</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Settings Panel */}
        {!isPreviewMode && selectedSection && (
          <aside className="settings-panel">
            <h3>Section Settings</h3>
            <div className="setting-group">
              <label>Section Title</label>
              <input
                type="text"
                value={selectedSection.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setLayoutSections(prev =>
                    prev.map(s =>
                      s.id === selectedSection.id
                        ? { ...s, title: newTitle }
                        : s
                    )
                  );
                  setSelectedSection({ ...selectedSection, title: newTitle });
                }}
              />
            </div>

            <div className="setting-group">
              <label>Width (Grid Columns)</label>
              <input
                type="range"
                min="1"
                max="12"
                value={selectedSection.width}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value);
                  setLayoutSections(prev =>
                    prev.map(s =>
                      s.id === selectedSection.id
                        ? { ...s, width: newWidth }
                        : s
                    )
                  );
                  setSelectedSection({ ...selectedSection, width: newWidth });
                }}
              />
              <span>{selectedSection.width}/12</span>
            </div>

            <div className="setting-group">
              <label>Height (px)</label>
              <input
                type="number"
                value={selectedSection.height}
                onChange={(e) => {
                  const newHeight = parseInt(e.target.value);
                  setLayoutSections(prev =>
                    prev.map(s =>
                      s.id === selectedSection.id
                        ? { ...s, height: newHeight }
                        : s
                    )
                  );
                  setSelectedSection({ ...selectedSection, height: newHeight });
                }}
              />
            </div>

            {selectedSection.type === 'grid' && (
              <div className="setting-group">
                <label>Columns</label>
                <select
                  value={selectedSection.settings.columns || 2}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { columns: parseInt(e.target.value) })}
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
            )}

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSection.settings.showImage || false}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { showImage: e.target.checked })}
                />
                Show Images
              </label>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSection.settings.showDate || false}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { showDate: e.target.checked })}
                />
                Show Date
              </label>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSection.settings.showAuthor || false}
                  onChange={(e) => updateSectionSettings(selectedSection.id, { showAuthor: e.target.checked })}
                />
                Show Author
              </label>
            </div>

            {selectedSection.type === 'hero' && (
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSection.settings.showExcerpt || false}
                    onChange={(e) => updateSectionSettings(selectedSection.id, { showExcerpt: e.target.checked })}
                  />
                  Show Excerpt
                </label>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
    </div>
  );
};

export default Articles;