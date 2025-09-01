import React, { useState } from 'react';
import { Layout,Menu,Table,Button,Modal,Form,Input,Select,Card,Statistic,Space,Typography,message,Popconfirm,Row,Col,Avatar } from 'antd';
import { DashboardOutlined,FileTextOutlined,UserOutlined,CrownOutlined,LogoutOutlined,PlusOutlined,EditOutlined,DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import Headers from '../../compronents/Pubblic_components/headerselect';
import './AdminHome.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Types
interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  status: 'draft' | 'published';
  content?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  date: string;
  status: 'active' | 'inactive';
}

interface Admin {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Content Admin' | 'Super Admin';
  date: string;
}

type MenuKey = 'dashboard' | 'articles' | 'users' | 'admins';

const AdminHome: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuKey>('dashboard');
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [articleForm] = Form.useForm();
  const [adminForm] = Form.useForm();

  // Sample data
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      title: 'การเริ่มต้นเขียนโปรแกรม',
      author: 'Admin',
      date: '2025-08-27',
      status: 'published',
      content: 'เนื้อหาบทความเกี่ยวกับการเขียนโปรแกรม...'
    },
    {
      id: 2,
      title: 'เทคนิคการออกแบบ UI/UX',
      author: 'Admin',
      date: '2025-08-25',
      status: 'published',
      content: 'เนื้อหาบทความเกี่ยวกับ UI/UX...'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      date: '2025-08-20',
      status: 'active'
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      date: '2025-08-22',
      status: 'active'
    }
  ]);

  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 1,
      username: 'super_admin',
      email: 'admin@example.com',
      role: 'Super Admin',
      date: '2025-01-01'
    },
    {
      id: 2,
      username: 'content_admin',
      email: 'content@example.com',
      role: 'Content Admin',
      date: '2025-08-15'
    }
  ]);

  // Menu items
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'แดชบอร์ด'
    },
    {
      key: 'articles',
      icon: <FileTextOutlined />,
      label: 'จัดการบทความ'
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'จัดการผู้ใช้'
    },
    {
      key: 'admins',
      icon: <CrownOutlined />,
      label: 'จัดการแอดมิน'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ'
    }
  ];

  // Article table columns
  const articleColumns: ColumnsType<Article> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'หัวข้อ',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'ผู้เขียน',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`status-badge ${status}`}>
          {status === 'published' ? 'เผยแพร่แล้ว' : 'แบบร่าง'}
        </span>
      )
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditArticle(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?"
            onConfirm={() => handleDeleteArticle(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // User table columns
  const userColumns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'วันที่สมัคร',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`status-badge ${status}`}>
          {status === 'active' ? 'ใช้งานได้' : 'ระงับ'}
        </span>
      )
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?"
          onConfirm={() => handleDeleteUser(record.id)}
          okText="ใช่"
          cancelText="ไม่"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            ลบ
          </Button>
        </Popconfirm>
      )
    }
  ];

  // Admin table columns
  const adminColumns: ColumnsType<Admin> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'ชื่อผู้ใช้',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'สิทธิ์',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: 'วันที่เพิ่ม',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditAdmin(record)}
          >
            แก้ไข
          </Button>
          {record.role !== 'Super Admin' && (
            <Popconfirm
              title="คุณแน่ใจหรือไม่ว่าต้องการลบแอดมินนี้?"
              onConfirm={() => handleDeleteAdmin(record.id)}
              okText="ใช่"
              cancelText="ไม่"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                ลบ
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // Event handlers
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      Modal.confirm({
        title: 'ออกจากระบบ',
        content: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?',
        onOk: () => {
          message.success('ออกจากระบบเรียบร้อยแล้ว');
          // Handle logout logic here
        }
      });
      return;
    }
    setCurrentMenu(key as MenuKey);
  };

  const handleAddArticle = () => {
    setEditingArticle(null);
    articleForm.resetFields();
    setArticleModalVisible(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    articleForm.setFieldsValue(article);
    setArticleModalVisible(true);
  };

  const handleDeleteArticle = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
    message.success('ลบบทความเรียบร้อยแล้ว');
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    message.success('ลบผู้ใช้เรียบร้อยแล้ว');
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    adminForm.resetFields();
    setAdminModalVisible(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    adminForm.setFieldsValue(admin);
    setAdminModalVisible(true);
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins(admins.filter(admin => admin.id !== id));
    message.success('ลบแอดมินเรียบร้อยแล้ว');
  };

  const handleArticleSubmit = (values: any) => {
    if (editingArticle) {
      // Update existing article
      setArticles(articles.map(article =>
        article.id === editingArticle.id
          ? { ...article, ...values }
          : article
      ));
      message.success('แก้ไขบทความเรียบร้อยแล้ว');
    } else {
      // Add new article
      const newId = Math.max(...articles.map(a => a.id)) + 1;
      const newArticle: Article = {
        id: newId,
        date: new Date().toISOString().split('T')[0],
        ...values
      };
      setArticles([...articles, newArticle]);
      message.success('เพิ่มบทความเรียบร้อยแล้ว');
    }
    setArticleModalVisible(false);
  };

  const handleAdminSubmit = (values: any) => {
    if (editingAdmin) {
      // Update existing admin
      setAdmins(admins.map(admin =>
        admin.id === editingAdmin.id
          ? { ...admin, ...values }
          : admin
      ));
      message.success('แก้ไขแอดมินเรียบร้อยแล้ว');
    } else {
      // Add new admin
      const newId = Math.max(...admins.map(a => a.id)) + 1;
      const newAdmin: Admin = {
        id: newId,
        date: new Date().toISOString().split('T')[0],
        ...values
      };
      setAdmins([...admins, newAdmin]);
      message.success('เพิ่มแอดมินเรียบร้อยแล้ว');
    }
    setAdminModalVisible(false);
  };

  // Render content based on current menu
  const renderContent = () => {
    switch (currentMenu) {
      case 'dashboard':
        return (
          <div>
            <Title level={3}>สถิติรวม</Title>
            <Row gutter={16} className="stats-row">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="บทความทั้งหมด"
                    value={articles.length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="ผู้ใช้ทั้งหมด"
                    value={users.length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="แอดมินทั้งหมด"
                    value={admins.length}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="การเข้าชมวันนี้"
                    value={1234}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'articles':
        return (
          <div>
            <div className="section-header">
              <Title level={3}>จัดการบทความ</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddArticle}
              >
                เพิ่มบทความใหม่
              </Button>
            </div>
            <Table
              columns={articleColumns}
              dataSource={articles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        );

      case 'users':
        return (
          <div>
            <Title level={3}>จัดการผู้ใช้</Title>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        );

      case 'admins':
        return (
          <div>
            <div className="section-header">
              <Title level={3}>จัดการแอดมิน</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddAdmin}
              >
                เพิ่มแอดมินใหม่
              </Button>
            </div>
            <Table
              columns={adminColumns}
              dataSource={admins}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
    <div><Headers />
      <div className="health-dashboard-admin">
        Admin Home
      </div>
    </div>
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="admin-sider"
        width={250}
      >
        <div className="logo">
          <Avatar size={40} icon={<CrownOutlined />} />
          {!collapsed && <span className="logo-text">Admin Panel</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentMenu]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Title level={4} className="header-title">
            ยินดีต้อนรับสู่ระบบจัดการ
          </Title>
        </Header>

        <Content className="admin-content">
          {renderContent()}
        </Content>
      </Layout>

      {/* Article Modal */}
      <Modal
        title={editingArticle ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}
        open={articleModalVisible}
        onCancel={() => setArticleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={articleForm}
          layout="vertical"
          onFinish={handleArticleSubmit}
        >
          <Form.Item
            label="หัวข้อบทความ"
            name="title"
            rules={[{ required: true, message: 'กรุณากรอกหัวข้อบทความ' }]}
          >
            <Input placeholder="กรอกหัวข้อบทความ" />
          </Form.Item>

          <Form.Item
            label="เนื้อหา"
            name="content"
            rules={[{ required: true, message: 'กรุณากรอกเนื้อหา' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="กรอกเนื้อหาบทความ"
            />
          </Form.Item>

          <Form.Item
            label="ผู้เขียน"
            name="author"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้เขียน' }]}
          >
            <Input placeholder="กรอกชื่อผู้เขียน" />
          </Form.Item>

          <Form.Item
            label="สถานะ"
            name="status"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="draft">แบบร่าง</Option>
              <Option value="published">เผยแพร่</Option>
            </Select>
          </Form.Item>

          <Form.Item className="modal-actions">
            <Space>
              <Button onClick={() => setArticleModalVisible(false)}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                บันทึก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Admin Modal */}
      <Modal
        title={editingAdmin ? 'แก้ไขแอดมิน' : 'เพิ่มแอดมินใหม่'}
        open={adminModalVisible}
        onCancel={() => setAdminModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={adminForm}
          layout="vertical"
          onFinish={handleAdminSubmit}
        >
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
          >
            <Input placeholder="กรอกชื่อผู้ใช้" />
          </Form.Item>

          <Form.Item
            label="อีเมล"
            name="email"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input placeholder="กรอกอีเมล" />
          </Form.Item>

          {!editingAdmin && (
            <Form.Item
              label="รหัสผ่าน"
              name="password"
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
            >
              <Input.Password placeholder="กรอกรหัสผ่าน" />
            </Form.Item>
          )}

          <Form.Item
            label="สิทธิ์"
            name="role"
            rules={[{ required: true, message: 'กรุณาเลือกสิทธิ์' }]}
          >
            <Select placeholder="เลือกสิทธิ์">
              <Option value="Admin">Admin</Option>
              <Option value="Content Admin">Content Admin</Option>
              <Option value="Super Admin">Super Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item className="modal-actions">
            <Space>
              <Button onClick={() => setAdminModalVisible(false)}>
                ยกเลิก
              </Button>
              <Button type="primary" htmlType="submit">
                บันทึก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
    </div>
  );
};

export default AdminHome;