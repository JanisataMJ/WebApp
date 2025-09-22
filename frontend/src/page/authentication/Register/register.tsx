import React from 'react';
import '../Register/register.css';
import { Form, Input, Button, Radio, DatePicker, Row, Col, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CreateUser } from '../../../services/https/User/user';
import moment from 'moment';
import logo from '../../../assets/Logo.jpg';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    // Map form values to backend payload
    const formattedValues = {
      Username: values.user_name,
      Password: values.password,
      Email: values.email,
      FirstName: values.first_name,
      LastName: values.last_name,
      GenderID: values.gender, // 1, 2, 3
      Birthdate: values.birth_date
        ? moment(values.birth_date, 'YYYY-MM-DD').toISOString()
        : undefined
    };

    console.log('Data to send to API:', formattedValues);

    try {
      const res = await CreateUser(formattedValues);
      if (res.status === 201) {
        messageApi.success('Sign up successful!');
        setTimeout(() => {
          navigate('/');
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

      <div className="signup-page-wrapper">
        <a href="/">
          <img id="Logo" src={logo} alt="Logo" />
        </a>
        <h1 className="signup-title">สมัครบัญชีผู้ใช้ใหม่</h1>
        <div className="signup-container">
          <Card className="signup-card-register" style={{ width: '100%', maxWidth: 600 }}>
            <Form name="register" layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="ชื่อ"
                    name="first_name"
                    rules={[{ required: true, message: 'กรุณากรอกชื่อจริง' }]}
                  >
                    <Input placeholder="กรอกชื่อจริง" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="นามสกุล"
                    name="last_name"
                    rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
                  >
                    <Input placeholder="กรอกนามสกุล" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="ชื่อผู้ใช้"
                name="user_name"
                rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
              >
                <Input placeholder="กรอกชื่อผู้ใช้" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="อีเมล"
                    name="email"
                    rules={[
                      { type: 'email', message: 'รูปแบบอีเมลผิด' },
                      { required: true, message: 'กรุณากรอกอีเมล' },
                    ]}
                  >
                    <Input placeholder="กรอกอีเมล" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="รหัสผ่าน"
                    name="password"
                    rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
                  >
                    <Input.Password placeholder="กรอกรหัสผ่าน" />
                  </Form.Item>
                </Col>
              </Row>


              <Row gutter={12}>
                <Col span={12}>
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
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Birth Date"
                    name="birth_date"
                    rules={[{ required: true, message: 'Please select your birth date!' }]}
                  >
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        form.setFieldsValue({ birth_date: e.target.value }); // yyyy-mm-dd
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="signup-submit-btn">
                  ยืนยัน
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
