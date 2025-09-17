import React from "react";
import styled from "styled-components";

const HealthLoader = () => {
  return (
    <StyledWrapper>
      <div className="loader-container">
        <div className="health-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        <div className="pulse-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        
        <div className="loading-text">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
        
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #E5E5E5 0%, #C2B4D7 50%, #57648E 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .loader-container {
    text-align: center;
    position: relative;
    z-index: 10;
  }

  .health-icon {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    color: #934A5E;
    z-index: 6;

    svg {
      width: 100%;
      height: 100%;
      animation: heartbeat 1.5s ease-in-out infinite;
    }
  }


  .pulse-rings {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    margin-top: -60px;
  }

  .ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid transparent;
    animation: pulse 2s ease-in-out infinite;
  }

  .ring-1 {
    width: 120px;
    height: 120px;
    border-color: rgba(147, 74, 94, 0.3);
    animation-delay: 0s;
  }

  .ring-2 {
    width: 160px;
    height: 160px;
    border-color: rgba(87, 100, 142, 0.2);
    animation-delay: 0.7s;
  }

  .ring-3 {
    width: 200px;
    height: 200px;
    border-color: rgba(194, 180, 215, 0.1);
    animation-delay: 1.4s;
  }

  .loading-text {
    margin-top: 250px;
    margin-bottom: 40px;

    p {
      font-size: 16px;
      color: #57648E;
      margin: 0;
      opacity: 0.8;
    }
  }


  .progress-bar {
    width: 300px;
    height: 4px;
    background: rgba(194, 180, 215, 0.3);
    border-radius: 2px;
    margin: 0 auto 50px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #934A5E, #57648E);
      border-radius: 2px;
      animation: loading 2s ease-in-out infinite;
    }
  }

  .health-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
    
    &:nth-child(1) { animation-delay: 0.2s; }
    &:nth-child(2) { animation-delay: 0.4s; }
    &:nth-child(3) { animation-delay: 0.6s; }
    &:nth-child(4) { animation-delay: 0.8s; }
    
    .stat-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    span {
      font-size: 14px;
      font-weight: 500;
      color: #57648E;
      line-height: 1.3;
    }
  }

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0;
    }
  }

  @keyframes loading {
    0% {
      width: 0%;
      transform: translateX(-100%);
    }
    50% {
      width: 70%;
      transform: translateX(0%);
    }
    100% {
      width: 100%;
      transform: translateX(100%);
    }
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .health-stats {
      grid-template-columns: 1fr;
      max-width: 280px;
    }
    
    .progress-bar {
      width: 250px;
    }
    
    
    .health-icon {
      width: 60px;
      height: 60px;
      margin-bottom: 30px;
    }
    
    .ring-1 { width: 100px; height: 100px; }
    .ring-2 { width: 130px; height: 130px; }
    .ring-3 { width: 160px; height: 160px; }
  }

  @media (max-width: 480px) {
    padding: 20px;
    
    .progress-bar {
      width: 200px;
    }
    
    .stat-item {
      padding: 12px 16px;
      gap: 10px;
      
      .stat-icon {
        width: 32px;
        height: 32px;
        font-size: 20px;
      }
      
      span {
        font-size: 13px;
      }
    }
  }
`;

export default HealthLoader;