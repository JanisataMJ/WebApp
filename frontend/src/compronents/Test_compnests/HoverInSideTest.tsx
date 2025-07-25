import React, { useRef } from 'react';
import './MyComponent.css'; // รวม CSS ที่จะใช้
function MyComponent2() {
   
    
    const smallButtonRef = useRef<HTMLButtonElement | null>(null);

    const handleLargeButtonClick = () => {
      // ดำเนินการเมื่อปุ่มใหญ่ถูกคลิก
      alert('ปุ่มใหญ่ถูกคลิก');
    };
  
    const handleSmallButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // ตรวจสอบว่าปุ่มเล็กถูกคลิกอยู่บนปุ่มใหญ่หรือไม่
      if (smallButtonRef.current) {
        const { top, left, width, height } = smallButtonRef.current.getBoundingClientRect();
        const { clientX, clientY } = e;
  
        if (clientX >= left && clientX <= left + width && clientY >= top && clientY <= top + height) {
          e.stopPropagation(); // หยุดการแพร่กระจายของเหตุการณ์คลิก
          alert('ปุ่มเล็กถูกคลิก');
        }
      }
    };
  
 
      return (
        <div className="container">
      <button className="large-button" onClick={handleLargeButtonClick}>
        ปุ่มใหญ่
      </button>
      <button
        className="small-button"
        onClick={handleSmallButtonClick}
        ref={smallButtonRef}
      >
        ปุ่มเล็ก
      </button>
    </div>
    
      );
    }
    
    

export default MyComponent2;
