import React, { useState } from 'react';
import './header.css';
import { Dropdown, Image, Modal, Button } from 'react-bootstrap';
import { IoPersonCircleOutline } from "react-icons/io5";

const TOP2: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    // Show modal for login access to "งานเขียน"
    const handleWriterClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="topbar">
            <a href='/'><img id="Logo" src="/src/assets/Logo.png" alt="Logo" /></a>

            <div className="login">
                <Button id='login' href="/login">เข้าสู่ระบบ</Button>
            </div>

            <div id='profile'>
                <Dropdown align="end">
                    <Dropdown.Toggle variant="light" id="dropdown-profile" as="div">
                        <IoPersonCircleOutline id='white' />
                    </Dropdown.Toggle>

                    <Dropdown.Menu id='locks'>
                        <Dropdown.Item id='locks' onClick={handleWriterClick}>โปรไฟล์ของฉัน</Dropdown.Item>
                        <Dropdown.Item id='locks' onClick={handleWriterClick}>งานเขียน</Dropdown.Item>
                        <Dropdown.Item onClick={handleWriterClick}>ชั้นหนังสือ</Dropdown.Item>
                        <Dropdown.Item id='locks' href="/Payment">เหรียญ & ประวัติธุรกรรม</Dropdown.Item>
                        <Dropdown.Item id='locks' href="/settings">ตั้งค่า</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            {/* Modal for login */}
            <Modal show={showModal} onHide={handleCloseModal} className="custom-modal">
                <div className='modal-contentnew2 custom-modalnew'>
                    <div className='confirmation-message'>
                        <div onClick={handleCloseModal}>
                            <img className="cancle3" src="./src/assets/no.png" alt="cancel" />
                        </div>
                        <img className="ready" src="./src/assets/error.png" alt="submit" />
                        <span className='text2'><b>&nbsp;เกิดข้อผิดพลาด</b></span>
                        <span className="text-1">
                            <span id='ready2'>&nbsp;&nbsp;กรุณาเข้าสู่ระบบ</span>
                        </span>
                        <div>
                            <span id='buttonin'>
                                <a href="/login"><span id='button3'>เข้าสู่ระบบ</span></a>
                            </span>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TOP2;
