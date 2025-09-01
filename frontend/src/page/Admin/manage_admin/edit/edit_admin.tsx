import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import { UsersInterface } from '../../../../interface/profile_interface/IProfile';
import { UpdateUsersById } from '../../../../services/https/User/user';
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

  useEffect(() => {
    if (adminData) {
      form.setFieldsValue({
        user_name: adminData.user_name,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        email: adminData.email,
        phonnumber: adminData.phone,
        gender: adminData.gender,
        birth_date: adminData.birth_date,
      });
    }
  }, [adminData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await UpdateUsersById(String(adminData.ID), values);
      messageApi.success("แก้ไขข้อมูลสำเร็จ");
      if (onSuccess) onSuccess();
      onCancel(); // ปิด modal
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
        title="แก้ไขแอดมิน"
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="ชื่อผู้ใช้" name="user_name" rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="ชื่อ" name="first_name" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="นามสกุล" name="last_name" rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="อีเมล" name="email" rules={[{ type: "email", message: "กรอกอีเมลไม่ถูกต้อง" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="เบอร์โทร" name="phonnumber">
            <Input />
          </Form.Item>
          <Form.Item label="เพศ" name="gender">
            <Select>
              <Select.Option value={1}>ชาย</Select.Option>
              <Select.Option value={2}>หญิง</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="วันเกิด" name="birth_date">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditAdmin;

