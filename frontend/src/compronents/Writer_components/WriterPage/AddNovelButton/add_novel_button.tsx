import React from 'react';
import './add_novel_button.css' ;
import { PlusCircleOutlined } from '@ant-design/icons';

const Add_novel_button: React.FC = () => {
    return(
        <>
        <a href = '/Writer_edit'>
        <button className="addNovelbutton">
          <PlusCircleOutlined  /> เพิ่มงานเขียน
        </button>
        </a>
        </>
    );

};
export default Add_novel_button