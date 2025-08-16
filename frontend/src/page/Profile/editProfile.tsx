import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Form, Input, Button, Select, DatePicker, message, Upload, Spin, InputNumber } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { GetUsersById, UpdateUsersById } from '../../services/https/User/user';
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

    // ฟังก์ชันแปลงไฟล์เป็น Base64
    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // ตรวจสอบรูปแบบไฟล์
    const beforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            messageApi.error('คุณสามารถอัปโหลดไฟล์ JPG/PNG เท่านั้น!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            messageApi.error('ขนาดไฟล์ต้องไม่เกิน 2MB!');
            return false;
        }
        return false; // ไม่อัปโหลดทันที รอให้ผู้ใช้กด Submit
    };

    // โหลดข้อมูลผู้ใช้
    useEffect(() => {
        const fetchUser = async () => {
            const id = localStorage.getItem('id');
            if (!id) {
                messageApi.error('ไม่พบ ID ของผู้ใช้');
                navigate('/profile');
                setInitialLoading(false); // หยุด spinner แม้ไม่มี id
                return;
            }

            try {
                setInitialLoading(true);
                const res = await GetUsersById(id);

                if (res?.data) {
                    const userData = res.data;

                    // กำหนดค่าให้ฟอร์ม
                    form.setFieldsValue({
                        user_name: userData.Username,
                        first_name: userData.FirstName,
                        last_name: userData.LastName,
                        email: userData.Email,
                        gender: userData.GenderID === 1 ? 'ชาย' : userData.GenderID === 2 ? 'หญิง' : 'ไม่ระบุ',
                        birth_date: userData.Birthdate ? dayjs(userData.Birthdate) : null,
                        weight: userData.Weight,
                        height: userData.Height,
                        phonenumber: userData.Phonenumber || '',
                        bust: userData.Bust || null,
                        waist: userData.Waist || null,
                        hip: userData.Hip || null,
                        old_password: '',
                        new_password: '',
                    });

                    // ตั้งค่ารูปโปรไฟล์ถ้ามี
                    if (userData.Picture) {
                        setFileList([{
                            uid: '-1',
                            name: 'profile.png',
                            status: 'done',
                            url: userData.Picture,
                        }]);
                    }
                } else {
                    messageApi.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                messageApi.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
            } finally {
                setInitialLoading(false); // หยุด spinner ทุกกรณี
            }
        };

        fetchUser();
    }, [form, messageApi, navigate]);

    // จัดการเปลี่ยนแปลงไฟล์อัปโหลด
    const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        setProfileDeleted(newFileList.length === 0);
    };

    // ดูตัวอย่างภาพ
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

    // ส่งข้อมูลฟอร์ม
    const onFinish = async (values: FormData) => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id");

        if (!token || !userId) {
            messageApi.error("ไม่พบ token หรือ user ID กรุณาเข้าสู่ระบบใหม่");
            return;
        }

        try {
            setLoading(true);

            let base64Image: string | undefined = undefined;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                base64Image = await getBase64(fileList[0].originFileObj as File);
            }

            // แก้ไข payload ให้ตรงกับ backend
            const data = {
                Username: values.user_name,
                FirstName: values.first_name,
                LastName: values.last_name,
                Email: values.email,
                GenderID: values.gender === 'ชาย' ? 1 : values.gender === 'หญิง' ? 2 : 3,
                Birthdate: values.birth_date ? values.birth_date.toISOString() : null,
                weight: values.weight,
                height: values.height,
                Phonenumber: values.phonenumber,
                bust: values.bust,
                waist: values.waist,
                hip: values.hip,
                Picture: base64Image || (profileDeleted ? null : undefined),
                OldPassword: values.old_password || undefined,
                NewPassword: values.new_password || undefined,
            };



            console.log("📦 Payload ก่อนส่ง:", data);

            const res = await axios.put(`http://localhost:8000/user/${userId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log("✅ ตอบกลับสำเร็จ:", res.data);
            messageApi.success("บันทึกข้อมูลสำเร็จ");

            setTimeout(() => {
                navigate('/profile');
            }, 1500);

        } catch (err: any) {
            console.error("❌ เกิดข้อผิดพลาด:", err.response?.data || err.message);
            if (err.response?.status === 401) {
                messageApi.error("หมดอายุการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
                localStorage.removeItem('token');
                localStorage.removeItem('id');
                navigate('/login');
            } else if (err.response?.status === 400) {
                messageApi.error("ข้อมูลที่ส่งไม่ถูกต้อง");
            } else {
                messageApi.error("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่");
            }
        } finally {
            setLoading(false);
        }
    };



    // ตรวจสอบข้อมูลฟอร์ม
    const validateMessages = {
        required: '${label} จำเป็นต้องกรอก!',
        types: {
            email: 'รูปแบบอีเมลไม่ถูกต้อง!',
            number: 'จำเป็นต้องเป็นตัวเลข!',
        },
        number: {
            range: '${label} ต้องอยู่ระหว่าง ${min} และ ${max}',
        },
    };

    if (initialLoading) {
        return (
            <>
                <Headers />
                <div className="edit-profile-wrapper">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50vh'
                    }}>
                        <Spin size="large" />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Headers />
            <div className="edit-profile-wrapper">
                {contextHolder}

                {/* Profile Title Section */}
                <div className="editprofile-title-section">
                    <button
                        className="back-button"
                        onClick={() => navigate('/profile')}
                        type="button"
                        aria-label="ย้อนกลับ"
                    >
                        <ArrowLeftOutlined />
                    </button>
                    <h1 className="editprofile-title">แก้ไขโปรไฟล์</h1>
                </div>

                {/* Main Content */}
                <div className="edit-profile-content">
                    {/* Profile Image Section */}
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
                                        <div style={{ marginTop: 8 }}>อัปโหลดรูป</div>
                                    </div>
                                )}
                            </Upload>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="form-section">
                        <div className="form-card">
                            <h2 className="form-title">ข้อมูลส่วนตัว</h2>

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                autoComplete="off"
                                validateMessages={validateMessages}
                                scrollToFirstError
                            >
                                {/* Personal Info Grid */}
                                <div className="form-grid">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>ชื่อจริง</label>
                                            <Form.Item
                                                name="first_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกชื่อจริง' },
                                                    { min: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' }
                                                ]}
                                            >
                                                <Input
                                                    className="form-input"
                                                    placeholder="กรอกชื่อจริง"
                                                    maxLength={50}
                                                />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>นามสกุล</label>
                                            <Form.Item
                                                name="last_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกนามสกุล' },
                                                    { min: 2, message: 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร' }
                                                ]}
                                            >
                                                <Input
                                                    className="form-input"
                                                    placeholder="กรอกนามสกุล"
                                                    maxLength={50}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>เพศ</label>
                                            <Form.Item
                                                name="gender"
                                                className="form-item"
                                                rules={[{ required: true, message: 'กรุณาเลือกเพศ' }]}
                                            >
                                                <Select
                                                    placeholder="เลือกเพศ"

                                                    allowClear
                                                >
                                                    <Option value="ชาย">ชาย</Option>
                                                    <Option value="หญิง">หญิง</Option>
                                                    <Option value="ไม่ระบุ">ไม่ระบุ</Option>
                                                </Select>
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>วันเกิด</label>
                                            <Form.Item
                                                name="birth_date"
                                                className="form-item"
                                                rules={[{ required: true, message: 'กรุณาเลือกวันเกิด' }]}
                                            >
                                                <DatePicker
                                                    className="form-input"
                                                    placeholder="เลือกวันเกิด"
                                                    format="DD/MM/YYYY"
                                                    disabledDate={(current) => {
                                                        return current && current > dayjs().endOf('day');
                                                    }}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>เบอร์โทร</label>
                                            <Form.Item
                                                name="phonenumber"
                                                rules={[{ required: true, message: 'กรุณากรอกเบอร์โทร' }]}
                                            >
                                                <Input
                                                    placeholder="กรอกเบอร์โทร"
                                                    style={{ width: '100%' , height: '50px' }}   // ✅ บังคับให้เต็มเหมือนช่องอื่น
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>น้ำหนัก</label>
                                            <Form.Item
                                                name="weight"
                                            >
                                                <InputNumber
                                                    placeholder="กก."
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>ส่วนสูง</label>
                                            <Form.Item
                                                name="height"
                                            >
                                                <InputNumber
 
                                                    placeholder="ซม."
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>รอบอก</label>
                                            <Form.Item
                                                name="bust"
                                                rules={[{ type: 'number', message: 'กรุณากรอกตัวเลข' }]}
                                            >
                                                <InputNumber min={0} placeholder="ซม." style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>

                                        <div className="form-group">
                                            <label>รอบเอว</label>
                                            <Form.Item
                                                name="waist"
                                                rules={[{ type: 'number', message: 'กรุณากรอกตัวเลข' }]}
                                            >
                                                <InputNumber min={0} placeholder="ซม." style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>รอบสะโพก</label>
                                            <Form.Item
                                                name="hip"
                                                rules={[{ type: 'number', message: 'กรุณากรอกตัวเลข' }]}
                                            >
                                                <InputNumber min={0} placeholder="ซม." style={{ width: '100%' }} />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Info Section */}
                                <div className="account-section">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>ชื่อผู้ใช้</label>
                                            <Form.Item
                                                name="user_name"
                                                className="form-item"
                                                rules={[
                                                    { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
                                                    { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' },
                                                    { max: 20, message: 'ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร' },
                                                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น' }
                                                ]}
                                            >
                                                <Input
                                                    className="form-input"
                                                    placeholder="กรอกชื่อผู้ใช้"
                                                    prefix={<UserOutlined />}
                                                />
                                            </Form.Item>
                                        </div>
                                        <div className="form-group">
                                            <label>รหัสผ่านเก่า</label>
                                            <Form.Item
                                                name="old_password"
                                                className="form-item"
                                                rules={[
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            const newPassword = getFieldValue('new_password');
                                                            if (newPassword && !value) {
                                                                return Promise.reject(new Error('กรุณากรอกรหัสผ่านเก่าเพื่อเปลี่ยนรหัสผ่าน'));
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password
                                                    className="form-input"
                                                    placeholder="กรอกรหัสผ่านเก่า (ถ้าต้องการเปลี่ยน)"
                                                />
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
                                                    { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                                                ]}
                                            >
                                                <Input
                                                    className="form-input"
                                                    placeholder="กรอกอีเมล"
                                                    type="email"
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <label>รหัสผ่านใหม่</label>
                                            <Form.Item
                                                name="new_password"
                                                className="form-item"
                                                rules={[
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (value && value.length < 6) {
                                                                return Promise.reject(new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'));
                                                            }
                                                            if (value && !getFieldValue('old_password')) {
                                                                return Promise.reject(new Error('กรุณากรอกรหัสผ่านเก่าก่อน'));
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password
                                                    className="form-input"
                                                    placeholder="กรอกรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="submit-section">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="confirm-button"
                                        loading={loading}
                                        disabled={loading}
                                        size="large"
                                    >
                                        {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
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