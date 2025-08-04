import React, { useState } from 'react';
import { Button, Flex } from 'antd';
import '../Login/Login.css';
import Headers from '../../../compronents/Pubblic_components/headerselect';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '../../../services/https/User/user';
import { message } from 'antd'; // ใช้ message จาก Ant Design เพื่อแสดงผล
import { SignInInterface } from '../../../interface/user_interface/IUser';

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
                    navigate('/');
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
            <div className="container">
                <h1 className="title">เข้าสู่ระบบ</h1>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>อีเมล</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>รหัสผ่าน</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="login-btn">เข้าสู่ระบบ</button>
                        <button type="button" className="signup-btn" onClick={Signup}>สมัครสมาชิก</button>
                    </div>
                </form>
                <div>
                    <button type="button" className='button-link'>Forgot your password?</button>
                </div>
            </div>
        </>
    );
};

export default Login;