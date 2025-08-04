import React, { useState } from "react";
import './commentModal.css';
import { CreateComment } from "../../services/https/Comment/comment";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  novelId: number;
  onSubmit: (comment: {
    ID: number;
    description: string;
    user_id: number;
    novel_id: number;
    User: {
      user_name: string;
      profile?: string;
    };
  }) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, novelId, onSubmit }) => {
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState(""); // To store error message
  const userId = Number(localStorage.getItem("id"));
  const userName = localStorage.getItem("username") || "";

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      setError("Comment cannot be blank."); // Set error message if blank
      return;
    }

    if (!userId || !novelId) {
      console.error("Missing user or novel ID");
      return;
    }

    const newComment = {
      ID: Date.now(), // Temporary ID (or backend can provide)
      description: commentText,
      user_id: userId,
      novel_id: novelId,
      User: {
        user_name: userName,
        profile: "", // You can add profile information if needed
      },
    };

    try {
      await CreateComment({
        description: commentText,
        user_id: userId,
        user_name: userName,
        novel_id: novelId,
      });

      onSubmit(newComment); // Notify parent component
      setCommentText(""); // Reset comment field
      onClose(); // Close modal
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-comment ${isOpen ? 'open' : ''}`}>
      <div className="modal-content-comment">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>แสดงความคิดเห็น</h2>
        <textarea
          placeholder="Your Comment"
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            setError(""); // Clear error when user types
          }}
          style={{
            width: '100%',  // Full width of the modal content
            minHeight: '100px',  // Minimum height for better UX
            maxHeight: '200px',  // Maximum height to prevent the box from expanding indefinitely
            resize: 'vertical',  // Allow the user to resize the textarea vertically only
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
        {error && <p className="error">{error}</p>} {/* Display error message */}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1em' }}>
          <button
            onClick={handleSubmit}
            style={{
              fontSize: '17px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '0.75em',
              background: '#000000',
              padding: '0.75em 1.5em',
              outline: 'none',
              position: 'relative',
              color: '#000000',
              display: 'block',
              boxSizing: 'border-box',
              transition: 'transform 0.1s ease',
              border: '2px solid #000000',
              backgroundColor: '#e8e8e8',
              transform: 'translateY(-0.2em)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-0.33em)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(-0.2em)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-0.2em)';
            }}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
