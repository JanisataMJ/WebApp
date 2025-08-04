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
        // แปลงข้อมูล birthDate จาก DatePicker ให้เป็นรูปแบบที่เหมาะสม
        const formattedValues = {
            ...values,
            birthDate: values.birthDate ? moment(values.birthDate).format('YYYY-MM-DD') : undefined,
        };

        try {
            const res = await CreateUser(formattedValues);
            if (res.status === 201) {
                messageApi.success("สมัครสมาชิกสำเร็จ!");
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                messageApi.error(res.data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }
        } catch (error) {
            messageApi.error("การเชื่อมต่อ API ล้มเหลว");
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
                    <Form
                        name="register"
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="First Name"
                                    name="first_name"
                                    rules={[{ required: true, message: 'กรุณากรอกชื่อจริง!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Last Name"
                                    name="last_name"
                                    rules={[{ required: true, message: 'กรุณากรอกนามสกุล!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item
                                    label="Username"
                                    name="user_name"
                                    rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน!' }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง!' },
                                { required: true, message: 'กรุณากรอกอีเมล!' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Gender"
                            name="gender"
                            rules={[{ required: true, message: 'กรุณาเลือกเพศ!' }]}
                        >
                            <Radio.Group>
                                <Radio value="ชาย">Male</Radio>
                                <Radio value="หญิง">Female</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label="Birth Date"
                            name="birth_date"
                            rules={[{ required: true, message: 'กรุณาเลือกวันเกิด!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
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