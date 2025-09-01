import React from "react";
import { Modal, Descriptions, Avatar } from "antd";
import { UsersInterface } from "../../../../interface/profile_interface/IProfile";
import dayjs from "dayjs";

interface ViewUserProps {
  open: boolean;
  onCancel: () => void;
  userData: UsersInterface;
}

const ViewUser: React.FC<ViewUserProps> = ({ open, onCancel, userData }) => {
  return (
    <Modal
      title="รายละเอียดผู้ใช้"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div className="view-user-container">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Avatar
            size={100}
            src={
              userData.profile
                ? `http://localhost:8000/${userData.profile}`
                : "/default-avatar.png"
            }
          />
          <h3 style={{ marginTop: 10 }}>{`${userData.firstName || ""} ${
            userData.lastName || ""
          }`}</h3>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="ชื่อผู้ใช้">
            {userData.username || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="อีเมล">
            {userData.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="เบอร์โทร">
            {userData.phonenumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="วันเกิด">
            {userData.birthdate
              ? dayjs(userData.birthdate).format("DD/MM/YYYY")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="เพศ">
            {userData.genderID === 1
              ? "ชาย"
              : userData.genderID === 2
              ? "หญิง"
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="ส่วนสูง">
            {userData.height ? `${userData.height} cm` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="น้ำหนัก">
            {userData.weight ? `${userData.weight} kg` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="รอบอก">
            {userData.bust ? `${userData.bust} cm` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="รอบเอว">
            {userData.waist ? `${userData.waist} cm` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="รอบสะโพก">
            {userData.hip ? `${userData.hip} cm` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            {userData.RoleID === 1
              ? "Admin"
              : userData.RoleID === 2
              ? "User"
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default ViewUser;
