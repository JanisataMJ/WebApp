<Modal show={showConfirmation} onHide={handleCloseConfirmation}>
          <div className='modal-contentnew2 custom-modalnew'>
            <div className='confirmation-message'>
            <div onClick={handleCloseConfirmation}>
                <img className="cancle3" src="./src/assets/no.png" alt="cancel" />
              </div>
              <img className="ready" src="./src/assets/error.png" alt="submit" />
              <span className='text2'><b>เกิดข้อผิดพลาด</b></span>
              <span className="text-1">
                          <span id='nocoin'>จำนวนเหรียญไม่เพียงพอ<br></br>กรุณาเติมเหรียญ</span>
                        </span>
              <span id='buttoncoin' /*href="Payment" กดไปหน้าเติมเหรียญ*/>
                  <span id='button3'>เติมเหรียญ</span>
                  </span>
            </div>
          </div>
        </Modal>