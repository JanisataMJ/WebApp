import React from "react";
import { useState, useEffect, useRef } from "react";

import "./Tips.css";
import { Form, Input, Modal, message } from "antd";
import Headers from '../../compronents/Pubblic_components/headerselect';
import CategoryNav from '../../compronents/Home_components/CategoryNav';

const Tips = () => {
  

  return (
    <div><Headers />
      <div className='category-tips'><CategoryNav /></div>
    </div>
  );
};

export default Tips;
