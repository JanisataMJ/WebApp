import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import axios from 'axios';
import './slideshow.css';
import { 
  Activity, Heart, Droplets, Thermometer, 
  Moon, TrendingUp 
} from 'lucide-react';

type HealthData = {
  ID: number;
  Timestamp: string;
  Bpm: number;
  Steps: number;
  SleepHours: number;
  CaloriesBurned: number;
  Spo2: number;
  BodyTemp: number;
};

type HealthItem = {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgGradient: string;
};

const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [healthDataList, setHealthDataList] = useState<HealthData[]>([]);
  const [healthItems, setHealthItems] = useState<HealthItem[]>([]);

  // โหลดข้อมูลจาก API Go
  useEffect(() => {
    axios.get<HealthData[]>("http://localhost:8080/health-data")
      .then(res => {
        setHealthDataList(res.data);
        if (res.data.length > 0) {
          setHealthItems(mapHealthData(res.data[0]));
        }
      })
      .catch(err => console.error("Error fetching health data:", err));
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % healthItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [healthItems]);

  // ฟังก์ชัน map ข้อมูลจาก Go → HealthItem[]
  const mapHealthData = (data: HealthData): HealthItem[] => [
    {
      icon: Heart,
      label: "Heart Rate",
      value: data.Bpm.toString(),
      sub: "Normal Range",
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
    },
    {
      icon: Activity,
      label: "Calorie",
      value: data.CaloriesBurned.toFixed(0),
      sub: "kcal burned",
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
    },
    {
      icon: Droplets,
      label: "SPO2",
      value: `${data.Spo2}%`,
      sub: "Excellent",
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
    },
    {
      icon: Moon,
      label: "Sleep",
      value: `${Math.floor(data.SleepHours)}h ${Math.round((data.SleepHours % 1) * 60)}m`,
      sub: "Quality: 85%",
      color: "#6366f1",
      bgGradient: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
    },
    {
      icon: TrendingUp,
      label: "Steps",
      value: data.Steps.toString(),
      sub: "Goal: 10,000",
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
    },
    {
      icon: Thermometer,
      label: "Body Temp",
      value: `${data.BodyTemp.toFixed(1)}°C`,
      sub: "Normal",
      color: "#f97316",
      bgGradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
    }
  ];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? healthItems.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % healthItems.length);
  };

  const getCardPosition = (index: number): string => {
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(healthItems.length - 1)) return 'right';
    if (diff === -1 || diff === healthItems.length - 1) return 'left';
    if (diff === 2 || diff === -(healthItems.length - 2)) return 'far-right';
    if (diff === -2 || diff === healthItems.length - 2) return 'far-left';
    return 'hidden';
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (healthItems.length === 0) {
    return <div>Loading health data...</div>;
  }

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

        {/* Cards */}
        <div className="cards-container">
          <Button className="nav-arrow nav-arrow-left" onClick={handlePrevious} icon={<LeftOutlined />} />

          {healthItems.map((item, index) => {
            const position = getCardPosition(index);
            const IconComponent = item.icon;

            return (
              <div
                key={index}
                className={`health-card card-${position}`}
                style={{
                  borderColor: position === 'center' ? item.color : '#d1d5db',
                  background: position === 'center' ? item.bgGradient : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
                }}
              >
                <div 
                  className={`card-icon-container ${position === 'center' ? 'icon-center' : 'icon-side'}`}
                  style={{
                    background: position === 'center'
                      ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)`
                      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                  }}
                >
                  <IconComponent 
                    className={`card-icon ${position === 'center' ? 'icon-center-size' : 'icon-side-size'}`}
                    style={{ color: position === 'center' ? item.color : '#6b7280' }}
                  />
                </div>

                <div className={`card-label ${position === 'center' ? 'label-center' : 'label-side'}`}>
                  {item.label}
                </div>

                <div
                  className={`card-value ${position === 'center' ? 'value-center' : 'value-side'}`}
                  style={{ color: position === 'center' ? item.color : '#374151' }}
                >
                  {item.value}
                </div>

                {item.sub && position === 'center' && (
                  <div className="card-sub" style={{ color: `${item.color}80` }}>
                    {item.sub}
                  </div>
                )}

                {position === 'center' && (
                  <div className="status-indicator" style={{ backgroundColor: item.color }} />
                )}
              </div>
            );
          })}

          <Button className="nav-arrow nav-arrow-right" onClick={handleNext} icon={<RightOutlined />} />
        </div>

        {/* Dots */}
        <div className="dots-container">
          {healthItems.map((item, index) => (
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
              background: `linear-gradient(90deg, ${healthItems[currentIndex].color} 0%, ${healthItems[currentIndex].color}80 100%)`
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Today's Focus</span>
            <span className="stat-value" style={{ color: healthItems[currentIndex].color }}>
              {healthItems[currentIndex].label}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className="stat-value" style={{ color: healthItems[currentIndex].color }}>
              {healthItems[currentIndex].sub || 'Monitoring'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
