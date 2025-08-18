import React from 'react';
import '../Register/register.css';
import { Form, Input, Button, Radio, DatePicker, Row, Col, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Headers from '../../../compronents/Pubblic_components/headerselect';
import { CreateUser } from '../../../services/https/User/user';
import moment from 'moment';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    // Map form values to backend payload
    const formattedValues = {
      username: values.user_name,
      password: values.password,
      email: values.email,
      firstName: values.first_name,
      lastName: values.last_name,
      birthdate: values.birth_date ? values.birth_date.toISOString() : undefined,
      genderID: values.gender, // 1, 2, 3
    };

    console.log('Data to send to API:', formattedValues);

    try {
      const res = await CreateUser(formattedValues);
      if (res.status === 201) {
        messageApi.success('Sign up successful!');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        messageApi.error(res.data.error || 'Error occurred during sign up');
      }
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      messageApi.error(error.response?.data?.error || 'Failed to connect to API');
    }
  };

  return (
    <>
      {contextHolder}
      <Headers />

      <div className="signup-page-wrapper">
        <h1 className="signup-title">Sign Up</h1>
        <div className="signup-container">
          <Card className="signup-card-register" style={{ width: '100%', maxWidth: 600 }}>
            <Form name="register" layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[{ required: true, message: 'Please enter your first name!' }]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="last_name"
                    rules={[{ required: true, message: 'Please enter your last name!' }]}
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Username"
                    name="user_name"
                    rules={[{ required: true, message: 'Please enter your username!' }]}
                  >
                    <Input placeholder="Enter your username" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password!' }]}
                  >
                    <Input.Password placeholder="Enter your password" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Invalid email format!' },
                  { required: true, message: 'Please enter your email!' },
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Please select your gender!' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Male</Radio>
                  <Radio value={2}>Female</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Birth Date"
                name="birth_date"
                rules={[{ required: true, message: 'Please select your birth date!' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Select your birth date" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="signup-submit-btn">
                  Confirm
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Register;
