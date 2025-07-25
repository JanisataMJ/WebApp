import React, { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import Off_comment from './off_comment';
import { GetNovelById } from '../../services/https/Novel/novel';
import { CountCommentByNovelID } from '../../services/https/Comment/comment';
import { useLikes } from './LikeContext';
import { Flike, CountLikeByNovelID, CreateLike, DeleteLikeByNIdandUId } from "../../services/https/Likes/like";
import './contentblock.css';
import SLoader from './simpleLoader';

interface NovelData {
  title: string;
  content: string;
  likes: number;
  comments: number;
}

const Cblock: React.FC<{ novelId: string }> = ({ novelId }) => {
  const { likes, setLikes } = useLikes();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes[novelId] || 0);
  const [novelData, setNovelData] = useState<NovelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [minLoading, setMinLoading] = useState<boolean>(true);
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const novelResponse = await GetNovelById(novelId);
        if (novelResponse.status === 200) {
          const novel = novelResponse.data.novel;
          const commentResponse = await CountCommentByNovelID(novelId);
          if (commentResponse.status === 200) {
            const commentCount = commentResponse.data.commentCount || 0;

            setNovelData({
              title: novel.novel_name,
              content: novel.content,
              likes: likes[novelId] || novel.novel_like,
              comments: commentCount,
            });
          } else {
            console.error("Failed to fetch comment count", commentResponse);
          }
        } else {
          console.error("Failed to fetch novel data", novelResponse);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // Wait at least 1 second before setting loading to false
        setTimeout(() => {
          setMinLoading(false);
          setLoading(false);
        }, 1000);
      }
    };

    const fetchLikeCount = async () => {
      try {
        const response = await CountLikeByNovelID(novelId);
        if (response.status === 200) {
          setLikesCount(response.data.likeCount || 0);
        } else {
          console.error("Failed to fetch like count", response);
        }
      } catch (error) {
        console.error("Error fetching like count:", error);
      }
    };

    const fetchLike = async () => {
      if (userId) {
        try {
          const response = await Flike(userId, novelId);
          setIsLiked(response.data.exists);
        } catch (error) {
          console.error("Error fetching like status:", error);
        }
      }
    };

    fetchData();
    fetchLikeCount();
    fetchLike();
  }, [novelId, likes, userId]);

  const handleLikeClick = async () => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    try {
      const response = await Flike(userId, novelId);
      const checkLikestate = response.data.exists;

      if (checkLikestate) {
        await DeleteLikeByNIdandUId(userId, Number(novelId));
      } else {
        await CreateLike({
          user_id: Number(userId),
          novel_id: Number(novelId),
        });
      }

      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      setLikes(novelId, newLikesCount);
      setLikesCount(newLikesCount);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  if (loading || minLoading) {
    return <SLoader />; // Show the loader while loading data
  }

  if (!novelData) {
    return <p>Novel data not found.</p>;
  }

  return (
    <div className='lc'>
      <div className='header-box'>
        <div className='titlebox'>
          <div className='c_title'>{novelData.title}</div>
        </div>
        <div className='con_interactions'>
          <div className='icon-text-bc' onClick={handleLikeClick}>
            <FaHeart className='icon-text-icon_h' style={{ color: isLiked ? 'red' : 'black' }} />
          </div>
          <div className='icon-text-bc'>
            <span>{likesCount}</span>
          </div>
          <div className='icon-text-bc'>
            <Off_comment />
          </div>
          <div className='icon-text-bc'>
            <span>{novelData.comments}</span>
          </div>
        </div>
      </div>
      <div className='textbox'>
        <div
          className='text-style'
          dangerouslySetInnerHTML={{ __html: novelData.content }}
        />
      </div>
    </div>
  );
};

export default Cblock;
