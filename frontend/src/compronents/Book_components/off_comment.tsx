import React,{ useState } from 'react';
import { useParams } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import Commentsb from './comment';
import './comment.css'

import { FaComment } from 'react-icons/fa';


function Off_comment() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { novelId } = useParams();
  return (
    <>
      <FaComment className='icon-text-icon_fc' onClick={handleShow}>
        {/* Comment */}
      </FaComment>

      <Offcanvas show={show} onHide={handleClose}  >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>กล่องคอมเมนต์!</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Commentsb novelId={novelId as string}/>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}


export default Off_comment;