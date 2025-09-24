import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Form, Input, Button, Select, DatePicker, message, Upload, Spin, InputNumber } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { GetUsersById } from '../../services/https/User/user';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd';
import './editProfile.css';

import TestSelect from './testdropdown';

const { Option } = Select;

interface FormData {
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    birth_date: any;
    weight: number;
    height: number;
    phonenumber: string;
    bust: number;
    waist: number;
    hip: number;
    old_password: string;
    new_password: string;
    profile?: string;
}

const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [profileDeleted, setProfileDeleted] = useState(false);
    const [birthDate, setBirthDate] = useState<string | null>(null);
    const [roleID, setRoleID] = useState<number | null>(null); // state สำหรับ roleID

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const beforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            messageApi.error('You can only upload JPG/PNG files!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            messageApi.error('File size must be smaller than 2MB!');
            return false;
        }
        return false;
    };

    useEffect(() => {
        const fetchUser = async () => {
            const id = localStorage.getItem('id');
            if (!id) {
                messageApi.error('User ID not found');
                navigate('/profile');
                setInitialLoading(false);
                return;
            }

            try {
                setInitialLoading(true);
                const res = await GetUsersById(id);

                if (res?.data) {
                    const userData = res.data;
                    setRoleID(userData.RoleID); // <-- เก็บ roleID

                    form.setFieldsValue({
                        user_name: userData.username,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        email: userData.email,
                        gender: userData.genderID === 1 ? 'Male' : userData.genderID === 2 ? 'Female' : 'Unspecified',
                        birth_date: userData.birthdate ? dayjs(userData.birthdate) : null,
                        weight: userData.weight ?? undefined,
                        height: userData.height ?? undefined,
                        phonenumber: userData.phonenumber ?? '',
                        bust: userData.bust ?? undefined,
                        waist: userData.waist ?? undefined,
                        hip: userData.hip ?? undefined,
                    });

                    if (userData.birthdate) {
                        setBirthDate(dayjs(userData.birthdate).format('YYYY-MM-DD'));
                    }

                    if (userData.picture) {
                        setFileList([{
                            uid: '-1',
                            name: 'profile.png',
                            status: 'done',
                            url: userData.picture,
                        }]);
                    }

                    setRoleID(Number(userData.RoleID));
                    console.log('roleID:', Number(userData.RoleID));


                } else {
                    messageApi.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                messageApi.error('An error occurred while fetching user data');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUser();
    }, [form, messageApi, navigate]);

    const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        setProfileDeleted(newFileList.length === 0);
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
    };

    const onFinish = async (values: FormData) => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id");
        if (!token || !userId) return;

        const formData = new FormData();
        formData.append("username", values.user_name);
        formData.append("firstName", values.first_name);
        formData.append("lastName", values.last_name);
        formData.append("email", values.email);
        formData.append("genderID", values.gender === 'Male' ? "1" : values.gender === 'Female' ? "2" : "3");
        formData.append("birthdate", birthDate ?? "");
        formData.append("weight", values.weight?.toString() ?? "");
        formData.append("height", values.height?.toString() ?? "");
        formData.append("phonenumber", values.phonenumber);
        formData.append("bust", values.bust?.toString() ?? "");
        formData.append("waist", values.waist?.toString() ?? "");
        formData.append("hip", values.hip?.toString() ?? "");

        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append("profile", fileList[0].originFileObj);
        }

        try {
            setLoading(true);
            const res = await axios.put(`http://localhost:8000/user/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            messageApi.success("Profile updated successfully");
            navigate("/profile");
        } catch (err: any) {
            console.error(err);
            messageApi.error("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };


    const validateMessages = {
        required: '${label} is required!',
        types: {
            email: 'Invalid email format!',
            number: 'Must be a number!',
        },
        number: {
            range: '${label} must be between ${min} and ${max}',
        },
    };

    if (initialLoading) {
        return (
            <>
                <Headers />
                <div className="edit-profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Spin size="large" />
                </div>
            </>
        );
    }

    return (
        <>
            <Headers />
            <div className="edit-profile-wrapper">
                {contextHolder}

                <div className="editprofile-title-section">
                    <button
                        className="back-button"
                        onClick={() => navigate('/profile')}
                        type="button"
                        aria-label="Go Back"
                    >
                        <ArrowLeftOutlined />
                    </button>
                    <h1 className="editprofile-title">กลับหน้าโปรไฟล์</h1>
                </div>

                <div className="edit-profile-content">
                    <div className="form-section">
                        <div className="form-card">
                            <h2 className="form-title">แก้ไขข้อมูลส่วนตัว</h2>
                            <div className="profile-image-section">
                                <div className="profile-upload-container">
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={onChange}
                                        onPreview={onPreview}
                                        maxCount={1}
                                        beforeUpload={beforeUpload}
                                        className="profile-upload"
                                        accept="image/png,image/jpeg,image/jpg"
                                    >
                                        {fileList.length < 1 && (
                                            <div className="upload-placeholder">
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
                                            </div>
                                        )}
                                    </Upload>
                                </div>
                            </div>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                autoComplete="off"
                                validateMessages={validateMessages}
                                scrollToFirstError
                            >
                                <div className="form-grid">
                                    {/* Name */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>ชื่อ</label>
                                            <Form.Item
                                                name="first_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกชื่อจริง' },
                                                    { min: 3, message: 'ชื่อควรมีอย่างน้อย 2 ตัวอักษร' },
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="กรอกชื่อจริง" maxLength={50} />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>นามสกุล</label>
                                            <Form.Item
                                                name="last_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกนามสกุล' },
                                                    { min: 3, message: 'นามสกุลควรมีอย่างน้อย 2 ตัวอักษร' },
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="กรอกนามสกุล" maxLength={50} />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Gender & Birthday */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>เพศ</label>
                                            <Form.Item
                                                name="gender"
                                                className="form-item"
                                                rules={[{ required: true, message: 'กรุณาเลือกเพศ' }]}
                                            >
                                                <select className="form-input">
                                                    <option value="Male">ผู้ชาย</option>
                                                    <option value="Female">ผู้หญิง</option>
                                                </select>
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>วันเกิด</label>
                                            <Form.Item
                                                name="gender"
                                                className="form-item"
                                                rules={[{ required: true, message: 'กรุณาเลือกวันเกิด' }]}
                                            >
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    max={new Date().toISOString().split("T")[0]}
                                                    value={birthDate || ""}
                                                    onChange={(e) => setBirthDate(e.target.value)}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>เบอร์โทรศัพท์</label>
                                            <Form.Item
                                                name="phonenumber"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกเบอร์โทร' },
                                                    { pattern: /^\d{10}$/, message: 'เบอร์โทรต้องมี 10 ตัว' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="เบอร์โทรศัพท์" maxLength={10} />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Body Measurements */}
                                    {roleID !== 1 && (
                                        <>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>น้ำหนัก</label>
                                                    <Form.Item name="weight">
                                                        <InputNumber placeholder="kg" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </div>
                                                <div className="form-group">
                                                    <label>ส่วนสูง</label>
                                                    <Form.Item name="height">
                                                        <InputNumber placeholder="cm" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>รอบอก</label>
                                                    <Form.Item name="bust" rules={[{ type: 'number', message: 'Please enter a number' }]}>
                                                        <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </div>
                                                <div className="form-group">
                                                    <label>เอว</label>
                                                    <Form.Item name="waist" rules={[{ type: 'number', message: 'Please enter a number' }]}>
                                                        <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>สะโพก</label>
                                                    <Form.Item name="hip" rules={[{ type: 'number', message: 'Please enter a number' }]}>
                                                        <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </div>

                                {/* Account Info */}
                                <div className="account-section">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>ชื่อผู้ใช้</label>
                                            <Form.Item
                                                name="user_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                                                    { min: 3, message: 'ชื่อผู้ใช้ควรมีอย่างน้อย 3 ตัวอักษร' },
                                                    { max: 20, message: 'ชื่อผู้ใช้ไม่ควรมีมากกว่า 20 ตัวอักษร' },
                                                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and _' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="กรอกชื่อผู้ใช้" prefix={<UserOutlined />} />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <label>อีเมล</label>
                                            <Form.Item
                                                name="email"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกอีเมล' },
                                                    { type: 'email', message: 'รูปแบบอีเมลผิด' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="กรอกอีเมล" type="email" />
                                            </Form.Item>
                                        </div>
                                    </div>


                                </div>

                                <div className="submit-section">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="confirm-button"
                                        loading={loading}
                                        disabled={loading}
                                        size="large"
                                    >
                                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditProfile;
