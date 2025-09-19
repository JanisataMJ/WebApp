import React, { useState } from 'react';
import './createAdmin.css';
import { Form, Input, Button, Radio, DatePicker, Row, Col, Card, message, Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateAdmin } from '../../../../services/https/User/user';
import type { UploadFile, UploadProps } from 'antd';
import moment from 'moment';

interface AddAdminProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const AddAdmin: React.FC<AddAdminProps> = ({ open, onCancel, onSuccess }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // <-- เพิ่มตรงนี้

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
    if (!isJpgOrPng) {
      messageApi.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error('Image must smaller than 2MB!');
      return false;
    }
    return false; // prevent auto upload
  };

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src && file.originFileObj) {
      src = await getBase64(file.originFileObj as File);
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', values.user_name);
      formData.append('password', values.password);
      formData.append('email', values.email);
      formData.append('firstName', values.first_name);
      formData.append('lastName', values.last_name);

      if (values.birthdate) {
        formData.append('birthdate', values.birthdate); // เป็น string yyyy-mm-dd จาก input
      }


      formData.append('genderID', values.gender.toString());
      formData.append('phonenumber', values.phonnumber || '');

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('profile', fileList[0].originFileObj);
      }

      const res = await CreateAdmin(formData);
      if (res.status === 201) {
        messageApi.success('Admin created successfully!');
        setTimeout(() => {
          onSuccess?.();
          onCancel();
          // Reset form
          setFileList([]);
        }, 1000);
      } else {
        messageApi.error(res.data.error || 'Error occurred during admin creation');
      }
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.data || error.message);
      messageApi.error(error.response?.data?.error || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    setFileList([]);
    onCancel();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div className="modal-header-create-ad">
            <h2 className="modal-title-create-ad">เพิ่มแอดมินใหม่</h2>
          </div>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={900}
        centered
        className="addadmin-modal-create-ad"
        destroyOnClose
        maskClosable={false}
      >
        <div className="addadmin-container-create-ad">
          <Card className="addadmin-card-register-create-ad">
            <Form name="register" layout="vertical" onFinish={onFinish} form={form}>
              <Row gutter={24} className="form-row-create-ad">
                <Col span={12}>
                  <Form.Item label="รูปภาพ" className="profile-upload-item-create-ad">
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={onChange}
                      onPreview={onPreview}
                      maxCount={1}
                      beforeUpload={beforeUpload}
                      accept="image/png,image/jpeg,image/jpg"
                      className="profile-upload-create-ad"
                    >
                      {fileList.length < 1 && (
                        <div className="upload-placeholder-create-ad">
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="ชื่อผู้ใช้"
                    name="user_name"
                    rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="กรอกชื่อผู้ใช้" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} className="form-row-create-ad">
                <Col span={12}>
                  <Form.Item
                    label="ชื่อ"
                    name="first_name"
                    rules={[{ required: true, message: 'กรุณากรอกชื่อจริง' }]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="กรอกชื่อจริง" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="นามสกุล"
                    name="last_name"
                    rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="กรอกนามสกุล" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} className="form-row-create-ad">
                <Col span={12}>
                  <Form.Item
                    label="อีเมล"
                    name="email"
                    rules={[
                      { type: 'email', message: 'รูปแบบอีเมลผิด' },
                      { required: true, message: 'กรุณากรอกอีเมล' },
                    ]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="Enter email" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="รหัสผ่าน"
                    name="password"
                    rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
                    className="form-item-create-ad"
                  >
                    <Input.Password placeholder="กรอกรหัสผ่าน" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} className="form-row-create-ad">

                <Col span={12}>
                  <Form.Item
                    label="เบอร์โทรศัพท์"
                    name="phonnumber"
                    rules={[
                      { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                      {
                        pattern: /^\d{10}$/, // ตัวเลข 10 หลักพอดี
                        message: 'Phone number must be exactly 10 digits!',
                      },
                    ]}
                    className="form-item-create-ad"
                  >
                    <Input
                      placeholder="กรอกเบอร์โทรศัพท์"
                      className="form-input-create-ad"
                      maxLength={10} // ป้องกันกรอกเกิน
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Birth Date"
                    name="birthdate"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.reject(new Error('Please select birth date!'));

                          const birthDate = new Date(value);
                          const today = new Date();

                          let age = today.getFullYear() - birthDate.getFullYear(); // ใช้ let แทน const
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--; // ตอนนี้แก้ค่าได้
                          }

                          if (age < 18) return Promise.reject(new Error('Admin must be at least 18 years old!'));
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="form-item-create-ad"
                  >
                    <input
                      type="date"
                      className="form-input-create-ad"
                      max={new Date().toISOString().split("T")[0]} // ป้องกันเลือกวันในอนาคต
                    />
                  </Form.Item>
                </Col>

              </Row>

              <Row gutter={24} className="form-row-create-ad">
                <Col span={24}>
                  <Form.Item
                    label="เพศ"
                    name="gender"
                    rules={[{ required: true, message: 'กรุณาเลือกเพศของคุณ' }]}
                    className="form-item-create-ad"
                  >
                    <Radio.Group className="radio-group-create-ad">
                      <Radio value={1}>ผู้ชาย</Radio>
                      <Radio value={2}>ผู้หญิง</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="submit-item-create-ad">
                <div className="button-group-create-ad">
                  <Button
                    onClick={handleCancel}
                    className="cancel-btn-create-ad"
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="confirm-btn-create-ad"
                    loading={loading}
                  >
                    เพิ่มแอดมิน
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Modal>
    </>
  );
};

export default AddAdmin;