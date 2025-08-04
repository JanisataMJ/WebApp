import React, { useState } from 'react';
import History from '../../compronents/Trasaction_compnents/history_tran';
import './CoinsAndTransaction.css';
import Popup1 from '../../compronents/Trasaction_compnents/pop_PP1';
import Popup2 from '../../compronents/Trasaction_compnents/pop_WL1';
import Popup3 from '../../compronents/Trasaction_compnents/pop_CD1';
import Headers from '../../compronents/Pubblic_components/headerselect';

const Payment: React.FC = () => {
 
    return (
        <>
         <Headers/>
        
        <div className="g2">
     
            <div className="g2_1">
                <a className="backicon" href="/" >
                    <img id='iback' src="./src/assets/back.png" alt="back" />
                </a>
                <h3>&nbsp;&nbsp;เลือกช่องทางการชำระเงิน</h3>
            </div>
            <div className="g2_2">
            <Popup1/>
            <Popup2/>
            <Popup3/>
            </div>
            <hr style={{width:"98%"} } />
            <div className="g2_1">
               
                <h3>&nbsp; <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ประวัติการทำธุรกรรม</h3>
            </div>
            <div className="table">
                
                <History />
                
            </div>
        </div>
        </>
    );
};

export default Payment;