import React, { useState, useEffect } from 'react';   
import './headerAdmin.css';
import { Dropdown, Modal } from 'react-bootstrap';
import { message, theme, Avatar } from 'antd';  
import logo from '../../assets/Logo.jpg';
import { GetUsersById, UpdateStatusWriterById } from '../../services/https/User/user';
import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { UserOutlined } from '@ant-design/icons';
import { Link, useLocation  } from 'react-router-dom';

const HeaderAdmin: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [showModal, setShowModal] = useState(false);
    const [isWriter, setIsWriter] = useState<boolean | null>(null);
    const [users, setUser] = useState<UsersInterface | null>(null);
    const { token: { colorBgContainer } } = theme.useToken();
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('id');
                if (userId) {
                    const userData = await GetUsersById(userId);
                    setUser(userData.data);
                    if (userData.status === 200) setIsWriter(userData.data.writer);
                }
            } catch {
                messageApi.error("Error fetching user data");
            }
        };
        fetchUserData();
    }, [messageApi]);

    const handleWriterClick = async () => {
        try {
            const userId = localStorage.getItem('id');
            if (userId) {
                await UpdateStatusWriterById(userId, { writer: true });
                localStorage.setItem('isWriter', 'true');
                setIsWriter(true);
                window.location.href = '/writer';
            }
        } catch {
            messageApi.error("Error updating writer status");
        }
    };

    const Logout = () => {
        localStorage.clear();
        messageApi.success("Logout successful");
        setTimeout(() => window.location.href = "/", 2000);
    };

    const handleDropdownSelect = (eventKey: string | null) => {
        if (eventKey === 'writer') {
            if (isWriter) window.location.href = '/writer';
            else setShowModal(true);
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path; // true ถ้า path ปัจจุบันตรงกับ path ที่ส่งมา
    };

    return (
        <>
            {contextHolder}
            <div className="topbar-headAdmin">
                <a href="/admin/home" className="logo-headAdmin">
                    <img src={logo} alt="Logo" className="logo-img-headAdmin" />
                </a>

                <Link 
                    to="/admin/home" 
                    className={`header-link-headAdmin ${isActive('/admin/home') ? 'active-link-headAdmin' : ''}`}
                >
                    หน้าหลัก
                </Link>

                <Link 
                    to="/admin/article" 
                    className={`header-link-headAdmin ${isActive('/admin/article') ? 'active-link-headAdmin' : ''}`}
                >
                    บทความ
                </Link>

                <div className="profile-headAdmin">
                    <Dropdown align="end" onSelect={handleDropdownSelect}>
                        <Dropdown.Toggle as="div" className="avatar-toggle-headAdmin">
                            <Avatar
                                size={50}
                                style={{
                                    border: "3px solid #ffffffff",
                                    boxShadow: "0 0 8px rgba(0,0,0,0.2)"
                                }}
                                src={users?.profile ? `http://localhost:8000/${users.profile}` : undefined}
                                icon={!users?.profile && <UserOutlined />}
                            />
                     </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item href="/profile">โปรไฟล์ของฉัน</Dropdown.Item>
                            <Dropdown.Item onClick={Logout}>ออกจากระบบ</Dropdown.Item>
                        </Dropdown.Menu> 
                    </Dropdown>
                </div>
            </div>
        </>
    );
};

export default HeaderAdmin;
