import React, { useState, useEffect } from "react";
import './comment.css';
import CPagination from "./c_pagi";
import CommentModal from "./commentModal";
import { GetAllCommentByNId } from "../../services/https/Comment/comment";

interface CommentProps {
  ID: number;
  description: string;
  user_id: number;
  novel_id: number;
  User: { 
    user_name: string;
    profile?: string; // Optional in case profile is missing
  };
}

const Commentsb: React.FC<{ novelId: string }> = ({ novelId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const maxCommentsPerPage = 4;
  const totalPages = Math.ceil(comments.length / maxCommentsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * maxCommentsPerPage;
  const selectedComments = comments.slice(startIndex, startIndex + maxCommentsPerPage);

  const fetchComments = async () => {
    try {
      const response = await GetAllCommentByNId(novelId);
      const data = response.data;

      // Sort comments by ID in descending order to show latest comments first
      const sortedComments = data.sort((a: CommentProps, b: CommentProps) => b.ID - a.ID);
      setComments(sortedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };
  
  const truncateText = (text: string, limit: number) => {
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  const handleAddComment = (newComment: CommentProps) => {
    setComments(prevComments => [newComment, ...prevComments]); // Prepend the new comment
  };

  useEffect(() => {
    fetchComments();
  }, [novelId]);

  return (
    <>
      <button className="write-comment-button" onClick={() => setIsModalOpen(true)}>
        Write a Comment
      </button>

      {comments.length > 0 ? (
        selectedComments.map((data) => (
          <div className='comment_base' key={data.ID}>
            <div className='header'>
              <div className='profile_a'>
                {data.User.profile ? (
                  <img id='profile_a' src={data.User.profile} alt="User Profile" />
                ) : (
                  <div className='default_profile'></div>
                )}
              </div>
              <div className='des'>
                <div className='username'>
                  <div className='userstyle'>{data.User.user_name}</div>
                </div>
                <div className='comment_text'>
                  {truncateText(data.description, 90)}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No comments yet!</p>
      )}

      <CPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      <CommentModal
        novelId={Number(novelId)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(newComment) => {
          handleAddComment(newComment);
          fetchComments(); // Refresh comments after adding a new one
        }}
      />
    </>
  );
};

export default Commentsb;
