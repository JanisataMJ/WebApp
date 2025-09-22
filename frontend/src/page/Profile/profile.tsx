import React, { useEffect, useState } from 'react';
import './profile.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { GetUsersById } from '../../services/https/User/user';
//import { UsersInterface } from '../../interface/profile_interface/IProfile';
import { UsersInterface } from '../../interface/user_interface/IUser';
import { message, Spin } from 'antd';
import dayjs from 'dayjs';

const Profile: React.FC = () => {
  const [users, setUsers] = useState<UsersInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [roleID, setRoleID] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const id = localStorage.getItem('id');
      if (!id) {
        messageApi.error('User ID not found');
        navigate('/');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await GetUsersById(id);

        if (res?.data) {
          const userData = res.data;

          setUsers({
            FirstName: userData.firstName || '',
            LastName: userData.lastName || '',
            Username: userData.username || '',
            Email: userData.email || '',
            Phonenumber: userData.phonenumber || '',
            Profile: userData.profile
              ? userData.profile.startsWith('uploads/')
                ? `http://localhost:8000/${userData.profile}`
                : `http://localhost:8000/uploads/${userData.profile}`
              : '',
            Weight: userData.weight || undefined,
            Height: userData.height || undefined,
            Bust: userData.bust || undefined,
            Waist: userData.waist || undefined,
            Hip: userData.hip || undefined,
            BirthDay: userData.birthdate
              ? dayjs(userData.birthdate).format('YYYY-MM-DD')
              : undefined,
            GenderID: userData.genderID || undefined
          });

          // แปลง roleID เป็น number
          const numericRoleID = userData.RoleID ? Number(userData.RoleID) : null;
          setRoleID(numericRoleID);

        } else {
          messageApi.error('Unable to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        messageApi.error('An error occurred while fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [messageApi, navigate]);

  const getGenderName = (genderID?: number) => {
    switch (genderID) {
      case 1:
        return 'Male';
      case 2:
        return 'Female';
      case 3:
        return 'Other';
      default:
        return '-';
    }
  };

  return (
    <>
      {contextHolder}
      <Headers />
      <div className='profile-wrapper'>
        <div className="profile-title-section">
          <button
            className="profile-back-button"
            onClick={() => navigate('/admin/home')}
            type="button"
            aria-label="Go Back"
          >
            <ArrowLeftOutlined />
          </button>
          <h1 className="profile-title-back">กลับหน้าหลัก</h1>
        </div>

        <div className='profile-container'>

          {loading ? (
            <Spin />
          ) : (
            <div className="profile-box">
              <h1 className="profile-title">ข้อมูลส่วนตัว</h1>
              <Link to="/editProfile" className="editProfile">
                แก้ไข
              </Link>

              <div className="profile-header">
                {users?.Profile ? (
                  <img
                    src={users.Profile}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="no-profile-picture">ไม่มีรูปโปรไฟล์</div>
                )}
                <h2 style={{ color: 'black' }}>
                  {users?.Username || 'Username not found'}
                </h2>
              </div>

              <div className="profile-content">
                <div className="item">
                  <span className="label">ชื่อ:</span>
                  <span className="value">{users ? `${users.FirstName} ${users.LastName}` : '-'}</span>

                  <span className="label">อีเมล:</span>
                  <span className="value">{users?.Email || '-'}</span>
                </div>

                <div className="item">
                  <span className="label">เพศ:</span>
                  <span className="value">{getGenderName(users?.GenderID)}</span>

                  <span className="label">วันเกิด:</span>
                  <span className="value">
                    {users?.BirthDay ? dayjs(users.BirthDay).format('DD/MM/YYYY') : '-'}
                  </span>
                </div>

                <div className="item">
                  <span className="label">เบอร์โทรศัพท์:</span>
                  <span className="value">{users?.Phonenumber || '-'}</span>
                </div>

                {roleID !== 1 && (
                  <>
                    <div className="item">
                      <span className="label">น้ำหนัก:</span>
                      <span className="value">{users?.Weight ? `${users.Weight} กก.` : 'ไม่ระบุ'}</span>

                      <span className="label">ส่วนสูง:</span>
                      <span className="value">{users?.Height ? `${users.Height} ซม.` : 'ไม่ระบุ'}</span>
                    </div>

                    <div className="item">
                      <span className="label">รอบอก:</span>
                      <span className="value">{users?.Bust ? `${users.Bust} ซม.` : 'ไม่ระบุ'}</span>

                      <span className="label">เอว:</span>
                      <span className="value">{users?.Waist ? `${users.Waist} ซม.` : 'ไม่ระบุ'}</span>
                    </div>

                    <div className="item">
                      <span className="label">สะโพก:</span>
                      <span className="value">{users?.Hip ? `${users.Hip} ซม.` : 'ไม่ระบุ'}</span>
                    </div>
                  </>
                )}

              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
};

export default Profile;
