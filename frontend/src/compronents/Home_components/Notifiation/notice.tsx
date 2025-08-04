import React, { useState } from 'react';
import './Notice.css';
import { Mail, X, ChevronDown, ChevronUp } from 'lucide-react';

const Notice: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Create current date with international formatting
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <>
      {/* Floating Button */}
      <button 
        className="floating-button"
        onClick={showModal}
      >
        <Mail className="icon-noti" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay-noti">
          <div className="modal-noti">
            
            {/* Modal Body */}
            <div className="modal-body-noti">
              <h2 className="modal-title">Health Warning</h2>
              <p className="modal-subtitle">You can fully customize it!</p>
              
              {/* Content Box */}
              <div className="text-box-noti">
                <div className="title-row-noti">
                  
                  {/* Title Left */}
                  <div className="title-left-noti">
                    <h4 className="title-noti">สรุปสุขภาพประจำวัน</h4>
                  </div>
                  
                  {/* Title Right */}
                  <div className="title-right-noti">
                    <div className="datetime-container">
                      <div className="date-display">{formattedDate}</div>
                      <div className="time-display">{formattedTime}</div>
                    </div>
                    <button
                      className="toggle-button-noti"
                      onClick={() => setExpanded(!expanded)}
                      aria-label="Expand or collapse"
                    >
                      {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Content */}
                {expanded && (
                  <div className="detail-container">
                    <p className="detail-noti">
                      วันนี้ร่างกายของคุณอยู่ในเกณฑ์ดี โดยเฉพาะการเต้นของหัวใจและระดับออกซิเจนในเลือด แต่ควรเพิ่มการนอนหลับและลดความเครียดเพื่อสุขภาพที่ยั่งยืน
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button 
              className="close-noti"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Notice;