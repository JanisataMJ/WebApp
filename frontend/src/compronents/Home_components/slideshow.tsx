/*import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Card3 from '../../../แดนโค้ดมรณา/card3';
import './slideshow.css'

function Slider() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

  const slides = [
    {
      name: "ชีวิตที่แสนเหงา",
      imgUrl: 'https://4kwallpapers.com/images/walls/thumbs_3t/9292.jpg',
      views: "1000",
      like: "500",
      tag: "Drama",
      price: 30,
      rate: "13+",
      writer: "John Doe",
      title: "A brief description of this novel..."
    },
    {
      name: "Second slide label",
      imgUrl: 'https://4kwallpapers.com/images/walls/thumbs_3t/9311.png',
      views: "1500",
      like: "700",
      tag: "Adventure",
      price: 30,
      rate: "13+",
      writer: "Jane Doe",
      title: "Another brief description..."
    },
    {
      name: "Third slide label",
      imgUrl: 'https://4kwallpapers.com/images/walls/thumbs_3t/9254.jpg',
      views: "1200",
      like: "800",
      tag: "Thriller",
      price: 30,
      rate: "13+",
      writer: "Alice",
      title: "Yet another description..."
    }
  ];

  const handleSlideClick = (slide: any) => {
    setSelectedSlide(slide);
    setShowModal(true); 
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Carousel>
        {slides.map((slide, index) => (
          <Carousel.Item key={index} interval={1000} onClick={() => handleSlideClick(slide)}>
            <img id='pic' src={slide.imgUrl} alt={slide.name} />
            <Carousel.Caption>
              <h3 id='hd'>{slide.name}</h3>
              <p id='pd'>{slide.title}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>*/

      {/* Modal that shows on slide click */}
      {/* {selectedSlide && (
        <Card3
          card={selectedSlide}
          showModal={showModal}
          handleCloseModal={handleCloseModal}
        />
      )} */}
   /* </>
  );
}

export default Slider;*/

import React, { useState, useEffect } from 'react';

type HealthItem = {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
};

const healthData: HealthItem[] = [
  { icon: "❤️", label: "Heart Rate", value: "138", sub: "70% zone 2", color: "#e74c3c" },
  { icon: "🔥", label: "Calorie", value: "250 kcal", color: "#f39c12" },
  { icon: "🩸", label: "SPO2", value: "96%", color: "#3498db" },
  { icon: "🌙", label: "Sleep", value: "6h 30m", color: "#9b59b6" },
  { icon: "👣", label: "Steps", value: "10,000", color: "#2ecc71" }
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

  return (
    <div className="w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-8 rounded-xl">
      <div className="relative w-full max-w-6xl">
        {/* Date Display */}
        <div className="text-center mb-8">
          <div className="text-lg font-semibold text-gray-700">11 Jul 2025</div>
          <div className="text-md text-gray-500">6:21 P.M.</div>
        </div>

        {/* Slider Container */}
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-active">
          {healthData.map((item, index) => {
            const position = getCardPosition(index);

            return (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`
                  absolute transition-all duration-500 ease-in-out cursor-pointer
                  rounded-full border-4 flex flex-col items-center justify-center
                  transform hover:scale-105
                  ${position === 'center'
                    ? 'w-84 h-84 z-30 scale-100 opacity-100 border-4 shadow-2xl bg-gradient-to-br from-pink-100 to-purple-300'
                    : position === 'left'
                    ? 'w-48 h-48 z-20 -translate-x-70 scale-75 opacity-70 border-gray-300 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg'
                    : position === 'right'
                    ? 'w-48 h-48 z-20 translate-x-70 scale-75 opacity-70 border-gray-300 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg'
                    : 'w-32 h-32 z-10 scale-50 opacity-30'
                  }
                `}
                style={{
                  borderColor: position === 'center' ? item.color : '#d1d5db'
                }}
              >
                {/* Icon */}
                <div className={`text-6xl mb-2 ${position === 'center' ? 'text-6xl' : 'text-4xl'}`}>
                  {item.icon}
                </div>

                {/* Label */}
                <div className={`font-semibold text-gray-700 mb-1 ${position === 'center' ? 'text-xl' : 'text-sm'}`}>
                  {item.label}
                </div>

                {/* Value */}
                <div
                  className={`font-bold ${position === 'center' ? 'text-6xl mb-2' : 'text-2xl'}`}
                  style={{ color: position === 'center' ? item.color : '#6b7280' }}
                >
                  {item.value}
                </div>

                {/* Sub text */}
                {item.sub && position === 'center' && (
                  <div className="text-lg text-gray-600">
                    {item.sub}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-3 mt-8">
          {healthData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-purple-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Swipe Indicators */}
        <div className="flex justify-between absolute top-1/2 left-4 right-4 pointer-events-none">
          <div className="text-gray-400 text-2xl">‹</div>
          <div className="text-gray-400 text-2xl">›</div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
