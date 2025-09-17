import React, { useState, useEffect } from 'react';
import './Notice.css';
import { Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getNotificationByUserID,
  sendWeeklySummary,
  updateNotificationStatusByID,
} from '../../../services/https/Notification/notification';
import { NotificationInterface } from '../../../interface/notification_interface/notification';
import TestSummaryButton from './testSumButton';

const Notice: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
  const UserID = Number(localStorage.getItem('id'));

  const showModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);  

  // โหลดข้อมูลแจ้งเตือน
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotificationByUserID(UserID);

        // กรอง undefined และใส่ default value
        const safeNotifications = res
          .filter((n): n is NotificationInterface => !!n && !!n.Timestamp)
          .map((n) => ({
            ID: n.ID,
            Timestamp: n.Timestamp || new Date().toISOString(),
            Title: n.Title || '',
            Message: n.Message || '',
            UserID: n.UserID,
            HealthTypeID: n.HealthTypeID,
            NotificationStatusID: n.NotificationStatusID,
            HealthType: n.HealthType || { ID: 0, Type: 'ไม่ระบุ' },
            NotificationStatus: n.NotificationStatus || { ID: n.NotificationStatusID, Status: 'ไม่ทราบสถานะ' },
          }))
          .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());

        setNotifications(safeNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [UserID]);

  // Toggle การเปิด/ปิดข้อความ notification
  const toggleNotification = async (index: number) => {
    const item = notifications[index];
    const newExpanded = expanded === index ? null : index;
    setExpanded(newExpanded);

    if (item.NotificationStatus?.Status === 'ยังไม่อ่าน') {
      try {
       
        const updatedNoti = await updateNotificationStatusByID(item.ID, { status: 1 }); // status = 1

        // ใช้ default value เผื่อ API คืนไม่ครบ
        const safeUpdated = {
          ...updatedNoti,
          NotificationStatus: updatedNoti.NotificationStatus || { ID: 1, Status: 'อ่านแล้ว' },
          HealthType: updatedNoti.HealthType || { ID: 0, Type: 'ไม่ระบุ' },
        };

        setNotifications((prev) =>
          prev.map((n, i) => (i === index ? safeUpdated : n))
        );
      } catch (err) {
        console.error('Failed to update status', err);
      }
    }
  };

  const getHealthTypeClass = (type?: string) => {
    switch (type) {
      case 'ปลอดภัย':
        return 'safe';
      case 'เตือน':
        return 'warning';
      case 'อันตราย':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'ยังไม่อ่าน':
        return 'unread';
      case 'อ่านแล้ว':
        return 'readed';
      case 'เก็บถาวร':
        return 'archived';
      default:
        return 'default';
    }
  };

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

            {/* ปุ่มส่ง Weekly Summary */}
            <div className="test-button">
              <TestSummaryButton
                onSent={async () => {
                  const res = await getNotificationByUserID(UserID);
                  const safeNotifications = res
                    .filter((n): n is NotificationInterface => !!n && !!n.Timestamp)
                    .map((n) => ({
                      ID: n.ID,
                      Timestamp: n.Timestamp || new Date().toISOString(),
                      Title: n.Title || '',
                      Message: n.Message || '',
                      UserID: n.UserID,
                      HealthTypeID: n.HealthTypeID,
                      NotificationStatusID: n.NotificationStatusID,
                      HealthType: n.HealthType || { ID: 0, Type: 'ไม่ระบุ' },
                      NotificationStatus: n.NotificationStatus || { ID: n.NotificationStatusID, Status: 'ไม่ทราบสถานะ' },
                    }))
                    .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());

                  setNotifications(safeNotifications);
                }}
              />
            </div>

            {/* เนื้อหาที่ scroll ได้ */}
            <div className="modal-body-noti">
              {notifications
                .filter((item): item is NotificationInterface => !!item && !!item.Timestamp)
                .map((item, index) => {
                  const date = new Date(item.Timestamp);
                  const formattedDate = date.toLocaleDateString('th-TH', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = date.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });

                  return (
                    <div key={index} className="text-box-noti">
                      <div className="title-row-noti">
                        <div className="title-left-noti">
                          <h4 className="title-noti">{item.Title}</h4>
                          <span
                            className={`health-type health-type-${getHealthTypeClass(
                              item.HealthType?.Type
                            )}`}
                          >
                            {item.HealthType?.Type}
                          </span>
                        </div>
                        <div className="title-right-noti">
                          <div className="datetime-container">
                            <div className="date-display">{formattedDate}</div>
                            <div className="time-display">{formattedTime}</div>
                            <div
                              className={`status-display status-${getStatusClass(
                                item.NotificationStatus?.Status
                              )}`}
                            >
                              {item.NotificationStatus?.Status}
                            </div>
                          </div>

                          {/* ปุ่มเปิด/ปิดข้อความ */}
                          <button onClick={() => toggleNotification(index)}>
                            {expanded === index ? <ChevronUp /> : <ChevronDown />}
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
