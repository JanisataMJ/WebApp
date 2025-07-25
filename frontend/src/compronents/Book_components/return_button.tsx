import React from 'react';
import { GoArrowLeft } from 'react-icons/go';
import './return_button.css';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const Button_s: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      <GoArrowLeft className="icon" />
      {text}
    </button>
  );
};

export default Button_s;