import React, { useState, useRef } from 'react';
import './Writer_edit.css'; 
import Headers from '../../compronents/Pubblic_components/headerselect';
import CategoryNavWriter from '../../compronents/Writer_components/CatogoryNavWriter';
import WriterEditNovel from '../../compronents/Writer_components/WriterEdit/EditNovel/writerEditNovel';



const Writer_edit: React.FC = () => {
  return (
    <>
      <Headers />
      <CategoryNavWriter />
      <div className='background_of_writerEdit'>
      <WriterEditNovel />
      </div>
    </>
  );

};

export default Writer_edit;