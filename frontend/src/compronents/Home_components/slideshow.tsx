import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './slideshow.css';
import { Activity, Heart, Droplets, Thermometer, Moon, TrendingUp, Calendar, User, Settings } from 'lucide-react';

type HealthItem = {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgGradient: string;
};

const healthData: HealthItem[] = [
  { 
    icon: Heart, 
    label: "Heart Rate", 
    value: "72", 
    sub: "Normal Range", 
    color: "#ef4444",
    bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
  },
  { 
    icon: Activity, 
    label: "Calorie", 
    value: "2,150", 
    sub: "kcal burned", 
    color: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
  },
  { 
    icon: Droplets, 
    label: "SPO2", 
    value: "98%", 
    sub: "Excellent", 
    color: "#3b82f6",
    bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
  },
  { 
    icon: Moon, 
    label: "Sleep", 
    value: "8h 30m", 
    sub: "Quality: 85%", 
    color: "#6366f1",
    bgGradient: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
  },
  { 
    icon: TrendingUp, 
    label: "Steps", 
    value: "8,500", 
    sub: "Goal: 10,000", 
    color: "#10b981",
    bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
  },
  { 
    icon: Thermometer, 
    label: "Body Temp", 
    value: "36.8°C", 
    sub: "Normal", 
    color: "#f97316",
    bgGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
  }
];

const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % healthData.length);
    }, 4000); // Increased to 4 seconds for more items

    return () => clearInterval(interval);
  }, []);
 
  const getCardPosition = (index: number): string => {
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(healthData.length - 1)) return 'right';
    if (diff === -1 || diff === healthData.length - 1) return 'left';
    if (diff === 2 || diff === -(healthData.length - 2)) return 'far-right';
    if (diff === -2 || diff === healthData.length - 2) return 'far-left';
    return 'hidden';
  };

  const handleCardClick = (index: number): void => {
    setCurrentIndex(index);
  };

  const handlePrevious = (): void => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? healthData.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % healthData.length);
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return now.toLocaleDateString('en-GB', options);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        {/* Header Section */}
        <div className="slider-header">
          <h2 className="slider-title">Health Metrics</h2>
          <div className="date-container">
            <div className="date">{getCurrentDate()}</div>
            <div className="time">{getCurrentTime()}</div>
          </div>
        </div>

        {/* Slider Container */}
        <div className="cards-container">
          {/* Left Arrow */}
          <Button
            className="nav-arrow nav-arrow-left"
            onClick={handlePrevious}
            icon={<LeftOutlined />}
          />

          {healthData.map((item, index) => {
            const position = getCardPosition(index);
            const IconComponent = item.icon;

            return (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`health-card card-${position}`}
                style={{
                  borderColor: position === 'center' ? item.color : '#d1d5db',
                  background: position === 'center' ? item.bgGradient : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
                }}
              >
                {/* Icon Container */}
                <div 
                  className={`card-icon-container ${position === 'center' ? 'icon-center' : 'icon-side'}`}
                  style={{
                    background: position === 'center' ? 
                      `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)` : 
                      'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                  }}
                >
                  <IconComponent 
                    className={`card-icon ${position === 'center' ? 'icon-center-size' : 'icon-side-size'}`}
                    style={{ color: position === 'center' ? item.color : '#6b7280' }}
                  />
                </div>

                {/* Label */}
                <div className={`card-label ${position === 'center' ? 'label-center' : 'label-side'}`}>
                  {item.label}
                </div>

                {/* Value */}
                <div
                  className={`card-value ${position === 'center' ? 'value-center' : 'value-side'}`}
                  style={{ color: position === 'center' ? item.color : '#374151' }}
                >
                  {item.value}
                </div>

                {/* Sub text */}
                {item.sub && position === 'center' && (
                  <div className="card-sub" style={{ color: `${item.color}80` }}>
                    {item.sub}
                  </div>
                )}

                {/* Status Indicator */}
                {position === 'center' && (
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </div>
            );
          })}

          {/* Right Arrow */}
          <Button
            className="nav-arrow nav-arrow-right"
            onClick={handleNext}
            icon={<RightOutlined />}
          />
        </div>

        {/* Navigation Dots */}
        <div className="dots-container">
          {healthData.map((item, index) => (
            <Button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`nav-dot ${index === currentIndex ? 'nav-dot-active' : ''}`}
              style={{
                backgroundColor: index === currentIndex ? item.color : '#d1d5db',
                transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)',
                boxShadow: index === currentIndex ? `0 0 10px ${item.color}40` : 'none'
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar"
            style={{
              background: `linear-gradient(90deg, ${healthData[currentIndex].color} 0%, ${healthData[currentIndex].color}80 100%)`
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Today's Focus</span>
            <span className="stat-value" style={{ color: healthData[currentIndex].color }}>
              {healthData[currentIndex].label}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className="stat-value" style={{ color: healthData[currentIndex].color }}>
              {healthData[currentIndex].sub || 'Monitoring'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;