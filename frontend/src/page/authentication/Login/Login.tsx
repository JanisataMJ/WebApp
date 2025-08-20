import React, { useState } from 'react';
import { Button, Flex } from 'antd';
import '../Login/Login.css';
import Headers from '../../../compronents/Pubblic_components/headerselect';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '../../../services/https/User/user';
import { message } from 'antd'; // ใช้ message จาก Ant Design เพื่อแสดงผล
import { SignInInterface } from '../../../interface/user_interface/IUser';
import logo from '../../../assets/Logo.jpg';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const Signup = () => {
        navigate('/register');
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
                        window.location.reload(); // รีโหลดหน้าเว็บหลังจากที่นำทางเสร็จ
                    }, 500); // รอให้หน้าเว็บเปลี่ยนก่อน
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
                <img id="Logo" src={logo} alt="Logo" style={{ width: "120px", height: "120px"}}/>
            </div>
            <h1 className="signin-title">Sign In</h1>

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
                    <div className="signin-button-group">
                        <button type="button" className="signup-btn" onClick={Signup} >Sign Up</button>
                        <button type="submit" className="login-btn" >Sign In</button>
                    </div>
                </form>
            </div>
        </div>
    </>
);

};

export default Login;