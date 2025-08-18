//   import React, { useEffect, useState } from 'react';
//   import './detailNovelOfWriter.css';
//   import { HeartOutlined, CommentOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
//   import { HiMiniShoppingCart } from "react-icons/hi2";
//   import { InterfaceNovelOfWriter } from '../../../../interface/writer_interface/writerPageInterface';

//   import Loader from '../../Loading/Loading';
//   // นำเข้ารูปภาพสำรอง
//   import NOCOVERCONTENT from '../../../../assets/Nocover.png';

//   const DetailNovelOfWriter: React.FC = () => {
//     const [detailNovels, setDetailNovels] = useState<InterfaceNovelOfWriter[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [novelToDelete, setNovelToDelete] = useState<string | null>(null); // เก็บสถานะของนิยายที่ต้องการลบ
//     const [isDeleteSuccess, setIsDeleteSuccess] = useState(false); // สถานะสำหรับ popup การลบสำเร็จ
//     const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});

//     useEffect(() => {
//       const userId = localStorage.getItem("id");
//       if (userId) {
//         fetchNovels(userId);
//       } else {
//         setLoading(false);
//       }
//     }, []);

//     const fetchNovels = async (id: string) => {
//       try {
//         const response = await GetNovelByUser(id);
//         if (response && response.data && Array.isArray(response.data.novel)) {
//           const novels = await Promise.all(response.data.novel.map(async (novel: any) => {
//             const likeCountResponse = await CountLikeByNovelID(String(novel.ID) || String(novel.id)); 
//             const likeCount = likeCountResponse.data.likeCount || 0;

//             const commentCountResponse = await CountCommentByNovelID(String(novel.ID));
//             const commentCount = commentCountResponse.data.commentCount || 0;

//             setCommentCounts(prevCounts => ({
//               ...prevCounts,
//               [novel.ID]: commentCount,
//             }));

//             return {
//               ID: novel.ID || novel.id,
//               novel_name: novel.novel_name || 'Unknown',
//               Cover: novel.cover || NOCOVERCONTENT,
//               Description: novel.description || 'No description available',
//               WriterName: novel.writername || 'Unknown',
//               BuyAmount: novel.buy_amount || 0,
//               Like: likeCount || 0,
//               Rate: novel.rate || 'Not rated',
//               Visibility:novel.novel_visibility,
//               Type: (novel.novel_type1 || novel.novel_type2) ? `${novel.novel_type1}, ${novel.novel_type2}` : 'ไม่ระบุประเภท'
//             };
//           }));
//           setDetailNovels(novels);
//         } else {
//           setDetailNovels([]);
//         }
//       } catch (error) {
//         console.error("Error fetching novels:", error);
//         setDetailNovels([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const handleDeleteSuccess = (deletedNovelId: string) => {
//       setDetailNovels((prevNovels) => prevNovels.filter(novel => novel.ID !== Number(deletedNovelId)));
//       setNovelToDelete(null); // ล้างสถานะหลังจากลบเสร็จ
//       setIsDeleteSuccess(true); // แสดง popup การลบสำเร็จ

//       // ตั้งเวลาให้ popup การลบสำเร็จหายไป
//       setTimeout(() => {
//         setIsDeleteSuccess(false);
//       }, 1000);
//     };

//     const handleConfirmDelete = async () => {
//       if (novelToDelete) {
//         try {
//           const response = await DeleteNovelById(novelToDelete);
//           if (response.status === 200) {
//             handleDeleteSuccess(novelToDelete);
//           } else {
//             console.error("Error deleting novel:", response);
//           }
//         } catch (error) {
//           console.error("Error deleting novel:", error);
//         }
//       }
//     };

//     if (loading) {
//       return <Loader />;;
//     }

//     return (
//       <div className="MyNovel">
//         {detailNovels.length > 0 ? (
//           detailNovels.map((detailNovel) => (
//             <div key={detailNovel.ID} className="MyNovel-item">
//               <div className="MyNovel-image-container">
//   <img
//     src={detailNovel.Cover}
//     alt={detailNovel.novel_name}
//     className="MyNovel-image"
//   />
//   <div className="MyNovel-visibility-status">
//   {detailNovel.Visibility ? 'เผยแพร่' : 'ส่วนตัว'}
// </div>

//   <a href={`/Writer_edit?novelId=${detailNovel.ID}`}>
//     <button className="MyNovel-edit-button"><EditOutlined /></button>
//   </a>
// </div>



//               <div className="MyNovel-details">
//                 <h3 className="MyNovel-title">{detailNovel.novel_name}</h3>
//                 <p className="MyNovel-author"><UserOutlined /> ผู้แต่ง: {detailNovel.WriterName}</p>
//                 <div className="MyNovel-stats">
//                   <span><HiMiniShoppingCart /> {detailNovel.BuyAmount.toLocaleString()}</span>
//                   <span><HeartOutlined /> {detailNovel.Like}</span>
//                   <span><CommentOutlined /> {commentCounts[detailNovel.ID] || 0} ความคิดเห็น</span>
//                 </div>

//                 <div className="MyNovel-tags">
//                   {detailNovel.Type ? detailNovel.Type.split(', ').map((type, index) => (
//                     <span key={index}><label className='MyNovel-type'>{type}</label></span>
//                   )) : <span><label className='MyNovel-type'>ไม่ระบุประเภท</label></span>}
//                   <span><label className='MyNovel-rate'>{detailNovel.Rate}</label></span>
//                   <span><label className='MyNovel-hashtag'>#{detailNovel.novel_name}</label></span>
//                   <span><label className='MyNovel-hashtag'>#{detailNovel.WriterName}</label></span>
//                 </div>
//                 <p className="MyNovel-description" dangerouslySetInnerHTML={{ __html: detailNovel.Description || '' }} />
//               </div>

//               {/* ปุ่มลบ */}
//               <button className="delete-Novel-button" onClick={() => setNovelToDelete(String(detailNovel.ID))}>
//                 <DeleteOutlined className="delete-icon" />
//               </button>
//             </div>
//           ))
//         ) : (
//           <div>No novels available</div>
//         )}

//         {/* Popup ยืนยันการลบ */}
//         {novelToDelete && (
//           <div className="popup-overlay">
//             <div className="popup-content">
//               <h2>ยืนยันการลบ</h2>
//               <p>คุณแน่ใจหรือว่าต้องการลบนิยายนี้?</p>
//               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//                 <button onClick={() => setNovelToDelete(null)} className="popup-cancel-button">
//                   ยกเลิก
//                 </button>
//                 <button onClick={handleConfirmDelete} className="popup-confirm-button">
//                   ยืนยัน
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Popup การลบสำเร็จ */}
//         {isDeleteSuccess && (
//           <div className="success-popup-overlay">
//             <div className="success-popup-content">
//               <h2>สำเร็จ</h2>
//               <p>ข้อมูลถูกลบเรียบร้อยแล้ว</p>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   export default DetailNovelOfWriter;
