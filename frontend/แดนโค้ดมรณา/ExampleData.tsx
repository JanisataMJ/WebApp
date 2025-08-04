import React, { useState } from 'react';
import { Table, Select } from 'antd';

const { Option } = Select;

const data = [
  {
    Type: 'เติมเหรียญ',
    Payment: 'ทรูวอเล็ต',
    NovelName: '-',
    Time: '20/02/2024 15:04:11',
    Amount: '+50',
  },
  {
    Type: 'ซื้อนิยาย',
    Payment: '-',
    NovelName: 'ฝืนชะตาท้าสามภพ',
    Time: '21/02/2024 16:20:55',
    Amount: '-30',
  },
  {
    Type: 'ซื้อนิยาย',
    Payment: '-',
    NovelName: 'จอมเทพโอสถ',
    Time: '21/02/2024 15:20:55',
    Amount: '-30',
  },
  {
    Type: 'เติมเหรียญ',
    Payment: 'ทรูวอเล็ต',
    NovelName: '-',
    Time: '20/02/2024 15:04:11',
    Amount: '+50',
  },
  {
    Type: 'เติมเหรียญ',
    Payment: 'เครดิต/เดบิต',
    NovelName: '-',
    Time: '20/02/2024 15:04:11',
    Amount: '+50',
  },
  {
    Type: 'เติมเหรียญ',
    Payment: 'พร้อมเพย์',
    NovelName: '-',
    Time: '20/02/2024 15:04:11',
    Amount: '+50',
  },
  
  {
    Type: 'ถอน',
    Payment: 'ธนาคารกรุงไทย',
    NovelName: '-',
    Time: '20/02/2024 15:04:11',
    Amount: '-550',
  },
];

const Demo = () => {
  const [selectedType, setSelectedType] = useState('All');

  const handleChange = (value) => {
    setSelectedType(value);
  };

  const filteredData = selectedType === 'All' 
    ? data 
    : data.filter(item => {
        if (selectedType === 'Deposit' && item.Type === 'เติมเหรียญ') return true;
        if (selectedType === 'Withdraw' && item.Type === 'ถอน') return true;
        if (selectedType === 'Purchase' && item.Type === 'ซื้อนิยาย') return true;
        return false;
      });

  const columns = {
    All: [
      { title: 'ประเภท', dataIndex: 'Type', key: 'Type' },
      { title: 'ช่องทางการทำธุรกรรม', dataIndex: 'Payment', key: 'Payment' },
      { title: 'ชื่อเรื่อง', dataIndex: 'NovelName', key: 'NovelName' },
      { title: 'วัน/เวลา', dataIndex: 'Time', key: 'Time' },
      {
        title: 'ราคาสุทธิ',
        dataIndex: 'Amount',
        key: 'Amount',
        align: 'right',
        render: (text) => (
          <>
            {text} <img id='icon50' src="src/assets/coin-50.png" alt="" />
          </>
        ),
      },
    ],
    Deposit: [
     
    ],
  };

  return (
    <>
      <Select defaultValue="All" onChange={handleChange} style={{ marginBottom: 16 ,width:100}}>
        <Option value="All">ทั้งหมด</Option>
        <Option value="Deposit">ฝาก</Option>
        <Option value="Withdraw">ถอน</Option>
        <Option value="Purchase">ซื้อ</Option>
      </Select>
      <Table
        dataSource={filteredData}
        columns={columns[selectedType]}
        className="large-text-table"
      />
    </>
  );
};

export default Demo;
