import React from 'react';
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
            <div className="container">
                <Card className="card-register" style={{ width: '100%', maxWidth: 600 }}>
                    <h1 className="title">สมัครสมาชิก</h1>
                    <Form
                        name="register"
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="ชื่อจริง"
                                    name="first_name"
                                    rules={[{ required: true, message: 'กรุณากรอกชื่อจริง!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="นามสกุล"
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
                                    label="ชื่อผู้ใช้"
                                    name="user_name"
                                    rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="รหัสผ่าน"
                                    name="password"
                                    rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน!' }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            label="อีเมล"
                            name="email"
                            rules={[
                                { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง!' },
                                { required: true, message: 'กรุณากรอกอีเมล!' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="เพศ"
                            name="gender"
                            rules={[{ required: true, message: 'กรุณาเลือกเพศ!' }]}
                        >
                            <Radio.Group>
                                <Radio value="ชาย">ชาย</Radio>
                                <Radio value="หญิง">หญิง</Radio>
                                <Radio value="ไม่ระบุ">ไม่ระบุ</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label="วันเกิด"
                            name="birth_date"
                            rules={[{ required: true, message: 'กรุณาเลือกวันเกิด!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="submit-btn">
                                ยืนยันการสมัคร
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </>
    );
};

export default Register;