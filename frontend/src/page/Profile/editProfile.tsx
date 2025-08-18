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

                    if (userData.picture) {
                        setFileList([{
                            uid: '-1',
                            name: 'profile.png',
                            status: 'done',
                            url: userData.picture,
                        }]);
                    }
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

        if (!token || !userId) {
            messageApi.error("Token or User ID not found, please log in again");
            return;
        }

        try {
            setLoading(true);

            let base64Image: string | undefined = undefined;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                base64Image = await getBase64(fileList[0].originFileObj as File);
            }

            const data = {
                Username: values.user_name,
                FirstName: values.first_name,
                LastName: values.last_name,
                Email: values.email,
                GenderID: values.gender === 'Male' ? 1 : values.gender === 'Female' ? 2 : 3,
                Birthdate: values.birth_date ? values.birth_date.toISOString() : null,
                weight: values.weight,
                height: values.height,
                Phonenumber: values.phonenumber,
                bust: values.bust,
                waist: values.waist,
                hip: values.hip,
                Picture: base64Image || (profileDeleted ? null : undefined),
            };

            console.log("📦 Payload:", data);

            const res = await axios.put(`http://localhost:8000/user/${userId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log("✅ Response:", res.data);
            messageApi.success("Profile updated successfully");

            setTimeout(() => {
                navigate('/profile');
            }, 1500);

        } catch (err: any) {
            console.error("❌ Error:", err.response?.data || err.message);
            if (err.response?.status === 401) {
                messageApi.error("Session expired, please log in again");
                localStorage.removeItem('token');
                localStorage.removeItem('id');
                navigate('/login');
            } else if (err.response?.status === 400) {
                messageApi.error("Invalid data submitted");
            } else {
                messageApi.error("Failed to save data, please try again");
            }
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
                    <h1 className="editprofile-title">Edit Profile</h1>
                </div>

                <div className="edit-profile-content">
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
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-card">
                            <h2 className="form-title">Personal Information</h2>
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
                                            <label>First Name</label>
                                            <Form.Item
                                                name="first_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'Please enter your first name' },
                                                    { min: 2, message: 'First name must be at least 2 characters' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="Enter first name" maxLength={50} />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <Form.Item
                                                name="last_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'Please enter your last name' },
                                                    { min: 2, message: 'Last name must be at least 2 characters' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="Enter last name" maxLength={50} />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Gender & Birthday */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <Form.Item
                                                name="gender"
                                                className="form-item"
                                                rules={[{ required: true, message: 'Please select gender' }]}
                                            >
                                                <Select placeholder="Select gender" allowClear>
                                                    <Option value="Male">Male</Option>
                                                    <Option value="Female">Female</Option>
                                                    <Option value="Unspecified">Unspecified</Option>
                                                </Select>
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>Birthday</label>
                                            <Form.Item
                                                name="birth_date"
                                                className="form-item"
                                                rules={[{ required: true, message: 'Please select your birthday' }]}
                                            >
                                                <DatePicker
                                                    className="form-input"
                                                    placeholder="Select birthday"
                                                    format="DD/MM/YYYY"
                                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <Form.Item name="phonenumber">
                                                <Input placeholder="Enter phone number" style={{ width: '100%', height: '50px' }} />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* Body Measurements */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Weight</label>
                                            <Form.Item name="weight">
                                                <InputNumber placeholder="kg" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>Height</label>
                                            <Form.Item name="height">
                                                <InputNumber placeholder="cm" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Bust</label>
                                            <Form.Item name="bust" rules={[{ type: 'number', message: 'Please enter a number' }]}>
                                                <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>Waist</label>
                                            <Form.Item name="waist" rules={[{ type: 'number', message: 'Please enter a number' }]}>
                                                <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Hip</label>
                                            <Form.Item name="hip" rules={[{ type: 'number', message: 'Please enter a number' }]}>
                                                <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Info */}
                                <div className="account-section">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <Form.Item
                                                name="user_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'Please enter a username' },
                                                    { min: 3, message: 'Username must be at least 3 characters' },
                                                    { max: 20, message: 'Username cannot exceed 20 characters' },
                                                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and _' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="Enter username" prefix={<UserOutlined />} />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <label>Email</label>
                                            <Form.Item
                                                name="email"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'Please enter email' },
                                                    { type: 'email', message: 'Invalid email format' }
                                                ]}
                                            >
                                                <Input className="form-input" placeholder="Enter email" type="email" />
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
                                        {loading ? 'Saving...' : 'Save'}
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
