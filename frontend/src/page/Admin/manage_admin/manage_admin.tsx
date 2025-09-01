import React, { useState, useEffect } from 'react';
import Headers from '../../../compronents/Pubblic_components/headerselect';
import './manageAdmin.css';
import AddAdmin from './create/create_admin';
import EditAdmin from './edit/edit_admin';
import ViewUser from './view_user/view_user';

import { Space, Table, Button, Col, Row, Divider, Modal, message, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetUsers, DeleteUsersById } from "../../../services/https/User/user";
import { UsersInterface } from '../../../interface/profile_interface/IProfile';
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Option } = Select;
 
function ManageAdmin() {
  const columns: ColumnsType<UsersInterface> = [
    {
      title: <span className="table-header-manageadmin">ลำดับ</span>,
      key: "no",
      width: "8%",
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
      width: "12%",
      render: (text, record) => (
        <div className="profile-image-container-manageadmin">
          <img
            src={record.profile ? `http://localhost:8000/${record.profile}` : '/default-avatar.png'}
            className="profile-image-manageadmin"
            alt="Profile"
          />
        </div>
      ),
    },
    {
      title: <span className="table-header-manageadmin">ชื่อผู้ใช้</span>,
      dataIndex: "username",
      key: "username",
      width: "15%",
      render: (user_name) => user_name || "N/A",
    },
    {
      title: <span className="table-header-manageadmin">ชื่อ-นามสกุล</span>,
      key: "fullName",
      width: "20%",
      render: (text, record) => (
        <span>{`${record.firstName || ''} ${record.lastName || ''}`}</span>
      ),
    },
    {
      title: <span className="table-header-manageadmin">อีเมล</span>,
      dataIndex: "email",
      key: "email",
      width: "20%",
      render: (email) => email || "N/A",
    },
    {
      title: <span className="table-header-manageadmin">เบอร์โทร</span>,
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: "15%",
      render: (phone) => phone || "N/A",
    },
    {
      title: <span className="table-header-manageadmin">วันเกิด</span>,
      dataIndex: "birthdate",
      key: "birthdate",
      width: "15%",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: <span className="table-header-manageadmin">เพศ</span>,
      dataIndex: "genderID",
      key: "gender",
      width: "10%",
      render: (gender) => {
        if (gender === 1) return "ชาย";
        if (gender === 2) return "หญิง";
        return "N/A";
      },
    },
    {
      title: <span className="table-header-manageadmin">Role</span>,
      dataIndex: "RoleID",
      key: "role",
      width: "10%",
      render: (role) => {
        if (role === 1) return "Admin";
        if (role === 2) return "User";
        return "N/A";
      },
    },
    {
      title: <span className="table-header-manageadmin">จัดการ</span>,
      key: "manage",
      width: "15%",
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
              />
              <Button
                onClick={() => showDeleteModal(record)}
                shape="circle"
                icon={<DeleteOutlined />}
                size="middle"
                className="delete-btn-manageadmin"
                danger
              />
            </>
          ) : (
            <Button
              onClick={() => handleViewMore(record)}
              type="default"
              size="middle"
            >
              ดูข้อมูล
            </Button>
          )}
        </div>
      ),
    },
  ];

  const navigate = useNavigate();
  const [admins, setAdmins] = useState<UsersInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [filteredAdmins, setFilteredAdmins] = useState<UsersInterface[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<UsersInterface | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  
  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteModalText, setDeleteModalText] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [roleFilter, setRoleFilter] = useState<number | null>(null);


  const getAdmins = async () => {
    try {
      const res = await GetUsers();
      console.log("Users data:", res);

      // เช็คว่า res.data เป็น array หรือไม่
      if (res && Array.isArray(res.data)) {
        setAdmins(res.data);
        setFilteredAdmins(res.data);
      } else if (Array.isArray(res)) {
        setAdmins(res);
        setFilteredAdmins(res);
      } else {
        console.error("Error: Received data is not an array", res);
        messageApi.error("ข้อมูลที่ได้รับไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      messageApi.error("ไม่สามารถโหลดข้อมูลได้");
    }
  };


  const showDeleteModal = (admin: UsersInterface) => {
    setDeleteModalText(`คุณต้องการลบแอดมิน "${admin.username}" หรือไม่?`);
    setDeleteId(admin.ID || null);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOk = async () => {
    if (!deleteId) return;
    
    setConfirmLoading(true);
    try {
      const res = await DeleteUsersById(String(deleteId));
      if (res) {
        setIsDeleteModalOpen(false);
        messageApi.success("ลบข้อมูลสำเร็จ");
        getAdmins();
      } else {
        messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (error) {
      console.error("Delete error:", error);
      messageApi.error("เกิดข้อผิดพลาด!");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
    setDeleteModalText("");
  };

  const handleAddAdmin = () => {
    setIsAddModalOpen(true);
  };

  const handleAddModalCancel = () => {
    setIsAddModalOpen(false);
  };

  const handleAddSuccess = () => {
    getAdmins(); // Refresh data
    messageApi.success("เพิ่มแอดมินสำเร็จ");
  };

  const handleEditAdmin = (admin: UsersInterface) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleEditSuccess = () => {
    getAdmins(); // Refresh data
    messageApi.success("แก้ไขข้อมูลสำเร็จ");
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  };

  useEffect(() => {
    getAdmins();
  }, []);

  useEffect(() => {
    let data = [...admins];
    if (roleFilter !== null) {
      data = data.filter(admin => Number(admin.RoleID) === Number(roleFilter));
    }
    setFilteredAdmins(data);
    console.log(admins);
  }, [admins, roleFilter]);


  const handleViewMore = (user: UsersInterface) => {
    setSelectedAdmin(user);
    setIsViewModalOpen(true);
  };



  return (
    <><Headers />
    <div className="health-dashboard-manageadmin">
      {contextHolder}
      
      {/* Header Section */}
      <Row className="header-row-manageadmin">
        <Col span={12}>
          <div className="title-section-manageadmin">
            <h2 className="page-title-manageadmin">จัดการแอดมิน</h2>
            <span className="admin-count-badge-manageadmin">
              {filteredAdmins.length}
            </span>
          </div>
        </Col>
        <Col span={12} className="add-button-section-manageadmin">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddAdmin}
            className="add-admin-btn-manageadmin"
            size="large"
          >
            เพิ่มแอดมิน
          </Button>
        </Col>
      </Row>

      <Divider className="section-divider-manageadmin" />

      {/* Filters Section */}
      <Space className="filters-section-manageadmin" direction="vertical">
        <Row className="filters-row-manageadmin">
          <Space className="filter-controls-manageadmin">
            <span>กรองตาม Role: </span>
            <Select
              style={{ width: 150 }}
              placeholder="เลือก Role"
              allowClear
              onChange={(value) => setRoleFilter(value !== undefined ? Number(value) : null)}
            >
              <Option value={1}>Admin</Option>
              <Option value={2}>User</Option>
            </Select>
          </Space>
        </Row>
      </Space>
      
      {/* Table Section */}
      <div className="table-container-manageadmin">
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={filteredAdmins}
          scroll={{ x: "100%" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredAdmins.length,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
            className: "custom-pagination-manageadmin"
          }}
          className="admin-table-manageadmin"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="delete-modal-title-manageadmin">
            <DeleteOutlined className="delete-icon-manageadmin" />
            <span>ยืนยันการลบ</span>
          </div>
        }
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        confirmLoading={confirmLoading}
        onCancel={handleDeleteCancel}
        okText="ลบ"
        cancelText="ยกเลิก"
        className="delete-modal-manageadmin"
        width={450}
      >
        <p className="delete-modal-text-manageadmin">{deleteModalText}</p>
      </Modal>

      {/* Add Admin Modal */}
      <AddAdmin 
        open={isAddModalOpen}
        onCancel={handleAddModalCancel}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Admin Modal */}
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
          onCancel={() => setIsViewModalOpen(false)}
          userData={selectedAdmin}
        />
      )}

    </div>
    </>
  );
}

export default ManageAdmin;