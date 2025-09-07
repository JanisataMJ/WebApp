import React, { useState, useEffect } from 'react';   
import './headerAdmin.css';
import { Dropdown, Modal } from 'react-bootstrap';
import { message, theme, Avatar } from 'antd';  
import logo from '../../assets/Logo.jpg';
import { GetUsersById, UpdateStatusWriterById } from '../../services/https/User/user';
import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const HeaderAdmin: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [showModal, setShowModal] = useState(false);
    const [isWriter, setIsWriter] = useState<boolean | null>(null);
    const [users, setUser] = useState<UsersInterface | null>(null);
    const { token: { colorBgContainer } } = theme.useToken();

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

    return (
        <>
            {contextHolder}
            <div className="topbar-headAdmin">
                <a href="/admin/home" className="logo-headAdmin">
                    <img src={logo} alt="Logo" className="logo-img-headAdmin" />
                </a>

                <Link to="/admin/home" className="header-link-headAdmin">HOME</Link>
                <Link to="/admin/article" className="header-link-headAdmin">ARTICLE</Link>
                <Link to="/admin/manageAdmin" className="header-link-headAdmin">ADMIN</Link>
                
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
                            <Dropdown.Item eventKey="writer">งานเขียน</Dropdown.Item>
                            <Dropdown.Item href="/bookshelf">ชั้นหนังสือ</Dropdown.Item>
                            <Dropdown.Item href="/Payment">เหรียญ & ประวัติธุรกรรม</Dropdown.Item>
                            <Dropdown.Item href="/settings">ตั้งค่า</Dropdown.Item>
                            <Dropdown.Item onClick={Logout}>ออกจากระบบ</Dropdown.Item>
                        </Dropdown.Menu> 
                    </Dropdown>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal-headAdmin">
                <div className='modal-content-headAdmin'>
                    <div className='confirmation-message-headAdmin'>
                        <div onClick={() => setShowModal(false)}>
                            <img className="cancel-headAdmin" src="./src/assets/no.png" alt="cancel" />
                        </div>
                        <div style={{ transform: 'translate(-50px, -40px)', width: '300%' }}>
                            <img className="ready-headAdmin" src="./src/assets/error.png" alt="submit" />
                            <span className='text2-headAdmin'><b>คุณต้องเป็นนักเขียนก่อน</b></span>
                        </div>
                        <span className="text1-headAdmin">
                            <span id='ready2' style={{ transform: 'translate(-20px, 0)' }}>
                                สมัครเข้าร่วมเป็นนักเขียน
                            </span>
                        </span>
                        <div>
                            <span id='buttonin' onClick={handleWriterClick} style={{ cursor: 'pointer' }}>
                                <span id='button3'>&nbsp;&nbsp;&nbsp;&nbsp;สมัคร</span>
                            </span>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default HeaderAdmin;
