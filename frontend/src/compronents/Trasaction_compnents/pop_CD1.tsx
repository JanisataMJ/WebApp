import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Alert } from 'antd';

import './pop.css';
import './pop_CD1.css';
import { Package } from '../../interface/transaction_interface/IPackgae';
import { GetPackages } from '../../services/https/Package/package';
import CoinCard from './coinCard';
import { CreateTransaction } from '../../services/https/Transaction/transaction';
import { updateCoinBalance } from '../../services/https/Coin/coin';
import { useBalanceContext } from '../Home_components/BalanceContext';
import { useHistoryContext } from './HistoryContext';
import { useAuth } from '../Pubblic_components/AuthContextType';
const Popup3: React.FC = () => {
  const [Package, setPackage] = useState<boolean>(false);
  const [Credit, setCredit] = useState<boolean>(false);
  const { isLoggedIn } = useAuth();
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false)
  const [showVerify, setShowVerifyPopup] = useState<boolean>(false);
  const [selectedPrice, setSelectedPrice] = useState<number >(0);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const closePackage = () => setPackage(false);
  const showPackage = () => setPackage(true);
  
  const closeCredit = () => setCredit(false);

  const CloseVerify = () => setShowVerifyPopup(false);
  const CloseAlert = () => setShowAlert(false);
  const [Key, setKey] = useState(0);
  const userIdstr = localStorage.getItem("id");
  const userId = Number(userIdstr || 0);
  const { triggerRefresh } = useBalanceContext(); 
  const { triggerHistoryRefresh } = useHistoryContext();


  const handleFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    setIsFormValid(form.checkValidity());
  };

  const refresh = () => {
    window.location.reload();
};

  const handleConfirm = () => {
    setCredit(false);

    setTimeout(() => setShowVerifyPopup(true), 300);
  };

  const ConfirmPackage = (amount: number, price: number,key: number) => {
    
    setKey(key);
    setSelectedAmount(amount);
    setSelectedPrice(price);
    setPackage(false);
    {isLoggedIn ?setCredit(true):setShowModal(true)}
   
  };

  const VerifyConfirm = () => {
    const a = selectedAmount;
    CreateTransaction({
      trans_type: "เติมเหรียญ",
      payment: "บัตรเครดิต/เดบิต",
      user_id: userId,
      package_id: Key,
      amount_t: a,
    }); 
    setTimeout(() => {
      triggerRefresh();
      triggerHistoryRefresh();
    }, 1400);

    updateCoinBalance(a,setBalance);
    setShowVerifyPopup(false);
    setTimeout(() => setShowAlert(true), 1500);
  };

  const cursorStyle = isFormValid ? {} : { cursor: 'not-allowed' };

  // Automatically close the alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const response = await GetPackages();
      const data = response.data; // Extract the data array from the response
      setPackages(data);
    };

    fetchPackages();
  }, []);

  const [cardNumber, setCardNumber] = useState("");
  
  const formatCardNumber = (value: string) => {
    return value .replace(/\s+/g, '') // ลบช่องว่างเดิมทั้งหมด
    .replace(/[^0-9]/g, '') // อนุญาตเฉพาะตัวเลขเท่านั้น
    .replace(/(\d{4})/g, '$1 ') // เพิ่มช่องว่างหลังจากทุก 4 หลัก
    .trim()
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  return (
    <>
      <div className="cardPayment" onClick={showPackage}>
        <div className="box2">
          <div className="box1"></div>
          <img id="imgC" src="./src/assets/credit-card.png" alt="credit-card" />
          <div className="box1">
            <span><b>เครดิต/เดบิต</b></span>
          </div>
        </div>
      </div>

      {/* Popup Package */}
      <Modal show={Package} onHide={closePackage}>
        <div className='aap'>
          <div className='prop'>คุ้มสุด!</div>
          <div className="g2p">
            <div className="g2_1p">
              <h3>แพ็กเกจ</h3>
              <div className="cancelIconp" onClick={closePackage}>
                <img src="./src/assets/cancel-svgrepo-com.svg" alt="Cancel" />
              </div>
            </div>
            <div className="g2_2p">
                 
          {packages.filter(data => [1,2,3,4,5,6].includes(data.ID)).map((data) => (
            <CoinCard 
              key={data.ID}
              amount={data.pack_amount} 
              price={data.pack_price}  
              imgSrc={data.pack_pic} 
              sendData={() => ConfirmPackage(data.pack_amount, data.pack_price, data.ID)} 
            />
          ))}
                </div>
              </div>
            </div>
          </Modal>

      {/* Popup Credit */}
      <Modal show={Credit} onHide={closeCredit}>
        <div className="aapx">
        <div className="g2tx">
          <div className="g2_1w">
            <h3>ดำเนินการชำระเงิน</h3>
            <div className="cancelIcon" onClick={closeCredit}>
              <img src="./src/assets/cancel-svgrepo-com.svg" alt="Cancel" />
            </div>
          </div>
          <div className="g23">
            <div className="CardCreditCart">
              <form action="/submit-credit-card" method="POST" onChange={handleFormChange}>
                <div className="o1">
                  <label htmlFor="credit-card">หมายเลขบัตรเครดิต</label><br/>
                  <input type="text" id="credit-card" value={cardNumber} name="credit-card"     onChange={handleCardNumberChange} maxLength={19} placeholder="หมายเลข 16 หลัก" required /><br /><br />
                  <img id='imgcredit' src="./src/assets/credit-card.png" alt="credit-card" />
                </div>
                <div className="o2">
                  <label htmlFor="cardholder-name">ชื่อผู้ถือบัตร</label><br/>
                  <input type="text" id="cardholder-name" name="cardholder-name" placeholder="ชื่อผู้ถือบัตร" required /><br /><br />
                </div>
                <div className="o3">
                  <div className="exp">
                    <label htmlFor="expiry-date">วันหมดอายุ</label><br/>
                  </div>
                  <input type="text" id="expiry-date" name="expiry-date" pattern="\d{2}" maxLength={2}  placeholder="MM" required /><br /><br />
                  <input type="text" id="expiry-date" name="expiry-date" pattern="\d{2}" maxLength={2} placeholder="YY" required /><br /><br />
                </div>
                <div className="o4">
                  <label htmlFor="cvc">CVC/CVV</label><br/>
                  <input type="text" id="cvc" name="cvc" pattern="\d{3}" placeholder="xxx" maxLength={3} required /><br /><br />
                </div>
                <div className="o5">
                  <div className="o5_2">
                    <img id='imgSecureP' src="./src/assets/SecurePayment.png" alt="SecurePayment" /> &nbsp;SECURE PAYMENT
                  </div>
                </div>
              </form>
              <div className="o5_3">
                <button 
                  className='submitCD' 
                  onClick={handleConfirm} 
                  style={cursorStyle} 
                  disabled={!isFormValid}
                >
                  <b>ยืนยัน</b>
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
      </Modal>

          {/*  Verify */}
          <Modal show={showVerify} onHide={CloseVerify}>
        <div className='aap'>
          <div className="g2q">
            <div className="g2_1p">
                <h3>ยืนยันการชำระเงิน</h3>
              <div className="cancelIconpForVerify" onClick={CloseVerify}>
                <img src="./src/assets/cancel-svgrepo-com.svg" alt="Cancel" />
              </div>
            </div>
            <div className="g2_2p">
              <div className='baseP'>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คุณกำลังซื้อ {selectedAmount} คอยน์ ในราคา {selectedPrice} บาท ยอดเงินจะถูกชำระผ่านช่องทาง บัตรเครดิต/เดบิต กรุณากดปุ่ม "ยืนยัน" เพื่อดำเนินการ  </p>
              </div>  
              <div className='bottonBox'>
                <button className='no' onClick={CloseVerify}><b>ยกเลิก</b></button>
                <button className='yes' onClick={VerifyConfirm}><b>ยืนยัน</b></button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal show={showModal} onHide={handleCloseModal} className="custom-modal">
                <div className="modal-contentnew2 custom-modalnew">
                  <div className="confirmation-message">
                    <div onClick={handleCloseModal}>
                      <img className="cancle3" src="./src/assets/no.png" alt="cancel" />
                    </div>
                    <img className="ready" src="./src/assets/error.png" alt="error" />
                    <span className="text2"><b>&nbsp;เกิดข้อผิดพลาด</b></span>
                    <span className="text-1">
                      <span id="ready2">&nbsp;&nbsp;กรุณาเข้าสู่ระบบ</span>
                    </span>
                    <div>
                      <span id="buttonin">
                        <a href="/login"><span id="button3">เข้าสู่ระบบ</span></a>
                      </span>
                    </div>
                  </div>
                </div>
              </Modal>

      {/* Alert */}
      {showAlert && (
      
        <Alert
          message={`เสร็จสิ้น , คุณได้รับเหรียญ ${selectedAmount} คอยน์`}
          type="success"
          showIcon
          closable
          onClose={CloseAlert}
          className="custom-alert"
        />
      
      )}
    </>
  );
};

export default Popup3;
