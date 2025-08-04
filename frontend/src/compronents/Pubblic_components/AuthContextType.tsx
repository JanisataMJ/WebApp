// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// สร้าง context
const AuthContext = createContext<any>(null);

// สร้าง hook สำหรับใช้งาน context
export const useAuth = () => useContext(AuthContext);

// สร้าง AuthProvider เพื่อใช้จัดการ state การล็อกอิน
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // ตรวจสอบสถานะการล็อกอินจาก localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // ฟังก์ชันสำหรับล็อกอิน
  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  // ฟังก์ชันสำหรับล็อกเอาท์
  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
