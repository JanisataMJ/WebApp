import React, { useState } from 'react';
import './createArticle.css';
import { Form, Input, Button, Radio, DatePicker, Row, Col, Card, message, Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateAdmin } from '../../../../services/https/User/user';
import logo from '../../../../assets/Logo.jpg';
import type { UploadFile, UploadProps } from 'antd';
import moment from 'moment';

interface AddAdminProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const AddArticle: React.FC<AddAdminProps> = ({ open, onCancel, onSuccess }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

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
      formData.append(
        'birthdate',
        values.birth_date ? moment(values.birth_date).format('YYYY-MM-DD') : ''
      );
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
            <img className="logo-create-ad" src={logo} alt="Logo" />
            <h2 className="modal-title-create-ad">Create New Admin</h2>
          </div>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
        className="addadmin-modal-create-ad"
        destroyOnClose
      >
        <div className="addadmin-container-create-ad">
          <Card className="addadmin-card-register-create-ad">
            <Form name="register" layout="vertical" onFinish={onFinish}>
              {/* Upload รูป */}
              <Form.Item label="Profile Picture" className="profile-upload-item-create-ad">
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
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Row gutter={16} className="form-row-create-ad">
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[{ required: true, message: 'Please enter first name!' }]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="Enter first name" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="last_name"
                    rules={[{ required: true, message: 'Please enter last name!' }]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="Enter last name" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16} className="form-row-create-ad">
                <Col span={12}>
                  <Form.Item
                    label="Username"
                    name="user_name"
                    rules={[{ required: true, message: 'Please enter username!' }]}
                    className="form-item-create-ad"
                  >
                    <Input placeholder="Enter username" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter password!' }]}
                    className="form-item-create-ad"
                  >
                    <Input.Password placeholder="Enter password" className="form-input-create-ad" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Invalid email format!' },
                  { required: true, message: 'Please enter email!' },
                ]}
                className="form-item-create-ad"
              >
                <Input placeholder="Enter email" className="form-input-create-ad" />
              </Form.Item>

              <Row gutter={16} className="form-row-create-ad">
                <Col span={12}>
                  <Form.Item
                    label="Gender"
                    name="gender"
                    rules={[{ required: true, message: 'Please select gender!' }]}
                    className="form-item-create-ad"
                  >
                    <Radio.Group className="radio-group-create-ad">
                      <Radio value={1}>Male</Radio>
                      <Radio value={2}>Female</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Birth Date"
                    name="birth_date"
                    rules={[{ required: true, message: 'Please select birth date!' }]}
                    className="form-item-create-ad"
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      placeholder="Select birth date" 
                      className="date-picker-create-ad"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Phone Number"
                name="phonnumber"
                rules={[{ required: true, message: 'Please enter phone number!' }]}
                className="form-item-create-ad"
              >
                <Input placeholder="Enter phone number" className="form-input-create-ad" />
              </Form.Item>

              <Form.Item className="submit-item-create-ad">
                <div className="button-group-create-ad">
                  <Button 
                    onClick={handleCancel} 
                    className="cancel-btn-create-ad"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="confirm-btn-create-ad"
                    loading={loading}
                  >
                    Create Admin
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

export default AddArticle;