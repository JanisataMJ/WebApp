import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Alert } from 'antd';

import './pop.css';
import './pop_WL1.css';
import CountdownButton from './GETOTP';
import { Package } from '../../interface/transaction_interface/IPackgae';
import { GetPackages } from '../../services/https/Package/package';
import CoinCard from './coinCard'
import { CreateTransaction } from '../../services/https/Transaction/transaction';
import { updateCoinBalance } from '../../services/https/Coin/coin';
import { useBalanceContext } from '../Home_components/BalanceContext';
import { useHistoryContext } from './HistoryContext';
import { useAuth } from '../Pubblic_components/AuthContextType';
const Popup2: React.FC = () => {

  const [Packgage, setPackgage] = useState<boolean>(false);
  const showPackgage =() => setPackgage(true);
  const closePackgage =() => setPackgage(false);
  const { isLoggedIn } = useAuth();
  const [TrueWallet, setTrueWallet] = useState<boolean>(false);
  const closeTrueWallet=() => setTrueWallet(false);

  const [Verify, setVerify] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [selectedPrice, setSelectedPrice] = useState<number >(0);
  const [selectedAmount, setSelectedAmount] = useState<number >(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [Balance,setBalance] = useState<number>(0);
  const [Key, setKey] = useState(0);
  const userIdstr = localStorage.getItem("id");
  const userId = Number(userIdstr || 0);
  const { triggerRefresh } = useBalanceContext(); 
  const { triggerHistoryRefresh } = useHistoryContext();

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false)

  const ConfirmPackage = (amount: number, price: number,key: number) => {
         setSelectedAmount(amount);
         setKey(key);
         setSelectedPrice(price);
         setPackgage(false);
         
    {isLoggedIn ? setTrueWallet(true):setShowModal(true)} 
  };

  const handleFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    setIsFormValid(form.checkValidity());
  };

  const handleConfirm = () => {
    setTrueWallet(false);
    setTimeout(() => setVerify(true), 300); // Show Popup Verify after confirming True Wallet
  };
  
  const VerifyConfirm = () => {
    const a = selectedAmount;
    CreateTransaction({
      trans_type: "เติมเหรียญ",
      payment: "ทรูวอเล็ต",
      user_id: userId,
      package_id: Key,
      amount_t: a,
    }); 
    setTimeout(() => {
      triggerRefresh();
      triggerHistoryRefresh();
    }, 1400);

    updateCoinBalance(a,setBalance);
    setVerify(false);
    setTimeout(() => setShowAlert(true), 1500); // Show Alert after verifying
  };
  
  const closeVerify = () => setVerify(false);
  const closeAlert = () => setShowAlert(false);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        closeAlert();
      }, 4000); 

      return () => clearTimeout(timer); // Clear the timeout if the component unmounts or showAlert changes
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

  return (
    <>
      <div className="cardPayment" onClick={showPackgage}>
        <div className="box2">
          <div className="box1"></div>
          <img id="imgC" src="./src/assets/true-wallet.png" alt="truemoney-wallet" />
          <div className="box1">
            <span><b>ทรูวอเล็ต</b></span>
          </div>
        </div>
      </div>

      {/* Popup 2 */}
      <Modal show={Packgage} onHide={closePackgage}>
        <div className='aap'>
          <div className='prop'>คุ้มสุด!</div>
          <div className="g2p">
            <div className="g2_1p">
              <h3>แพ็กเกจ</h3>
              <div className="cancelIconp" onClick={closePackgage}>
                <img src="./src/assets/cancel-svgrepo-com.svg" alt="Cancel" />
              </div>
            </div>
            <div className="g2_2p">
                              {/* Mapping through the packages array */}
          {packages.filter(data => [7,8,9,10,11,12].includes(data.ID)).map((data) => (
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

      {/* Popup TrueWallet */}
      <Modal show={TrueWallet} onHide={closeTrueWallet}>
        <div className="g2t">
          <div className="g2_1w">
            <h3>ดำเนินการชำระเงิน</h3>
            <div className="cancelIcon" onClick={closeTrueWallet}>
              <img src="./src/assets/cancel-svgrepo-com.svg" alt="Cancel" />
            </div>
          </div>
          <div className="g23">
            <div className="CardTureWL">
              <CountdownButton />
              <form className='fromWL' action="/" method="POST" onChange={handleFormChange}>
                <div className="cre1">
                  <label htmlFor="tel">หมายเลขโทรศัพท์</label><br/>
                  <input type="text" id="tel" name="tel" pattern="\d{10}" placeholder="" maxLength={10} required /><br /><br />
                </div>
                <img id='imgWL' src="./src/assets/truemoney-wallet.avif" alt="truemoney-wallet" />
                <div className="cre2">
                  <label htmlFor="OTP">OTP</label><br/>
                  <input type="text" id="OTP" name="OTP" placeholder="______" maxLength={6} required /><br /><br />
                </div>
                <br/>
                <div className="cre5">
                  <div className="cre5_2">
                    <img id='imgSecureP' src="./src/assets/SecurePayment.png" alt="SecurePayment" /> &nbsp;SECURE PAYMENT
                  </div>
                </div>
              </form>
              <div className="cre5_3">
                <button 
                  className='submitbWL2' 
                  onClick={handleConfirm} 
                  style={isFormValid ? {} : { cursor: 'not-allowed' }} 
                  disabled={!isFormValid}
                >
                  <b>ยืนยัน</b>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>


      {/* Popup Verify */}
      <Modal show={Verify} onHide={closeVerify}>
        <div className='aap'>
          <div className="g2q">
            <div className="g2_1p">
                <h3>ยืนยันการชำระเงิน</h3>
              <div className="cancelIconpForVerify" onClick={closeVerify}>
              <img src="./src/assets/cancel-svgrepo-com.svg" alt="Cancel" />
              </div>
            </div>
            <div className="g2_2p">
              <div className='basePp'>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คุณกำลังซื้อ {selectedAmount} คอยน์ ในราคา {selectedPrice} บาท ยอดเงินจะถูกชำระผ่านช่องทาง &nbsp;&nbsp;&nbsp;&nbsp;ทรูวอเล็ต กรุณากดปุ่ม "ยืนยัน" เพื่อดำเนินการ  </p>
            </div>  
            <div className='bottonBox'>
              <button className='no' onClick={closeVerify}>ยกเลิก</button>
              <button className='yes' onClick={VerifyConfirm}>ยืนยัน</button>
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
          onClose={closeAlert}
          className="custom-alert" // Apply the custom class
        />
      )}

      
    </>
  );
};

export default Popup2;
