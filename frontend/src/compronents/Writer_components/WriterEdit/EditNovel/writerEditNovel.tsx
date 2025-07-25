import React, { useState, useEffect } from 'react';        
import { GetNovelById, CreateNovel, UpdateNovelById } from '../../../../services/https/Novel/novel'; 
import WriterEditComponent from '../WriterSection/WrtiterEditComponent';
import NovelEditor from '../NovelEditor/NovelEditor';
import SaveButton from '../SaveButton/saveButtonNovel';

const WriterEditNovel: React.FC = () => {
  const [novelData, setNovelData] = useState<any>({});
  const [novelContent, setNovelContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null); // เพิ่ม 'success'
  const [writerID, setWriterID] = useState<number | null>(null);
  const [isNewNovel, setIsNewNovel] = useState(true); 
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (userId) {
      const parsedUserId = parseInt(userId, 10);
      if (!isNaN(parsedUserId)) {
        setWriterID(parsedUserId);
      } else {
        console.error('Invalid writer ID in local storage');
        setSaveMessage({ type: 'error', text: 'Invalid writer ID.' });
      }
    } else {
      console.error('No writer ID found in local storage');
      setSaveMessage({ type: 'error', text: 'Writer ID not found.' });
    }

    const queryParams = new URLSearchParams(window.location.search);
    const novelId = queryParams.get('novelId');
    
    if (novelId) {
      console.log('Novel ID:', novelId);
      setIsNewNovel(false);
      fetchNovelById(novelId);
    } else {
      console.log('No Novel ID, creating a new novel');
      setIsNewNovel(true);
    }
  }, []);

  const fetchNovelById = async (novelId: string) => {
    try {
      const response = await GetNovelById(novelId);
      if (response && response.data) {
        console.log('Fetched Novel Data:', response.data.novel); 
        setNovelData(response.data.novel);
        setNovelContent(response.data.novel.content || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching novel:', error.message);
        setSaveMessage({ type: 'error', text: `Error fetching novel data: ${error.message}` });
      } else {
        console.error('Unexpected error:', error);
        setSaveMessage({ type: 'error', text: 'Unexpected error occurred while fetching novel data.' });
      }
    }
  };
  
  const handleSave = async () => {
    // ตรวจสอบว่าประเภทนิยายซ้ำกันหรือไม่
    if (novelData.novel_type1 === novelData.novel_type2) {
      setSaveMessage({
        type: 'error',
        text: 'ประเภทที่ 1 และประเภทที่ 2 ต้องไม่ซ้ำกัน',
      });
      setIsPopupVisible(true); // แสดง popup กรณีที่ประเภทซ้ำกัน
      return;
    }
  
    if (writerID === null || writerID === 0) {
      setSaveMessage({ type: 'error', text: 'Writer ID is not valid.' });
      setIsPopupVisible(true); // แสดง popup กรณี Writer ID ไม่ถูกต้อง
      return;
    }
  
    setIsSaving(true);
    setSaveMessage(null);
  
    const dataToSend = {
      novel_name: novelData.novel_name,
      content: novelContent,
      description: novelData.description,
      novel_type1: novelData.novel_type1,
      novel_type2: novelData.novel_type2,
      rate: novelData.rate,
      novel_visibility: novelData.novel_visibility, 
      writername: novelData.writername,
      cover: novelData.cover,
      novel_price: parseFloat(novelData.novel_price) || 0,
      writer_id: writerID,
    };
    
    console.log("Data to send:", dataToSend);
  
    try {
      let response;
      if (isNewNovel) {
        console.log("Creating new novel...");
        response = await CreateNovel(dataToSend);
      } else {
        console.log("Updating novel with ID:", novelData.ID);
        response = await UpdateNovelById(novelData.ID, dataToSend);
      }
    
      if (response && response.status >= 200 && response.status < 300) {
        // ตรวจสอบว่าคำขอสำเร็จ (status code 2xx)
        setSaveMessage({ type: 'success', text: 'นิยายถูกบันทึกเรียบร้อยแล้ว!' });
        setIsPopupVisible(true); // แสดง popup เมื่อบันทึกสำเร็จ
      } else {
        throw new Error('ไม่สามารถบันทึกนิยายได้ โปรดลองอีกครั้ง');
      }
    } catch (error: any) {
      // ตรวจสอบว่ามี error response และเป็น status 500 หรือไม่
      if (error.response && error.response.status === 500) {
        setSaveMessage({ type: 'error', text: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (500) โปรดลองอีกครั้ง' });
      } else if (error instanceof Error) {
        setSaveMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error.message}` });
      } else {
        setSaveMessage({ type: 'error', text: 'เกิดข้อผิดพลาดที่ไม่ทราบแหล่งที่มา' });
      }
      setIsPopupVisible(true); // แสดง popup กรณีเกิดข้อผิดพลาด
    } finally {
      setIsSaving(false);
    }
    
  };
  

  return (
    <div className="writer-edit-novel">
      <WriterEditComponent setNovelData={setNovelData} novelData={novelData} />
      <NovelEditor setNovelContent={setNovelContent} initialContent={novelContent} />
      <SaveButton onSave={handleSave} isDisabled={isSaving} />
      
      {/* แสดง popup ตามสถานะการบันทึก */}
      {isPopupVisible && (
        <div className="popup-savenovel">
          <div className="popup-content-save">
            <p>{saveMessage?.text}</p>
            <button onClick={() => setIsPopupVisible(false)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriterEditNovel;
