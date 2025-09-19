import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Select, Upload, Avatar, DatePicker } from "antd";
import { UploadOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { UsersInterface } from '../../../../interface/profile_interface/IProfile';
import { UpdateUsersById } from '../../../../services/https/User/user';
import type { UploadFile, UploadProps } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import moment from 'moment';
import './editAdmin.css';

interface EditAdminModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  adminData: UsersInterface;
}

const EditAdmin: React.FC<EditAdminModalProps> = ({ open, onCancel, onSuccess, adminData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [birthdate, setBirthdate] = useState<string>(
    adminData.birthdate ? moment(adminData.birthdate).format('YYYY-MM-DD') : ''
  );

  useEffect(() => {
    if (adminData) {
      form.setFieldsValue({
        username: adminData.username,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        phonenumber: adminData.phonenumber,
        gender: adminData.genderID,
        birthdate: adminData.birthdate ? moment(adminData.birthdate) : null,
      });

      if (adminData.profile) {
        setPreviewImage(adminData.profile);
        setFileList([{
          uid: '-1',
          name: 'profile.png',
          status: 'done',
          url: adminData.profile
        }]);
      } else {
        setPreviewImage(null);
        setFileList([]);
      }
    }
  }, [adminData, form]);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const beforeUpload = (file: File) => {
    const isValid = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    if (!isValid) {
      messageApi.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 2) {
      messageApi.error('File size must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // prevent auto-upload
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList[0]?.originFileObj) {
      getBase64(newFileList[0].originFileObj).then((img) => setPreviewImage(img));
    } else {
      setPreviewImage(null);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src && file.originFileObj) {
      src = await getBase64(file.originFileObj);
    }
    const imgWindow = window.open(src!);
    imgWindow?.document.write(`<img src="${src}" />`);
  };

  const handleCancelModal = () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage(null);
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("email", values.email);
      formData.append("phonenumber", values.phonenumber);
      formData.append("genderID", values.gender.toString());
      if (birthdate) formData.append("birthdate", birthdate); // <-- ใช้ state ตรงนี้

      if (fileList[0]?.originFileObj) {
        formData.append("profile", fileList[0].originFileObj);
      }

      await UpdateUsersById(String(adminData.ID), formData);

      messageApi.success("แก้ไขข้อมูลสำเร็จ");
      form.resetFields();
      setFileList([]);
      setPreviewImage(null);
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error("Error updating admin:", error);
      messageApi.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {contextHolder}
      <Modal
        title={null}
        open={open}
        onCancel={handleCancelModal}
        footer={null}
        width={800}
        centered
        destroyOnClose
        className="edit-admin-modal"
        closeIcon={<CloseOutlined style={{ fontSize: "18px", color: "#fff" }} />}
        maskClosable={false}
      >
        <div className="edit-admin-modal-content">
          {/* Header */}
          <div className="edit-admin-modal-header">
            <div className="edit-admin-header-content">
              <h2 className="edit-admin-modal-title">จัดการข้อมูลแอดมิน</h2>
            </div>
          </div>

          {/* Body */}
          <div className="edit-admin-modal-body">
            {/* Profile Section */}
            <div className="edit-admin-profile-section">
              <div className="edit-admin-profile-upload-wrapper">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                  beforeUpload={beforeUpload}
                  className="edit-admin-profile-upload"
                  showUploadList={false}
                >
                  <div className="edit-admin-upload-area">
                    {previewImage ? (
                      <Avatar src={previewImage} size={120} />
                    ) : (
                      <div className="edit-admin-upload-placeholder">
                        <UserOutlined className="edit-admin-upload-icon" />
                        <span className="edit-admin-upload-text">เพิ่มรูปภาพ</span>
                      </div>
                    )}
                  </div>
                </Upload>
                <div className="edit-admin-upload-hint">
                  คลิกเพื่อเปลี่ยนรูปโปรไฟล์
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="edit-admin-form-section">
              <Form form={form} layout="vertical" className="edit-admin-form">
                <div className="edit-admin-form-grid">
                  <div className="edit-admin-form-row">
                    <Form.Item
                      label="ชื่อผู้ใช้"
                      name="username"
                      className="edit-admin-form-item"
                      rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
                    >
                      <Input className="edit-admin-form-input" placeholder="ชื่อผู้ใช้" />
                    </Form.Item>
                    <Form.Item
                      label="อีเมล"
                      name="email"
                      className="edit-admin-form-item"
                      rules={[
                        { required: true, message: "กรุณากรอกอีเมล" },
                        { type: "email", message: "กรอกอีเมลไม่ถูกต้อง" }
                      ]}
                    >
                      <Input className="edit-admin-form-input" placeholder="อีเมล" />
                    </Form.Item>

                  </div>

                  <div className="edit-admin-form-row">
                    <Form.Item
                      label="ชื่อจริง"
                      name="firstName"
                      className="edit-admin-form-item"
                      rules={[{ required: true, message: "กรุณากรอกชื่อจริง" }]}
                    >
                      <Input className="edit-admin-form-input" placeholder="ชื่อจริง" />
                    </Form.Item>

                    <Form.Item
                      label="นามสกุล"
                      name="lastName"
                      className="edit-admin-form-item"
                      rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                    >
                      <Input className="edit-admin-form-input" placeholder="นามสกุล" />
                    </Form.Item>
                  </div>

                  <div className="edit-admin-form-row">
                    <Form.Item
                      label="เบอร์โทรศัพท์"
                      name="phonenumber"
                      className="edit-admin-form-item"
                      rules={[
                        { required: true, message: 'กรุณากรอกเบอร์โทร' },
                        { pattern: /^\d{10}$/, message: 'เบอร์โทรต้องมี 10 ตัว' }
                      ]}
                    >
                      <Input className="edit-admin-form-input" placeholder="เบอร์โทรศัพท์" maxLength={10} />
                    </Form.Item>
                    {/* <Form.Item
                      label="วันเกิด"
                      name="birthdate"
                      className="edit-admin-form-item"
                      rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
                    >
                      <input
                        type="date"
                        className="form-input"
                        max={new Date().toISOString().split("T")[0]} // ปิดวันที่อนาคต
                      />
                    </Form.Item> */}
                    <Form.Item
                      label="วันเกิด"
                      rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
                    >
                      <input
                        type="date"
                        className="form-input"
                        max={new Date().toISOString().split("T")[0]}
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                      />
                    </Form.Item>

                  </div>

                  <div className="edit-admin-form-row">
                    <Form.Item
                      label="เพศ"
                      name="gender"
                      className="edit-admin-form-item"
                      rules={[{ required: true, message: 'กรุณาเลือกเพศ' }]}
                    >
                      <select className="form-input">
                        <option value="Male">ผู้ชาย</option>
                        <option value="Female">ผู้หญิง</option>
                      </select>
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>

          </div>

          {/* Footer */}
          <div className="edit-admin-footer">
            <Button
              onClick={handleCancelModal}
              disabled={loading}
              className="edit-admin-cancel-btn"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              onClick={handleOk}
              loading={loading}
              className="edit-admin-save-btn"
            >
              บันทึก
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditAdmin;