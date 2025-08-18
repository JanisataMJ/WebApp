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
          console.log('User data:', userData);

          setUsers({
            user_name: userData.username || '-', 
            first_name: userData.firstName || '-', 
            last_name: userData.lastName || '-',
            email: userData.email || '-',
            gender: userData.Gender?.Gender 
              ? userData.Gender.Gender
              : userData.genderID === 1
                ? 'Male'
                : userData.genderID === 2
                  ? 'Female'
                  : 'Not specified',
            birth_date: userData.birthdate ? dayjs(userData.birthdate).toDate() : null,
            weight: userData.weight || null,
            height: userData.height || null,
            bust: userData.bust || null,
            waist: userData.waist || null,
            hip: userData.hip || null,
            phone: userData.phonenumber || '-',
            profile: userData.picture || '', 
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
              {users?.profile ? (
                <img src={users.profile} alt="Profile" className="profile-picture" />
              ) : (
                <div className="no-profile-picture">No profile picture</div>
              )}
              <h2 style={{ color: 'black' }}>
                {users?.user_name || 'Username not found'}
              </h2>
            </div>

            <div className="profile-content">
              <div className="item">
                <span className="label">Full Name</span>
                <span className="value">{users ? `${users.first_name} ${users.last_name}` : '-'}</span>

                <span className="label">Email</span>
                <span className="value">{users?.email || '-'}</span>
              </div>

              <div className="item">
                <span className="label">Gender</span>
                <span className="value">{users?.gender || '-'}</span>

                <span className="label">Birth Date</span>
                <span className="value">
                  {users?.birth_date ? dayjs(users.birth_date).format('DD/MM/YYYY') : '-'}
                </span>
              </div>

              <div className="item">
                <span className="label">Phone</span>
                <span className="value">{users?.phone || '-'}</span>

                <span className="label">Weight</span>
                <span className="value">{users?.weight ? `${users.weight} kg` : 'Not specified'}</span>
              </div>

              <div className="item">
                <span className="label">Height</span>
                <span className="value">{users?.height ? `${users.height} cm` : 'Not specified'}</span>

                <span className="label">Bust</span>
                <span className="value">{users?.bust ? `${users.bust} cm` : 'Not specified'}</span>
              </div>

              <div className="item">
                <span className="label">Waist</span>
                <span className="value">{users?.waist ? `${users.waist} cm` : 'Not specified'}</span>

                <span className="label">Hip</span>
                <span className="value">{users?.hip ? `${users.hip} cm` : 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
