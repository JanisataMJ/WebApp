import React, { useEffect, useState } from 'react';
import './profile.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { Link } from 'react-router-dom';
import { GetUsersById } from '../../services/https/User/user';
import { UsersInterface } from '../../interface/profile_interface/IProfile';

const Profile: React.FC = () => {
    const [users, setUsers] = useState<UsersInterface | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const id = localStorage.getItem('id'); // Get the logged-in user's ID
                if (!id) {
                    throw new Error("ไม่พบข้อมูลผู้ใช้");
                }
                
                const response = await GetUsersById(id);
                // Extract data from response and set users state
                setUsers(response.data);  // Set the user data to the 'data' field
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
    
        fetchUsers();
    }, []);

    return (
        <>
            <Headers />

            <div className="profile-container">
                            <h1 className="profile-title">Profile</h1>
                <div className="profile-header">
                    {/* Profile Picture */}
                    {users && users.profile ? (
                        <img
                            src={users.profile}
                            alt="Profile"
                            className="profile-picture w3-circle w3-margin-right"
                            width="150px"
                        />
                    ) : (
                        <div className="no-profile-picture">ไม่มีรูปประจำตัว</div>
                    )}
                </div>
                
                <div className="box">
                <Link to="/editProfile" className="editProfile">แก้ไขข้อมูลส่วนตัว</Link>
                    <div className="item">
                        <span className="label">ชื่อผู้ใช้</span>
                        <span className="value">: {users ? users.user_name : 'กรุณาเข้าสู่ระบบ'}</span>
                    </div>
                    <div className="item">
                        <span className="label">ชื่อ-นามสกุล</span>
                        <span className="value">: {users ? `${users.first_name} ${users.last_name}` : ''}</span>
                    </div>
                    <div className="item">
                        <span className="label">อีเมล</span>
                        <span className="value">: {users ? users.email : 'กรุณาเข้าสู่ระบบ'}</span>
                    </div>
                    <div className="item">
                        <span className="label">เพศ</span>
                        <span className="value">: {users ? users.gender : 'กรุณาเข้าสู่ระบบ'}</span>
                    </div>
                    <div className="item">
                        <span className="label">วันเกิด</span>
                        <span className="value">
                            : {users?.birth_date ? new Date(users.birth_date).toLocaleDateString() : 'กรุณาเข้าสู่ระบบ'}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
