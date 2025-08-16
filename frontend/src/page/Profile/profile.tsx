import React, { useEffect, useState } from 'react';
import './profile.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { Link, useNavigate } from 'react-router-dom';
import { GetUsersById } from '../../services/https/User/user';
import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { message, Spin } from 'antd';
import dayjs from 'dayjs';

const Profile: React.FC = () => {
  const [users, setUsers] = useState<UsersInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchUser = async () => {
      const id = localStorage.getItem('id');
      if (!id) {
        messageApi.error('ไม่พบ ID ของผู้ใช้');
        navigate('/');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await GetUsersById(id);

        if (res?.data) {
          const userData = res.data;
          console.log('User data:', userData);

          setUsers({
            user_name: userData.Username,
            first_name: userData.FirstName,
            last_name: userData.LastName,
            email: userData.Email,
            gender:
              userData.GenderID === 1
                ? 'ชาย'
                : userData.GenderID === 2
                  ? 'หญิง'
                  : 'อื่น',
            birth_date: userData.Birthdate,
            weight: userData.Weight,
            height: userData.Height,
            bust: userData.Bust,
            waist: userData.Waist,
            hip: userData.Hip,
            phone: userData.Phonenumber,
            profile: userData.Picture,
          });
        } else {
          messageApi.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        messageApi.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [messageApi, navigate]);

  return (
    <>
      {contextHolder}
      <Headers />
      <div className="profile-container">
        <h1 className="profile-title">ข้อมูลโปรไฟล์</h1>

        {loading ? (
          <Spin />
        ) : (
          <div className="profile-box">
            <Link to="/editProfile" className="editProfile">
              แก้ไข
            </Link>

            <div className="profile-header">
              {users?.profile ? (
                <img src={users.profile} alt="Profile" className="profile-picture" />
              ) : (
                <div className="no-profile-picture">ไม่มีรูปประจำตัว</div>
              )}
              <h2 style={{ color: 'black' }}>
                {users?.user_name || 'ไม่พบชื่อผู้ใช้'}
              </h2>

            </div>

            <div className="profile-content">
              <div className="item">
                <span className="label">ชื่อ-นามสกุล</span>
                <span className="value">{users ? `${users.first_name} ${users.last_name}` : '-'}</span>

                <span className="label">อีเมล</span>
                <span className="value">{users?.email || '-'}</span>
              </div>

              <div className="item">
                <span className="label">เพศ</span>
                <span className="value">{users?.gender || '-'}</span>

                <span className="label">วันเกิด</span>
                <span className="value">{users?.birth_date ? dayjs(users.birth_date).format('DD/MM/YYYY') : '-'}</span>
              </div>

              <div className="item">
                <span className="label">เบอร์โทร</span>
                <span className="value">{users?.phone || '-'}</span>

                <span className="label">น้ำหนัก</span>
                <span className="value">{users?.weight !== null ? `${users.weight} กก.` : 'ยังไม่ได้ระบุ'}</span>
              </div>

              <div className="item">
                <span className="label">ส่วนสูง</span>
                <span className="value">{users?.height !== null ? `${users.height} ซม.` : 'ยังไม่ได้ระบุ'}</span>

                <span className="label">รอบอก</span>
                <span className="value">{users?.bust !== null ? `${users.bust} ซม.` : 'ยังไม่ได้ระบุ'}</span>
              </div>

              <div className="item">
                <span className="label">รอบเอว</span>
                <span className="value">{users?.waist !== null ? `${users.waist} ซม.` : 'ยังไม่ได้ระบุ'}</span>

                <span className="label">รอบสะโพก</span>
                <span className="value">{users?.hip !== null ? `${users.hip} ซม.` : 'ยังไม่ได้ระบุ'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
