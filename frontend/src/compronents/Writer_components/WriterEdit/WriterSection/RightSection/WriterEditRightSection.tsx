import React from 'react';
import './WriterEditRightSection.css';

const WriterEditRightSection: React.FC = () => {
  return (
    <>
      <div className="input-container">
        <div className="input-wrapper-name">
          <input
            type="text"
            placeholder="ชื่อนิยาย"
            name="nameNovel"
            className="inputNovelType1"
          />
        </div>

        <div className="input-wrapper-writerName">
          <input
            type="text"
            placeholder="นามปากกา"
            name="writerName"
            className="inputNovelType1"
          />
        </div>
      </div>

      <div className="input-wrapper-descriptionNovel">
        <textarea
          placeholder="คำอธิบาย"
          maxLength={150}
          name="descriptionNovel"
          className="input-descriptionNovelType1"
        />
      </div>

      <div className="typeAndPriceCover">
        <div className="input-wrapper-dropdownNovelType">
          <select className="dropdownNovelType">
            <option value="" disabled selected>ประเภทที่ 1</option>
            <option value="Romance">Romance</option>
            <option value="Comedy">Comedy</option>
            <option value="Action">Action</option>
            <option value="Horror">Horror</option>
            <option value="Fantasy">Fantasy</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div className="input-wrapper-dropdownNovelType">
          <select className="dropdownNovelType">
            <option value="" disabled selected>ประเภทที่ 2</option>
            <option value="Romance">Romance</option>
            <option value="Comedy">Comedy</option>
            <option value="Action">Action</option>
            <option value="Horror">Horror</option>
            <option value="Fantasy">Fantasy</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div className="input-wrapper-dropdownNovelType">
          <select className="dropdownNovelType">
            <option value="" disabled selected>เรทนิยาย</option>
            <option value="13+">13+</option>
            <option value="15+">15+</option>
            <option value="18+">18+</option>
            <option value="20+">20+</option>
          </select>
        </div>

        <div className="input-wrapper-Price">
          <input
            type="text"
            placeholder="ราคานิยาย"
            name="priceNovel"
            className="inputPrice"
          />
        </div>
      </div>
    </>
  );
};

export default WriterEditRightSection;
