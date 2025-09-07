import React, { useEffect, useState } from 'react';
import Headers from '../../compronents/Pubblic_components/headerselect';
import './AdminHome.css';
import { Card } from "antd";
import { UserOutlined, TeamOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { getAdminCounts } from '../../services/https/AdminCount/count';
import { AdminCountsInterface } from '../../interface/admin_count_interface/count';


const AdminHome: React.FC = () => {
  const [counts, setCounts] = useState<AdminCountsInterface | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getAdminCounts();
        setCounts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
    <div><Headers />
      <div className="health-dashboard-admin">
        Admin Home

        <h2 className="dashboard-title-admin">📊 สรุปข้อมูลระบบ</h2>
      <div className="dashboard-grid-admin">
        <Card className="dashboard-card-admin admin-card-admin">
          <UserOutlined className="dashboard-icon-admin" />
          <h3>จำนวน Admin</h3>
          <p>{counts?.admins}</p>
        </Card>

        <Card className="dashboard-card-admin user-card-admin">
          <TeamOutlined className="dashboard-icon-admin" />
          <h3>จำนวน User</h3>
          <p>{counts?.users}</p>
        </Card>

        <Card className="dashboard-card-admin article-card-admin">
          <FileTextOutlined className="dashboard-icon-admin" />
          <h3>จำนวนบทความ</h3>
          <p>{counts?.articles}</p>
        </Card>
      </div>


      </div>
    </div>
    </div>
  );
};

export default AdminHome;