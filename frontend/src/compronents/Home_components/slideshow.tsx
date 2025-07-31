import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './slideshow.css';

type HealthItem = {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
};

const healthData: HealthItem[] = [
  { icon: "❤️", label: "Heart Rate", value: "138", sub: "70% zone 2", color: "#934A5E" },
  { icon: "🔥", label: "Calorie", value: "250 kcal", color: "#934A5E" },
  { icon: "🩸", label: "SPO2", value: "96%", color: "#934A5E" },
  { icon: "🌙", label: "Sleep", value: "6h 30m", color: "#934A5E" },
  { icon: "👣", label: "Steps", value: "10,000", color: "#934A5E" }
];

const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % healthData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCardPosition = (index: number): string => {
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(healthData.length - 1)) return 'right';
    if (diff === -1 || diff === healthData.length - 1) return 'left';
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

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        {/* Date Display */}
        <div className="date-container">
          <div className="date">11 Jul 2025</div>
          <div className="time">6:21 P.M.</div>
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

            return (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`card card-${position}`}
                style={{
                  borderColor: position === 'center' ? item.color : '#d1d5db'
                }}
              >
                {/* Icon */}
                <div className={`card-icon ${position === 'center' ? 'icon-center' : 'icon-side'}`}>
                  {item.icon}
                </div>

                {/* Label */}
                <div className={`card-label ${position === 'center' ? 'label-center' : 'label-side'}`}>
                  {item.label}
                </div>

                {/* Value */}
                <div
                  className={`card-value ${position === 'center' ? 'value-center' : 'value-side'}`}
                  style={{ color: position === 'center' ? item.color : '#6b7280' }}
                >
                  {item.value}
                </div>

                {/* Sub text */}
                {item.sub && position === 'center' && (
                  <div className="card-sub">
                    {item.sub}
                  </div>
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
              className="nav-dot"
              style={{
                backgroundColor: index === currentIndex ? item.color : '#D1D5DB',
                transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;