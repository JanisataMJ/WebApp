import React from 'react';
import TOP from './header';
import HeaderAdmin from './headerAdmin';
import { useAuth } from './AuthContextType';

const Headers: React.FC = () => {
    const { isLoggedIn } = useAuth();

    if (isLoggedIn === null) {
        return null; 
    }

    const role = localStorage.getItem("role_id");

     if (!isLoggedIn) {
        return null; // ยังไม่ login
    }

    // ตอนนี้เราจะแสดง TOP เสมอถ้า isLoggedIn เป็น true
    return (
        <div>
            {role === "1" ? <HeaderAdmin /> : <TOP />}
        </div>
    );
};

export default Headers;