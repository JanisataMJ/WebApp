import React, { useEffect, useState } from 'react'; 
import './Income.css'; 
import Headers from '../../compronents/Pubblic_components/headerselect';
import { DollarCircleOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import CategoryNavWriter from '../../compronents/Writer_components/CatogoryNavWriter';
import WithdrawConfirm from '../../compronents/Writer_components/withdraw/WithdrawConfirmPopup';
import SuccessPopup from '../../compronents/Writer_components/withdraw/SuccessPopup_withdraw';
import { GetUsersById, updateIncomeReduce } from '../../services/https/User/user';


const Withdraw: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [selectedBank, setSelectedBank] = useState("เลือกธนาคาร"); 
  const [accountNumber, setAccountNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>(""); 
  const [isPopupOpen, setIsPopupOpen] = useState(false); 
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false); 
  const [income, setIncome] = useState<number | null>(null); 
  const [error, setError] = useState<string | null>(null); 
  const userId = localStorage.getItem('id');

  const banks = [
    { name: "ธนาคารไทยพาณิชย์ (SCB)", logo: scbLogo },
    { name: "ธนาคารกรุงเทพ (BBL)", logo: bblLogo },
    { name: "ธนาคารกสิกรไทย (KBank)", logo: kbankLogo },
    { name: "ธนาคารกรุงไทย (KTB)", logo: ktbLogo }
  ];

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        if (userId) {
          const userData = await GetUsersById(String(userId));
          setIncome(userData.data.income);
        }
      } catch (error) {
        console.error('Error fetching user income:', error);
      }
    };

    fetchIncome();
  }, [userId]);

  const handleWithdraw = () => {
    setError(null); 

    if (selectedBank === "เลือกธนาคาร" || !accountNumber || !fullName || !withdrawAmount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (income === null) {
      alert("กรุณารอให้ข้อมูลรายได้ถูกโหลด");
      return;
    }

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      setError("กรุณากรอกจำนวนเงินที่ถูกต้อง"); 
      return;
    }

    if (amount < 100) {
      setError("จำนวนเงินถอนขั้นต่ำคือ 100 บาท"); 
      return;
    }

    if (amount > income) {
      setError("ยอดเงินไม่เพียงพอ"); 
      return;
    }

    setIsPopupOpen(true); 
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleConfirmWithdraw = async () => {
    if (income === null) {
      alert("Error: Income data is not available.");
      return;
    }

    await updateIncomeReduce(parseFloat(withdrawAmount), localStorage.getItem('id') || '', setIncome);
    await CreateTransaction({
      trans_type: "ถอน",
      payment: selectedBank,
      amount_t: Number(withdrawAmount),
      user_id: Number(userId)
    });

    setAccountNumber("");
    setFullName("");
    setWithdrawAmount("");
    handleClosePopup();
    setIsSuccessPopupOpen(true); 
  };

  const handleCloseSuccessPopup = () => {
    setIsSuccessPopupOpen(false);
  };

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); 
    setWithdrawAmount(value);
    setError(null); 
  };

  return (
    <>
      <Headers />
      <CategoryNavWriter />
      <div className='layout-bg-Withdraw'>
        <div className='bg-withdraw'>
          <label className='work-text-income'>WITHDRAW</label>
          <div className='work-text-incomeUser' style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '36px' ,fontWeight: 'bolder'}}> 
              <img src="..\src\assets\coin.png" style={{ marginRight: '10px', width: '60px', height: '60px' }} />
              <span>{income !== null ? `${income} เหรียญ` : 'Loading...'}</span>
            </div>
            <div style={{fontSize: '24px' ,fontWeight: 'bolder'}}>
              <span>= {income !== null ? `${(income * 0.5 - income * 0.5 * 0.03 - income * 0.5 * 0.4).toFixed(2)} บาท` : 'Calculating...'}</span>
            </div>
          </div>

          <div className='input-contanier-amountWithdrawn'>
            <input 
              type="text" 
              className={`input-field-amountWithdrawn ${error ? 'error' : ''}`} 
              placeholder="กรอกจำนวนเงินที่ต้องการถอน : เหรียญ"
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange} 
            />
            {error && <p className="error-message-withdraw">{error}</p>} 
          </div>

          <div className='bottom-container-withdraw'> 
            <div className="input-wrapper-dropdownBank">
              <Select 
                className="work-dropdown-item-withdraw"
                value={selectedBank}
                onChange={(value) => setSelectedBank(value)}
                placeholder="เลือกธนาคาร"
                style={{ width: '100%' }} 
              >
                {banks.map((bank, index) => (
                  <Select.Option key={index} value={bank.name}>
                    <img src={bank.logo} alt={bank.name} style={{ width: '20px', marginRight: '8px' }} />
                    {bank.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <input 
              type="text" 
              className="input-field" 
              placeholder="เลขบัญชีผู้รับเงิน"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))} 
            />

            <input 
              type="text" 
              className="input-field" 
              placeholder="ชื่อนามสกุล"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.replace(/[0-9]/g, ''))} 
            />
          </div>

          <div className='withdrawButton-container'>
            <button className="button-withdraw-save" onClick={handleWithdraw}> 
              <DollarCircleOutlined style={{ fontSize: '30px' }} /> ยืนยันการถอนเงิน
            </button>
          </div>

          {/* Withdraw Confirm Popup */}
          <WithdrawConfirm 
            isOpen={isPopupOpen}
            onClose={handleClosePopup}
            selectedBank={selectedBank}
            fullName={fullName}
            accountNumber={accountNumber}
            onConfirm={handleConfirmWithdraw} 
            netIncomeValue={''} 
          />

          {/* Success Popup */}
          <SuccessPopup 
            isOpen={isSuccessPopupOpen} 
            onClose={handleCloseSuccessPopup} 
          />
        </div>
      </div>
    </>
  );
};

export default Withdraw;
