import React, { useState } from 'react';
import './header.css';
import { Modal, Button } from 'react-bootstrap';
import { IoPersonCircleOutline } from "react-icons/io5";

interface NoLoginProps {
  sendData: (amount: number, price: number, key: any) => void;
  amount: number;
  price: number;
  keyProp: any;
}

const NoLogin: React.FC<NoLoginProps> = ({ sendData, amount, price, keyProp }) => {
  const [showModal, setShowModal] = useState(false); // Initially hidden
  const [Packgage, setPackgage] = useState<boolean>(false);
  const handleWriterClick = () => {
    setShowModal(true);
    setPackgage(false);
    

  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button className="thbp" onClick={handleWriterClick}>
        <b>{price.toFixed(2)}</b>
      </button>

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
    </>
  );
};

export default NoLogin;
