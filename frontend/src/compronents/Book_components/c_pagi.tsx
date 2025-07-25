import React from 'react';
import './c_pagi.css';
import { CPaginationProps } from '../../interface/bookey_interface/bookshelfs';



const CPagination: React.FC<CPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const maxPageButtons = 5; // Maximum number of pagination buttons to show
  const pages: number[] = [];

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = startPage + maxPageButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="cpagination-container">
      <div className="cpagination">
        
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={page === currentPage ? 'active' : ''}
          >
            {page}
          </button>
        ))}

        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
        
      </div>
    </div>
  );
};

export default CPagination;