import React, { useState } from "react";

const CreditCardForm: React.FC = () => {
  const [cardNumber, setCardNumber] = useState("");

  // ฟังก์ชันเพิ่มช่องว่างทุก 4 หลัก
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s+/g, '') // ลบช่องว่างเดิมทั้งหมด
      .replace(/[^0-9]/g, '') // อนุญาตเฉพาะตัวเลขเท่านั้น
      .replace(/(\d{4})/g, '$1 ') // เพิ่มช่องว่างหลังจากทุก 4 หลัก
      .trim(); // ลบช่องว่างที่เกินออก
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatCardNumber(inputValue);
    setCardNumber(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCardNumber = cardNumber.replace(/\s/g, ''); // ลบช่องว่างก่อนส่งข้อมูล
    console.log("Formatted Card Number:", cardNumber);
    console.log("Raw Card Number:", rawCardNumber);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="card-number">หมายเลขบัตรเครดิต:</label>
        <input
          type="text"
          id="card-number"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19} // รวมช่องว่างเข้าไปด้วย (16 หลัก + 3 ช่องว่าง)
          required
          placeholder="หมายเลข 16 หลัก"
        />
      </div>

      {/* ส่วนอื่น ๆ ของฟอร์ม */}
      <button type="submit">ชำระเงิน</button>
    </form>
  );
};

export default CreditCardForm;