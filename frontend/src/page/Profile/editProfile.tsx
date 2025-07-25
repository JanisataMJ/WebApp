import React, { useEffect, useState } from 'react';
import {Form,Input,Button,Select, DatePicker, message, Upload, Row, Col,} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { GetUsersById, UpdateUsersById } from '../../services/https/User/user';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd';
import './editProfile.css';

const { Option } = Select;

const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [profileDeleted, setProfileDeleted] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const id = localStorage.getItem('id');
            if (id) {
                try {
                    const res = await GetUsersById(id);
                    if (res) {
                        form.setFieldsValue({
                            user_name: res.data.user_name,
                            first_name: res.data.first_name,
                            last_name: res.data.last_name,
                            email: res.data.email,
                            gender: res.data.gender,
                            birth_date: dayjs(res.data.birth_date),
                            profile: res.data.profile,
                        });
                        if (res.data.profile) {
                            setFileList([{
                                uid: '-1',
                                name: 'profile.png',
                                status: 'done',
                                url: res.data.profile,
                            }]);
                        }
                    }
                } catch (error) {
                    messageApi.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
                }
            } else {
                messageApi.error('ไม่พบ ID ของผู้ใช้');
                navigate('/profile');
            }
        };

        fetchUser();
    }, [form, messageApi, navigate]);

    const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        setProfileDeleted(newFileList.length === 0);
        
        if (newFileList.length === 0) {
            form.setFieldsValue({ profile: '' }); 
        } else {
            const file = newFileList[0];
            if (file.originFileObj) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    form.setFieldsValue({ profile: e.target?.result });
                };
                reader.readAsDataURL(file.originFileObj);
            }
        }
    };

    const onPreview = async (file: UploadFile) => {
        let src = file.url as string;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj as File); 
                reader.onload = () => resolve(reader.result as string);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    }

    const onFinish = async (values: UsersInterface) => {
        try {
            const id = localStorage.getItem("id");
            if (!id) {
                messageApi.error("ไม่พบ ID ของผู้ใช้");
                return;
            }

            if (profileDeleted) {
                values.profile = ''; // Set to empty string instead of null
            } else {
                values.profile = form.getFieldValue('profile');
            
    }


            const res = await UpdateUsersById(id, values);
            if (res) {
                messageApi.success("อัปเดตข้อมูลสำเร็จ");
                setTimeout(() => navigate("/profile"), 2000);
            } else {
                messageApi.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
            }
        } catch (error) {
            messageApi.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
        }
    };

    return (
        <div className="edit-profile-container">
            {contextHolder}
            <Headers />
            <a className="backiconE" href="/profile">
            </a>
            <div className="head">
                <span className="current">Profile → แก้ไขข้อมูลส่วนตัว</span>
            </div>

            <div className="profile-summary">
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={onChange}
                    onPreview={onPreview}
                    maxCount={1}
                    beforeUpload={() => false} 
                >
                    {fileList.length < 1 && (
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>อัปโหลด</div>
                        </div>
                    )}
                </Upload>
            </div>

            <div className="content">
                <div className="edit-box">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="ชื่อผู้ใช้" name="user_name" className="edit-item">
                                    <Input className="input-field" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="ชื่อ" name="first_name" className="edit-item">
                                    <Input className="input-field" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="นามสกุล" name="last_name" className="edit-item">
                                    <Input className="input-field" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="อีเมล" name="email" className="edit-item">
                                    <Input className="input-email" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="เพศ" name="gender" className="edit-item">
                                    <Select placeholder="เลือกเพศ" >
                                        <Option value="ชาย">ชาย</Option>
                                        <Option value="หญิง">หญิง</Option>
                                        <Option value="ไม่ระบุ">ไม่ระบุ</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="วันเกิด" name="birth_date" className="edit-item">
                                    <DatePicker style={{ width: '100%' }} className="input-field" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <div className="buttons">
                                <Button onClick={() => navigate('/profile')} className="cancel-button">ยกเลิก</Button>
                                <Button type="primary" htmlType="submit" className="save-button">บันทึก</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
