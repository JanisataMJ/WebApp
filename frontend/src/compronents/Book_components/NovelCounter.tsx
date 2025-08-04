import React, { useState } from 'react';
import './NovelCounter.css';
import { BiBook } from "react-icons/bi";

interface NovelCounterProps {
  count: number;
}

const getRandomColor = () => {
  const colors = [
    '#FF5733', // Red
    '#FFBD33', // Yellow
    '#FF33A1', // Pink
    '#33FF57', // Green
    '#33A1FF', // Blue
    '#A133FF', // Purple
    '#FF33D4', // Magenta
    '#FF8C33', // Orange
    '#33FFF6', // Cyan
    '#FF33A8', // Coral
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const NovelCounter: React.FC<NovelCounterProps> = ({ count }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1000); // Reset animation after 1 second
  };

  return (
    <div>
      <div className="novel-counter" onClick={handleClick}>
        <div className='text_counter'>
          <BiBook className="book-icon" />
          <span className="counter-text">Total Novels: {count}</span>
        </div>
      </div>
      {isClicked && (
        <div className="falling-books">
          {Array.from({ length: 20 }).map((_, index) => {
            const randomX = Math.random() * 100; // Random horizontal position
            const randomDuration = Math.random() * 1 + 1; // Random duration between 1s and 2s
            const randomDelay = Math.random() * 0.5; // Random delay
            const randomColor = getRandomColor(); // Random rainbow color
            return (
              <BiBook
                key={index}
                className="tiny-book"
                style={{
                  left: `${randomX}vw`, // Random position
                  animationDuration: `${randomDuration}s`,
                  animationDelay: `${randomDelay}s`,
                  color: randomColor, // Set random color
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NovelCounter;
