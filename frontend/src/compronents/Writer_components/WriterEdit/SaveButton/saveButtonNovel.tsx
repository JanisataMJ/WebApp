import React from 'react';
import './saveButtonNovel.css';

const SaveButton: React.FC<{ onSave: () => void; isDisabled: boolean }> = ({ onSave, isDisabled }) => {
  return (
    <div className='container-saveButton-Novel'> 
    <button className="submit-button" onClick={onSave} disabled={isDisabled}>
      {isDisabled ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
    </button>
    </div>
  );
};

export default SaveButton;
