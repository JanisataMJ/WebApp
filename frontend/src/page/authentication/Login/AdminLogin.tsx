import React, { useState } from 'react';
import { Button, Flex } from 'antd';
import '../Login/Login.css';
import Headers from '../../../compronents/Pubblic_components/headerselect';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '../../../services/https/User/user';
import { message } from 'antd';
import { SignInInterface } from '../../../interface/user_interface/IUser';
import logo from '../../../assets/Logo.jpg';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const goToLogin = () => {
        navigate('/'); // เส้นทางไปยังหน้าล็อคอินยูสเซอร์
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const values: SignInInterface = { email, password };

        try {
            let res = await SignIn(values);
            if (res.status === 200) {
                messageApi.success("Sign-in successful");

                localStorage.setItem("isLogin", "true");
                localStorage.setItem("page", "dashboard");
                localStorage.setItem("token_type", res.data.token_type);
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("id", res.data.id);

                setTimeout(() => {
                    navigate('/home');
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }, 2000);
            } else {
                messageApi.error(res.data.error);
            }
        } catch (error) {
            messageApi.error('Failed to sign in');
        }
    };

    return (
        <>
            {contextHolder}
            {/*<Headers />*/}

            <div className="signin-page-wrapper">
                <div>
                    <img id="Logo" src={logo} alt="Logo" style={{ width: "120px", height: "120px" }} />
                </div>
                <h1 className="signin-title">Admin</h1>

                <div className="signin-container">
                    <form onSubmit={onSubmit}>
                        <div className="signin-form-group">
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="signin-form-group">
                            <label>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {/* ข้อความลิงก์ไปยังหน้าแอดมิน */}
                        <div className="admin-login-link">
                            <span onClick={goToLogin} style={{ cursor: "pointer", color: "#1677ff" , fontSize: "14px"}}>
                                Are you an user?
                            </span>
                        </div>

                        <div className="signin-button-group">
                            <button type="submit" className="login-btn" >Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
