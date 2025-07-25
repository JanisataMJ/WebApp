import React, { useState, useEffect } from "react";
import styled from "styled-components";
import './Novelbasev2.css';
import { FaHeart, FaComment } from "react-icons/fa";
import { NCardPropsv } from "../../interface/bookey_interface/bookshelfs";
import { CountCommentByNovelID } from "../../services/https/Comment/comment";
import { useNavigate } from "react-router-dom";
import { useLikes } from "./LikeContext";
import { Flike, CountLikeByNovelID, CreateLike, DeleteLikeByNIdandUId } from "../../services/https/Likes/like";

interface NCardv2Props {
  ncardv: NCardPropsv;
}

const NCardv2: React.FC<NCardv2Props> = ({ ncardv }) => {
  const { likes, setLikes } = useLikes();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes[ncardv.id] || ncardv.likes);
  const [commentCount, setCommentCount] = useState<number>(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await CountCommentByNovelID(ncardv.id.toString());
        if (response.status === 200) {
          setCommentCount(response.data.commentCount || 0);
        } else {
          console.error("Failed to fetch comment count", response);
        }
      } catch (error) {
        console.error("Error fetching comment count:", error);
      }
    };
    const fetchLikecount = async () => {
      try {
        const response = await CountLikeByNovelID(ncardv.id.toString());
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
          const response = await Flike(userId, ncardv.id.toString());
          setIsLiked(response.data.exists);
        } catch (error) {
          console.error("Error fetching like status:", error);
        }
      }
    };

    fetchCommentCount();
    fetchLikecount();
    fetchLike();
  }, [ncardv.id, userId]);

  const handleLikeClick = async () => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }
  
    try {
      // Check if the like exists
      const response = await Flike(userId, ncardv.id.toString());
      const checkLikestate = response.data.exists;
  
      if (checkLikestate) {
        // If the like exists, delete it
        await DeleteLikeByNIdandUId(userId, ncardv.id);
      } else {
        // If the like does not exist, create it
        await CreateLike({
          user_id: Number(userId),
          novel_id: ncardv.id,
        });
      }
  
      // Update the like count and toggle the like status
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      setLikes(ncardv.id.toString(), newLikesCount); // Update likes in the context
      setLikesCount(newLikesCount); // Update local likes count state
      setIsLiked(!isLiked); // Toggle the like status
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };
  

  const handleReadClick = () => {
    navigate(`/L_content/${ncardv.id}`);
  };

  return (
    <StyledWrapper>
      <div className="book">
        <div className="contentv">
          <h3 className="titlev">{ncardv.name}</h3>
          <p className="descriptionv">
            {ncardv.description.length > 120 ? `${ncardv.description.slice(0, 120)}...` : ncardv.description}
          </p>
          <button className="read-buttonv" onClick={handleReadClick}>
            อ่าน
          </button>
          <div className="interactionsv">
            <div className="icon-textv" onClick={handleLikeClick}>
              <FaHeart
                className="icon-text-hv"
                style={{ color: isLiked ? 'red' : 'black' }}
              />
              <span>{likesCount}</span>
            </div>
            <div className="icon-textv">
              <FaComment className="icon-text-bv" />
              <span>{commentCount}</span>
            </div>
          </div>
          <div className="tagsv">
          {ncardv.writer_name && <button className="tagv">{ncardv.writer_name}</button>}
          {ncardv.rate && <button className="tagv">{ncardv.rate}</button>}
          {ncardv.type_1 && <button className="tagv">{ncardv.type_1}</button>}
          {ncardv.type_2 && <button className="tagv">{ncardv.type_2}</button>}
          </div>
        </div>
        <div className="cover">
          <div className="image-placeholderv">
            <img id="image-placeholderv" src={ncardv.cover} alt={ncardv.name} />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .book {
    position: relative;
    border-radius: 10px;
    width: 220px;
    height: 300px;
    background-color: whitesmoke;
    box-shadow: 1px 1px 12px #000;
    transform: preserve-3d;
    perspective: 2000px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
  }

  .cover {
    top: 0;
    position: absolute;
    background-color: lightgray;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.5s;
    transform-origin: 0;
    box-shadow: 1px 1px 12px #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book:hover .cover {
    transition: all 0.5s;
    transform: rotateY(-90deg);
  }

  p {
    font-size: 10px;
    font-weight: bolder;
  }
`;

export default NCardv2;
