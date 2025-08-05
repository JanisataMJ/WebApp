import React from "react";
import { useState, useEffect, useRef } from "react";

import "./Tips.css";
import { Form, Input, Modal, message } from "antd";
import Headers from '../../compronents/Pubblic_components/headerselect';
import CategoryNav from '../../compronents/Home_components/Navbar';
import Notification from '../../compronents/Home_components/Notifiation/notice';

const Tips = () => {
  

  return (
    <div><Headers />
      <div className='category-tips'><CategoryNav /></div>
      <div className="tips-dashboard"></div>
      <Notification />
    </div>
  );
};

export default Tips;