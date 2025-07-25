import React, { useState, useEffect } from 'react';
import './L_Bookshelf.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import Button_s from '../../compronents/Book_components/return_button';
import Booky from '../../compronents/Book_components/BookText';
import NCardList2 from '../../compronents/Book_components/Bookpath2';
import Tooltip from '../../compronents/Book_components/mario';
import Carder from '../../compronents/Book_components/animatedbutton';
import NovelCounter from '../../compronents/Book_components/NovelCounter';
import { CountUniqueNovelsByBookshelfID } from '../../services/https/Bookshelf/bookshelf';
import SLoader from '../../compronents/Book_components/simpleLoader';

const L_Bookshelf: React.FC = () => {
  const [novelCounts, setNovelCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchNumberofNovel = async () => {
      try {
        const response = await CountUniqueNovelsByBookshelfID(userId);
        if (response.status === 200) {
          setNovelCount(response.data.unique_novel_count || 0);
        } else {
          console.error("Failed to fetch comment count", response);
        }
      } catch (error) {
        console.error("Error fetching comment count:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    // Show loader for 1.5 seconds
    const timer = setTimeout(() => {
      fetchNumberofNovel();
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [userId]);

  if (loading) {
    return <SLoader />; // Show loader while loading
  }

  return (
    <>
      <Headers/>
      <div className="head-box">
        <a href="/">
          <Button_s />
        </a>
        <div className="head"></div>
        <Booky/>
      </div>
      <div className="lb_base">
        <div className="lb_half_left">
          <NCardList2/>
        </div>
        <div className="lb_half_right">
          {/* <Carder/> */}
          <NovelCounter count={novelCounts} />
          <Tooltip/>
        </div>
      </div>
    </>
  );
};

export default L_Bookshelf;
