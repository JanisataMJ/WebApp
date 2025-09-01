import React, { useEffect, useState } from 'react';
import './profile.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import { Link, useNavigate } from 'react-router-dom';
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
      <div className="profile-container">
        <h1 className="profile-title">Profile Information</h1>

        {loading ? (
          <Spin />
        ) : (
          <div className="profile-box">
            <Link to="/editProfile" className="editProfile">
              Edit
            </Link>

            <div className="profile-header">
              {users?.Profile ? (
                <img
                  src={users.Profile}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="no-profile-picture">No profile picture</div>
              )}
              <h2 style={{ color: 'black' }}>
                {users?.Username || 'Username not found'}
              </h2>
            </div>

            <div className="profile-content">
              <div className="item">
                <span className="label">Full Name</span>
                <span className="value">{users ? `${users.FirstName} ${users.LastName}` : '-'}</span>

                <span className="label">Email</span>
                <span className="value">{users?.Email || '-'}</span>
              </div>

              <div className="item">
                <span className="label">Gender</span>
                <span className="value">{getGenderName(users?.GenderID)}</span>

                <span className="label">Birth Date</span>
                <span className="value">
                  {users?.BirthDay ? dayjs(users.BirthDay).format('DD/MM/YYYY') : '-'}
                </span>
              </div>

              <div className="item">
                <span className="label">Phone</span>
                <span className="value">{users?.Phonenumber || '-'}</span>

                <span className="label">Weight</span>
                <span className="value">{users?.Weight ? `${users.Weight} kg` : 'Not specified'}</span>
              </div>

              <div className="item">
                <span className="label">Height</span>
                <span className="value">{users?.Height ? `${users.Height} cm` : 'Not specified'}</span>

                <span className="label">Bust</span>
                <span className="value">{users?.Bust ? `${users.Bust} cm` : 'Not specified'}</span>
              </div>

              <div className="item">
                <span className="label">Waist</span>
                <span className="value">{users?.Waist ? `${users.Waist} cm` : 'Not specified'}</span>

                <span className="label">Hip</span>
                <span className="value">{users?.Hip ? `${users.Hip} cm` : 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
