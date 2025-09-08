import React from "react";
import { Modal, Avatar, Tag } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  RadiusUprightOutlined,
  CrownOutlined
} from "@ant-design/icons";
import { UsersInterface } from "../../../../interface/profile_interface/IProfile";
import dayjs from "dayjs";
import "./viewUser.css";

interface ViewUserProps {
  open: boolean;
  onCancel: () => void;
  userData: UsersInterface;
}

const ViewUser: React.FC<ViewUserProps> = ({ open, onCancel, userData }) => {
  const getGenderInfo = (genderID: number) => {
    switch (genderID) {
      case 1:
        return { text: "ชาย", icon: <ManOutlined />, color: "blue" };
      case 2:
        return { text: "หญิง", icon: <WomanOutlined />, color: "pink" };
      default:
        return { text: "ไม่ระบุ", icon: <UserOutlined />, color: "default" };
    }
  };

  const getRoleInfo = (roleID: number) => {
    switch (roleID) {
      case 1:
        return { text: "Admin", color: "purple" };
      case 2:
        return { text: "User", color: "green" };
      default:
        return { text: "ไม่ระบุ", color: "default" };
    }
  };

  const genderInfo = getGenderInfo(userData.genderID ?? 0);
  const roleInfo = getRoleInfo(userData.RoleID ?? 0);

  const personalInfo = [
    {
      label: "ชื่อผู้ใช้",
      value: userData.username || "N/A",
      icon: <UserOutlined />
    },
    {
      label: "อีเมล",
      value: userData.email || "N/A",
      icon: <MailOutlined />
    },
    {
      label: "เบอร์โทร",
      value: userData.phonenumber || "N/A",
      icon: <PhoneOutlined />
    },
    {
      label: "วันเกิด",
      value: userData.birthdate
        ? dayjs(userData.birthdate).format("DD/MM/YYYY")
        : "N/A",
      icon: <CalendarOutlined />
    }
  ];

  const physicalInfo = [
    {
      label: "ส่วนสูง",
      value: userData.height ? `${userData.height} cm` : "N/A",
      icon: <RadiusUprightOutlined  />
    },
    {
      label: "น้ำหนัก",
      value: userData.weight ? `${userData.weight} kg` : "N/A",
      icon: <RadiusUprightOutlined  />
    },
    {
      label: "รอบอก",
      value: userData.bust ? `${userData.bust} cm` : "N/A",
      icon: <RadiusUprightOutlined  />
    },
    {
      label: "รอบเอว",
      value: userData.waist ? `${userData.waist} cm` : "N/A",
      icon: <RadiusUprightOutlined  />
    },
    {
      label: "รอบสะโพก",
      value: userData.hip ? `${userData.hip} cm` : "N/A",
      icon: <RadiusUprightOutlined  />
    }
  ];

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      className="view-user-modal"
      closeIcon={false}
    >
      <div className="view-user-modal-content">
        {/* Header */}
        <div className="view-user-modal-header">
          <div className="view-user-header-content">
            <h2 className="view-user-modal-title">ข้อมูลผู้ใช้</h2>
          </div>
        </div>

        {/* Body */}
        <div className="view-user-modal-body">
          {/* Profile Section */}
          <div className="view-user-profile-section">
            <div className="view-user-profile-avatar">
              <Avatar
                size={120}
                src={
                  userData.profile
                    ? `http://localhost:8000/${userData.profile}`
                    : null
                }
                icon={<UserOutlined />}
                className="view-user-user-avatar"
              />
            </div>
            
            <div className="view-user-profile-info">
              <h3 className="view-user-user-name">
                {`${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "ไม่ระบุชื่อ"}
              </h3>
              
              <div className="view-user-user-tags">
                <Tag 
                  icon={genderInfo.icon} 
                  color={genderInfo.color}
                  className="view-user-info-tag"
                >
                  {genderInfo.text}
                </Tag>
                
                <Tag 
                  icon={<CrownOutlined />} 
                  color={roleInfo.color}
                  className="view-user-info-tag"
                >
                  {roleInfo.text}
                </Tag>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="view-user-details-container">
            {/* Personal Information */}
            <div className="view-user-info-section">
              <h4 className="view-user-section-title">ข้อมูลส่วนตัว</h4>
              <div className="view-user-info-grid">
                {personalInfo.map((item, index) => (
                  <div key={index} className="view-user-info-item">
                    <div className="view-user-info-label">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="view-user-info-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Information */}
            {(userData.height || userData.weight || userData.bust || userData.waist || userData.hip) && (
              <div className="view-user-info-section">
                <h4 className="view-user-section-title">ข้อมูลทางกาย</h4>
                <div className="view-user-info-grid">
                  {physicalInfo.map((item, index) => (
                    item.value !== "N/A" && (
                      <div key={index} className="view-user-info-item">
                        <div className="view-user-info-label">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <div className="view-user-info-value">{item.value}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="view-user-modal-footer">
          <button className="view-user-close-btn" onClick={onCancel}>
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewUser;