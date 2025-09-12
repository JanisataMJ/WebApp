import React, { useState, useEffect } from 'react';
import './Notice.css';
import { Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getNotificationByUserID } from '../../../services/https/Notification/notification';
import { NotificationInterface } from '../../../interface/notification_interface/notification';

const Notice: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);

  const showModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const UserID = Number(localStorage.getItem("id"));
  // ดึงข้อมูลแจ้งเตือนเมื่อโหลด component
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotificationByUserID(UserID); // เรียก API

        // เรียงตาม Timestamp ล่าสุดขึ้นก่อน
        const sorted = res.sort((a: NotificationInterface, b: NotificationInterface) =>
          new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        );

        setNotifications(sorted); // เซ็ตข้อมูลที่เรียงแล้ว
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button className="floating-button" onClick={showModal}>
        <Mail className="icon-noti" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay-noti">
          <div className="modal-noti">
            <h2 className="modal-title">แจ้งเตือนสุขภาพ</h2>
            <p className="modal-subtitle">สุขภาพของคุณสำคัญที่สุด</p>

            {/* เนื้อหาที่ scroll ได้ */}
            <div className="modal-body-noti">

              {/* Loop notifications */}
              {notifications.map((item, index) => {
                const date = new Date(item.Timestamp);
                const formattedDate = date.toLocaleDateString('th-TH', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                const formattedTime = date.toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });

                return (
                  <div key={index} className="text-box-noti">
                    <div className="title-row-noti">
                      <div className="title-left-noti">
                        <h4 className="title-noti">{item.Title}</h4>
                        <span className={`health-type health-type-${item.HealthType?.Type.toLowerCase()}`}>
                          {item.HealthType?.Type}
                        </span>
                      </div>
                      <div className="title-right-noti">
                        <div className="datetime-container">
                          <div className="date-display">{formattedDate}</div>
                          <div className="time-display">{formattedTime}</div>
                          <div className={`status-display status-${item.NotificationStatus?.Status.toLowerCase()}`}>
                            {item.NotificationStatus?.Status}
                          </div>
                        </div>
                        <button
                          className="toggle-button-noti"
                          onClick={() => setExpanded(expanded === index ? null : index)}
                          aria-label="Expand or collapse"
                        >
                          {expanded === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {expanded === index && (
                      <div className="detail-container">
                        <p className="detail-noti">{item.Message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <button className="close-noti" onClick={closeModal}>
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Notice;
