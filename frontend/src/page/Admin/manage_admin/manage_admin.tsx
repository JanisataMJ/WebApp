import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './manageAdmin.css';
import AddAdmin from './create/create_admin';
import EditAdmin from './edit/edit_admin';
import ViewUser from './view_user/view_user';

import { Space, Table, Button, Col, Row, Divider, Modal, message, Select, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetUsers, DeleteUsersById } from "../../../services/https/User/user";
import { UsersInterface } from '../../../interface/profile_interface/IProfile';
import dayjs from "dayjs";

const { Option } = Select;
const { confirm } = Modal;

function ManageAdmin() {
  const currentAdminID = Number(localStorage.getItem("id"));

  // State management
  const [admins, setAdmins] = useState<UsersInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<UsersInterface | null>(null);
  const [users, setUser] = useState<UsersInterface | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);


  // Memoized filtered data
  const filteredAdmins = useMemo(() => {
    if (roleFilter === undefined) return admins; // แสดงทั้งหมด
    return admins.filter(admin => Number(admin.RoleID) === Number(roleFilter));
  }, [admins, roleFilter]);


  // Memoized table columns
  const columns: ColumnsType<UsersInterface> = useMemo(() => [
    {
      title: <span className="table-header-manageadmin">ลำดับ</span>,
      key: "no",
      width: "5%",
      render: (text, record, index) => {
        const currentPage = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return currentPage === 1 ? index + 1 : (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: <span className="table-header-manageadmin">รูปภาพ</span>,
      dataIndex: "profile",
      key: "profile",
      width: "8%",
      render: (text, record) => (
        <div className="profile-image-container-manageadmin">
          {record.profile ? (
            <img
              src={`http://localhost:8000/${record.profile}`}
              className="profile-image-manageadmin"
              alt="Profile"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <UserOutlined style={{ fontSize: 32, color: '#C2B4D7' }} />
          )}
        </div>
      ),
    },
    {
      title: <span className="table-header-manageadmin">ชื่อผู้ใช้</span>,
      dataIndex: "username",
      key: "username",
      width: "12%",
      render: (username) => (
        <span style={{ fontWeight: 600, color: '#57648E' }}>
          {username || "ไม่พบข้อมูล"}
        </span>
      ),
    },
    {
      title: <span className="table-header-manageadmin">ชื่อ-นามสกุล</span>,
      key: "fullName",
      width: "18%",
      render: (text, record) => (
        <span style={{ fontWeight: 500 }}>
          {`${record.firstName || ''} ${record.lastName || ''}`}
        </span>
      ),
    },
    {
      title: <span className="table-header-manageadmin">อีเมล</span>,
      dataIndex: "email",
      key: "email",
      width: "16%",
      render: (email) => (
        <span style={{ color: '#666' }}>
          {email || "ไม่พบข้อมูล"}
        </span>
      ),
    },
    {
      title: <span className="table-header-manageadmin">เบอร์โทรศัพท์</span>,
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: "10%",
      render: (phone) => phone || "ไม่พบข้อมูล",
    },
    {
      title: <span className="table-header-manageadmin">วันเกิด</span>,
      dataIndex: "birthdate",
      key: "birthdate",
      width: "10%",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "ไม่พบข้อมูล",
    },
    {
      title: <span className="table-header-manageadmin">เพศ</span>,
      dataIndex: "genderID",
      key: "gender",
      width: "6%",
      render: (gender) => {
        const genderConfig = {
          1: { text: "ชาย", color: "#57648E" },
          2: { text: "หญิง", color: "#934A5E" }
        };
        const config = genderConfig[gender as keyof typeof genderConfig];
        return config ? (
          <span style={{ color: config.color, fontWeight: 600 }}>
            {config.text}
          </span>
        ) : "ไม่พบข้อมูล";
      },
    },
    {
      title: <span className="table-header-manageadmin">บทบาท</span>,
      dataIndex: "RoleID",
      key: "role",
      width: "8%",
      render: (role) => {
        const roleConfig = {
          1: { text: "แอดมิน", color: "#934A5E", icon: <UserOutlined /> },
          2: { text: "ผู้ใช้", color: "#57648E", icon: <TeamOutlined /> }
        };
        const config = roleConfig[role as keyof typeof roleConfig];
        return config ? (
          <span style={{
            color: config.color,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            {config.icon}
            {config.text}
          </span>
        ) : "ไม่พบข้อมูล";
      },
    },
    {
      title: <span className="table-header-manageadmin">จัดการ</span>,
      key: "manage",
      width: "7%",
      render: (text, record) => (
        <div className="action-buttons-manageadmin">
          {record.RoleID === 1 ? (
            <>
              <Button
                onClick={() => handleEditAdmin(record)}
                shape="circle"
                icon={<EditOutlined />}
                size="middle"
                className="edit-btn-manageadmin"
                title="แก้ไขข้อมูล"
              />
              {record.ID !== currentAdminID && (
                <Button
                  onClick={() => showDeleteConfirm(record)}
                  shape="circle"
                  icon={<DeleteOutlined />}
                  size="middle"
                  className="delete-btn-manageadmin"
                  title="ลบข้อมูล"
                />
              )}
            </>
          ) : (
            <Button
              onClick={() => handleViewMore(record)}
              type="default"
              size="middle"
              className="view-btn-manageadmin"
              title="ดูข้อมูลเพิ่มเติม"
            >
              ดูข้อมูล
            </Button>
          )}
        </div>
      ),
    },
  ], [currentAdminID, pagination.current, pagination.pageSize]);

  // Get admin data with loading state
  const getAdmins = useCallback(async () => {
    try {
      setTableLoading(true);
      const res = await GetUsers();
      console.log("Users data:", res);

      if (res && Array.isArray(res.data)) {
        setAdmins(res.data);
      } else if (Array.isArray(res)) {
        setAdmins(res);
      } else {
        console.error("Error: Received data is not an array", res);
        messageApi.error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      messageApi.error("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      setAdmins([]);
    } finally {
      setTableLoading(false);
    }
  }, [messageApi]);

  // Enhanced delete confirmation with modern modal
  const showDeleteConfirm = useCallback((admin: UsersInterface) => {
    if (admin.ID === currentAdminID) {
      messageApi.error("คุณไม่สามารถลบบัญชีของตัวเองได้!");
      return;
    }

    confirm({
      title: 'ยืนยันการลบข้อมูล',
      icon: <ExclamationCircleOutlined style={{ color: '#934A5E' }} />,
      content: (
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
            คุณต้องการลบแอดมิน <strong>"{admin.username}"</strong> หรือไม่?
          </p>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>
      ),
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      centered: true,
      okButtonProps: {
        style: {
          background: 'linear-gradient(135deg, #934A5E, #934A5E)',
          borderColor: '#934A5E',
          borderRadius: '8px',
          fontWeight: 600,
          height: '40px',
          padding: '0 20px',
          color: '#ffffffff',
        }
      },
      cancelButtonProps: {
        style: {
          borderColor: '#C2B4D7',
          color: '#57648E',
          borderRadius: '8px',
          fontWeight: 600,
          height: '40px',
          padding: '0 20px'
        }
      },
      onOk: () => handleDeleteAdmin(admin.ID),
    });
  }, [currentAdminID, messageApi]);

  const handleDeleteAdmin = useCallback(async (adminId: number | undefined) => {
    if (!adminId) return;

    setLoading(true);
    try {
      const res = await DeleteUsersById(String(adminId));
      if (res) {
        messageApi.success({
          content: "ลบข้อมูลสำเร็จ",
          duration: 3,
          style: { marginTop: '20vh' }
        });
        await getAdmins();
      } else {
        messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (error) {
      console.error("Delete error:", error);
      messageApi.error("เกิดข้อผิดพลาด! กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [messageApi, getAdmins]);

  // Event handlers
  const handleAddAdmin = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAddModalCancel = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleAddSuccess = useCallback(() => {
    getAdmins();
    messageApi.success({
      content: "เพิ่มแอดมินสำเร็จ",
      duration: 3,
      style: { marginTop: '20vh' }
    });
  }, [getAdmins, messageApi]);

  const handleEditAdmin = useCallback((admin: UsersInterface) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalCancel = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedAdmin(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    getAdmins();
    messageApi.success({
      content: "แก้ไขข้อมูลสำเร็จ",
      duration: 3,
      style: { marginTop: '20vh' }
    });
  }, [getAdmins, messageApi]);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  }, []);

  const handleViewMore = useCallback((user: UsersInterface) => {
    setSelectedAdmin(user);
    setIsViewModalOpen(true);
  }, []);

  const handleViewModalCancel = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedAdmin(null);
  }, []);

  // Filter handler
  const handleRoleFilterChange = useCallback((value: string) => {
    if (value === "") {
      setRoleFilter(undefined);   // กรณีเลือก "ทั้งหมด" => ไม่กรอง
    } else {
      setRoleFilter(Number(value)); // กรณีเลือก 1 หรือ 2
    }
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);


  // Format numbers with commas
  const formatCount = useCallback((count: number): string => {
    return count.toLocaleString('th-TH');
  }, []);

  // Effects
  useEffect(() => {
    getAdmins();
  }, [getAdmins]);

  return (
    <Spin spinning={loading} tip="กำลังประมวลผล...">
      {contextHolder}

      {/* Header Section */}
      <Row className="header-row-manageadmin">
        <Col xs={24} sm={24} md={12} lg={12}>
          <div className="title-section-manageadmin">
            <h2 className="page-title-manageadmin">จัดการผู้ใช้งานระบบ</h2>
            <span className="admin-count-badge-manageadmin">
              {formatCount(filteredAdmins.length)}
            </span>
          </div>
        </Col>
      </Row>

      <Divider className="section-divider-manageadmin" />

      {/* Filters Section */}
      <Space className="filters-section-manageadmin" direction="vertical">
        <Row className="filters-row-manageadmin">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAdmin}
            className="add-admin-btn-manageadmin"
            size="large"
            loading={loading}
          >
            เพิ่มแอดมิน
          </Button>
          <Space className="filter-controls-manageadmin" wrap>
            <span>กรองตามบทบาท :</span>
            <select
              style={{ minWidth: 150 }}
              value={roleFilter ?? ""}   // ถ้า undefined จะให้เป็น ""
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className='filter-sub-controls-manageadmin'
            >
              <option value="">ทั้งหมด</option>
              <option value="1">แอดมิน</option>
              <option value="2">ผู้ใช้</option>
            </select>

          </Space>
        </Row>
      </Space>

      {/* Table Section */}
      <div className="table-container-manageadmin">
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={filteredAdmins}
          loading={tableLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredAdmins.length,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `แสดง ${range[0]}-${range[1]} จาก ${formatCount(total)} รายการทั้งหมด`,
            className: "custom-pagination-manageadmin",
            pageSizeOptions: ['5', '10', '20', '50'],
            responsive: true,
          }}
          className="admin-table-manageadmin"
          size="middle"
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <UserOutlined style={{ fontSize: '48px', color: '#C2B4D7', marginBottom: '16px' }} />
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                  {roleFilter !== null ? 'ไม่พบข้อมูลที่ตรงกับการกรอง' : 'ไม่พบข้อมูล'}
                </p>
              </div>
            )
          }}
        />
      </div>

      {/* Modals */}
      <AddAdmin
        open={isAddModalOpen}
        onCancel={handleAddModalCancel}
        onSuccess={handleAddSuccess}
      />

      {selectedAdmin && (
        <EditAdmin
          open={isEditModalOpen}
          onCancel={handleEditModalCancel}
          onSuccess={handleEditSuccess}
          adminData={selectedAdmin}
        />
      )}

      {selectedAdmin && (
        <ViewUser
          open={isViewModalOpen}
          onCancel={handleViewModalCancel}
          userData={selectedAdmin}
        />
      )}
    </Spin>
  );
}

export default ManageAdmin;