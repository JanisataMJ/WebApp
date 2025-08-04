  // WithdrawConfirm.tsx
  import React from 'react';

  interface WithdrawConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    netIncomeValue: string;
    selectedBank: string;
    fullName: string;
    accountNumber: string;
    onConfirm: () => void;
  }

  const WithdrawConfirm: React.FC<WithdrawConfirmProps> = ({
    isOpen,
    onClose,
    netIncomeValue,
    selectedBank,
    fullName,
    accountNumber,
    onConfirm
  }) => {
    if (!isOpen) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>ยืนยันการถอนเงิน</h2>
          <p>
            คุณต้องการถอนเงินจำนวน {netIncomeValue} บาท ไปยังบัญชี {selectedBank} ใช่หรือไม่?
          </p>
          <p>
            ชื่อผู้ถอน: {fullName}<br />
            เลขบัญชี: {accountNumber}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ marginRight: '10px'}}>ยกเลิก</button>
            <button onClick={onConfirm}>ยืนยัน</button>
          </div>
        </div>
      </div>
    );
  };

  export default WithdrawConfirm;
