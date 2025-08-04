import React from "react";
import styled from "styled-components";

const Tooltip = () => {
  return (
    <StyledWrapper>
      <div className="tooltip-container">
        <div className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="50"
            height="50"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.518 0-10-4.482-10-10s4.482-10 10-10 10 4.482 10 10-4.482 10-10 10zm-1-16h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>
        <div className="tooltip">
          <p>Wow you have a good taste!</p>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`


/* Tooltip container */
.tooltip-container {
  position: relative;
  display: inline-block;
  margin: 20px;
}

/* Icon styling */
.icon {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    filter 0.3s ease;
}

/* SVG Animation: Rotate and scale effect */
.icon svg {
  transition: transform 0.5s ease-in-out;
}

.icon:hover svg {
  transform: rotate(360deg) scale(1.2);
}

/* Tooltip styling */
.tooltip {
  visibility: hidden;
  width: 200px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  bottom: 125%; /* Position above the icon */
  left: 50%;
  margin-left: -100px; /* Center the tooltip */
  opacity: 0;
  transition:
    opacity 0.5s,
    transform 0.5s;
  transform: translateY(10px);
}

/* Tooltip Arrow */
.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

/* Show tooltip on hover */
.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  animation: bounce 0.6s ease;
}

`;

export default Tooltip;
