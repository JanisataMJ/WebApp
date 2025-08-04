// SuccessPopup.tsx
import React from 'react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>การถอนเงินสำเร็จ</h2>
        <p>การถอนเงินของคุณเสร็จสมบูรณ์แล้ว</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
