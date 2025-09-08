import React, { useEffect, useState } from 'react';
import Headers from '../../compronents/Pubblic_components/headerselect';
import './AdminHome.css';
import { UserOutlined, TeamOutlined, FileTextOutlined } from "@ant-design/icons";
import { getAdminCounts } from '../../services/https/AdminCount/count';
import { AdminCountsInterface } from '../../interface/admin_count_interface/count';
import ManageAdmin from './manage_admin/manage_admin';

const AdminHome: React.FC = () => {
  const [counts, setCounts] = useState<AdminCountsInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const data = await getAdminCounts();
        setCounts(data);
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  // Format number with comma separator for better readability
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '0';
    return num.toLocaleString('th-TH');
  };

  return (
    <div>
      <Headers />
      <div className="health-dashboard-admin">
        <h2 className="dashboard-title-admin">📊 สรุปข้อมูลระบบ</h2>
        
        <div className="dashboard-grid-admin">
          {/* ใช้ div แทน Card component เพื่อควบคุม responsive ได้ดีกว่า */}
          <div className={`dashboard-card-admin admin-card-admin ${loading ? 'loading-card' : ''}`}>
            <UserOutlined className="dashboard-icon-admin" />
            <h3>จำนวน Admin</h3>
            <p>{loading ? '...' : formatNumber(counts?.admins)}</p>
          </div>

          <div className={`dashboard-card-admin user-card-admin ${loading ? 'loading-card' : ''}`}>
            <TeamOutlined className="dashboard-icon-admin" />
            <h3>จำนวน User</h3>
            <p>{loading ? '...' : formatNumber(counts?.users)}</p>
          </div>

          <div className={`dashboard-card-admin article-card-admin ${loading ? 'loading-card' : ''}`}>
            <FileTextOutlined className="dashboard-icon-admin" />
            <h3>จำนวนบทความ</h3>
            <p>{loading ? '...' : formatNumber(counts?.articles)}</p>
          </div>
        </div>

        {/* เพิ่ม container wrapper สำหรับ ManageAdmin */}
        <div className="manage-admin-container">
          <ManageAdmin />
        </div>
      </div>
    </div> 
  );
};

export default AdminHome;