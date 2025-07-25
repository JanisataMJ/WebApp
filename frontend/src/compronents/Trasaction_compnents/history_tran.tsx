import React, { useState, useEffect } from "react";
import { Table, Select, Spin, Alert } from 'antd';
import { useHistoryContext } from "./HistoryContext";
import { GetTransacUserID } from "../../services/https/Transaction/transaction";
import { ITransaction } from "../../interface/transaction_interface/ITransaction";
import { format } from 'date-fns';
import { GetUsersById } from "../../services/https/User/user";
const { Option } = Select;

const user_id = localStorage.getItem("id") || "";

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filteredData, setFilteredData] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const { triggerHistoryRefresh } = useHistoryContext();

  useEffect(() => {
    const fetchUserAndTransactions = async () => {
      try {
        const userData = await GetUsersById(user_id);
        console.log("User data: ", userData); 
  
        if (userData.data.writer === true) {
          setIsWriter(true);
        } else {
          setIsWriter(false);
        }
  
        const data = await GetTransacUserID(user_id);
  
        // เรียงข้อมูลจากใหม่ไปเก่าตามวันที่ CreatedAt
        const sortedData = data.sort((a: ITransaction, b: ITransaction) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );
  
        setTransactions(sortedData);
        setFilteredData(sortedData);
        setLoading(false);
      } catch (err) {
        setError("ยังไม่มีข้อมูล");
        setLoading(false);
      }
    };
  
    if (user_id) {
      fetchUserAndTransactions();
    } else {
      setError("ไม่มีข้อมูลโปรดเข้าสู่ระบบ");
      setLoading(false);
    }
  }, [user_id, triggerHistoryRefresh]);
  
console.log("isWriter: ", isWriter);
  useEffect(() => {
    const newFilteredData = selectedType === 'All' 
      ? transactions 
      : transactions.filter(item => {
          if (selectedType === 'Deposit' && item.trans_type === 'เติมเหรียญ') return true;
          if (selectedType === 'Withdraw' && item.trans_type === 'ถอน') return true;
          if (selectedType === 'Purchase' && item.trans_type === 'ซื้อนิยาย') return true;
          if (selectedType === 'Income' && item.trans_type === 'รายได้') return true;
          return false;
        });
    setFilteredData(newFilteredData);
  }, [selectedType, transactions]);

  const handleChange = (value: string) => {
    setSelectedType(value);
  };

  const columns: Record<string, any[]> = {
    All: [
      { title: 'ประเภท', dataIndex: 'trans_type', key: 'type', render: (text: string) => text },
      { title: 'ช่องทางการทำธุรกรรม', dataIndex: 'payment', key: 'payment',align: 'center', render: (text: string) => text },
      { 
        title: 'ชื่อเรื่อง', 
        dataIndex: 'Order', 
        key: 'Novel',
        align: 'center', 
        render: (text: any) => text && text.Novel ? text.Novel.novel_name : '-' 
      },
      { title: 'วัน/เวลา', dataIndex: 'CreatedAt', key: 'date',align: 'center', render: (text: string) => format(new Date(text), 'yyyy-MM-dd HH:mm:ss') },
      {
        title: 'ราคาสุทธิ',
        dataIndex: 'amount_t',
        key: 'Amount',
        align: 'right',
        render: (text: any) => text ? (
          <>
            {text} <img id='icon50' src="src/assets/coin-50.png" alt="" />
          </>
        ) : '-',
      },
    ],
    Deposit: [
      { title: 'ประเภท', dataIndex: 'trans_type', key: 'Type', render: (text: string) => text },
      { title: 'ช่องทางการทำธุรกรรม', dataIndex: 'payment', key: 'Payment',align: 'center', render: (text: string) => text },
      { title: 'วัน/เวลา', dataIndex: 'CreatedAt', key: 'date',align: 'center', render: (text: string) => format(new Date(text), 'yyyy-MM-dd HH:mm:ss') },
      {
        title: 'ราคาสุทธิ',
        dataIndex: 'amount_t',
        key: 'Amount',
        align: 'right',
        render: (text: any) => text ? (
          <>
            {text} <img id='icon50' src="src/assets/coin-50.png" alt="" />
          </>
        ) : '-',
      },
    ],
    Withdraw: [
      { title: 'ประเภท', dataIndex: 'trans_type', key: 'Type', render: (text: string) => text },
      { title: 'ช่องทางการทำธุรกรรม', dataIndex: 'payment', key: 'Payment',align: 'center', render: (text: string) => text },
      { title: 'วัน/เวลา', dataIndex: 'CreatedAt', key: 'date',align: 'center', render: (text: string) => format(new Date(text), 'yyyy-MM-dd HH:mm:ss') },
      {
        title: 'ราคาสุทธิ',
        dataIndex: 'amount_t',
        key: 'Amount',
        align: 'right',
        render: (text: any) => text ? (
          <>
            {text} <img id='icon50' src="src/assets/coin-50.png" alt="" />
          </>
        ) : '-',
      },
    ],
    Purchase: [
      { title: 'ประเภท', dataIndex: 'trans_type', key: 'Type', render: (text: string) => text },
      { title: 'ชื่อเรื่อง', dataIndex: 'Order', key: 'NovelName',align: 'center', render: (text: any) => text.Novel ? text.Novel.novel_name : '-' },
      { title: 'วัน/เวลา', dataIndex: 'CreatedAt', key: 'date',align: 'center', render: (text: string) => format(new Date(text), 'yyyy-MM-dd HH:mm:ss') },
      {
        title: 'ราคาสุทธิ',
        dataIndex: 'amount_t',
        key: 'Amount',
        align: 'right',
        render: (text: any) => text ? (
          <>
            {text} <img id='icon50' src="src/assets/coin-50.png" alt="" />
          </>
        ) : '-',
      },
    ],
     Income: [
      { title: 'ประเภท', dataIndex: 'trans_type', key: 'Type', render: (text: string) => text },
      { title: 'ชื่อเรื่อง', dataIndex: 'Order', key: 'NovelName',align: 'center', render: (text: any) => text.Novel ? text.Novel.novel_name : '-' },
      { title: 'วัน/เวลา', dataIndex: 'CreatedAt', key: 'date',align: 'center', render: (text: string) => format(new Date(text), 'yyyy-MM-dd HH:mm:ss') },
      {
        title: 'ราคาสุทธิ',
        dataIndex: 'amount_t',
        key: 'Amount',
        align: 'right',
        render: (text: any) => text ? (
          <>
            {text} <img id='icon50' src="src/assets/coin-50.png" alt="" />
          </>
        ) : '-',
      },
    ],
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <>
      <Select defaultValue="All" onChange={handleChange} style={{ marginBottom: 16, width: 120 }}>
        <Option value="All">ทั้งหมด</Option>
        <Option value="Deposit">เติมเหรียญ</Option>
        <Option value="Purchase">ซื้อนิยาย</Option>
        {isWriter && <Option value="Withdraw">ถอน</Option>}
        {isWriter && <Option value="Income">รายได้</Option>}
      </Select>
      <Table
        dataSource={filteredData}
        columns={columns[selectedType]} 
        rowKey="ID"
        className="large-text-table"
      />
    </>
  );
};

export default History;
