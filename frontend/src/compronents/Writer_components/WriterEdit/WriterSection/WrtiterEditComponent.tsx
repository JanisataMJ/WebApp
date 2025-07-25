import React, { useEffect, useState } from 'react';
import './WriterEditComponent.css';

interface WriterEditComponentProps {
  setNovelData: (data: any) => void;
  novelData: any;
}

const WriterEditComponent: React.FC<WriterEditComponentProps> = ({ setNovelData, novelData }) => {
  const [novelName, setNovelName] = useState(novelData.novel_name || '');
  const [writerName, setWriterName] = useState(novelData.writername || '');
  const [novelVisibility, setNovelVisibility] = useState<boolean>(novelData.novel_visibility || false);
  const [coverImage, setCoverImage] = useState(novelData.cover || '');
  const [description, setDescription] = useState(novelData.description || '');
  const [novelType1, setNovelType1] = useState(novelData.novel_type1 || '');
  const [novelType2, setNovelType2] = useState(novelData.novel_type2 || '');
  const [novelRate, setNovelRate] = useState(novelData.rate || '');
  const [novelPrice, setNovelPrice] = useState(novelData.novel_price || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setNovelData((prevData: any) => ({
      ...prevData,
      novel_name: novelName,
      writername: writerName,
      cover: coverImage,
      description: description,
      novel_visibility: novelVisibility, // เก็บค่าเป็น boolean
      novel_type1: novelType1,
      novel_type2: novelType2,
      rate: novelRate,
      novel_price: novelPrice,
    }));
  }, [novelName, writerName, coverImage, description, novelVisibility, novelType1, novelType2, novelRate, novelPrice]);
  

  useEffect(() => {
    setNovelName(novelData.novel_name || '');
    setWriterName(novelData.writername || '');
    setNovelVisibility(novelData.novel_visibility || false);
    setCoverImage(novelData.cover || '');
    setDescription(novelData.description || '');
    setNovelType1(novelData.novel_type1 || '');
    setNovelType2(novelData.novel_type2 || '');
    setNovelRate(novelData.rate || '');
    setNovelPrice(novelData.novel_price || '');
  }, [novelData]);

  return (
    <div className="writerEditSection">
      <div className="writerEditTopNovel">
        <div className="input-container-NovelNameAndWriterName">
          <input
            type="text"
            placeholder="ชื่อนิยาย"
            name="nameNovel"
            className="inputNovel-Name"
            value={novelName}
            onChange={(e) => setNovelName(e.target.value)}
          />
        </div>

        <div className="input-container-customupload">
          <label className="custum-file-upload" htmlFor="file">
            <div className="icon">
              {coverImage ? (
                <img id="show-data-cover" src={coverImage} alt="cover" className="uploaded-cover" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24" className="upload-icon">
                    <path
                      d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </>
              )}
            </div>
            <input type="file" id="file" onChange={handleImageUpload} />
          </label>
        </div>

          <div className="input-wrapper-dropdownNovelVisibility">
          <select
            className="dropdownNovelVisibility "
            value={novelVisibility ? 'true' : 'false'}
            onChange={(e) => setNovelVisibility(e.target.value === 'true')}
          >
            <option value="" disabled>สถานะการเผยแพร่</option>
            <option value="false">ส่วนตัว</option>
            <option value="true">เผยแพร่</option>
          </select>
        </div>

        <div className="input-container-NovelNameAndWriterName">
          <input
            type="text"
            placeholder="นามปากกา"
            name="writerName"
            className="inputNovel-WriterName"
            value={writerName}
            onChange={(e) => setWriterName(e.target.value)}
          />
        </div>

      </div>

      <div className="writerEditBottomNovel">
        <div className='coverdescription'>

            <textarea
              placeholder="คำอธิบาย"
              maxLength={150}
              name="descriptionNovel"
              className="input-descriptionNovel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          
        </div>

        <div className="typeAndPriceContainer">
          <div className="input-wrapper-dropdownNovelType">
            <select
              className="dropdownNovelTypeAndRate"
              value={novelType1}
              onChange={(e) => setNovelType1(e.target.value)}
            >
              <option value="" disabled>ประเภทที่ 1</option>
              <option value="โรแมนติก">โรแมนติก</option>
              <option value="คอมเมดี้">คอมเมดี้</option>
              <option value="แอ็คชั่น">แอ็คชั่น</option>
              <option value="สยองขวัญ">สยองขวัญ</option>
              <option value="แฟนตาซี">แฟนตาซี</option>
            </select>
          </div>
          
          <div className="input-wrapper-dropdownNovelType">
          <select
          className={`dropdownNovelTypeAndRate ${novelData.novel_type1 === novelData.novel_type2 ? 'error' : ''}`}
          value={novelType2}
          onChange={(e) => setNovelType2(e.target.value)}
            >
          <option value="" disabled>ประเภทที่ 2</option>
          <option value="โรแมนติก">โรแมนติก</option>
          <option value="คอมเมดี้">คอมเมดี้</option>
          <option value="แอ็คชั่น">แอ็คชั่น</option>
          <option value="สยองขวัญ">สยองขวัญ</option>
          <option value="แฟนตาซี">แฟนตาซี</option>
          </select>

          </div>

          <div className="input-wrapper-dropdownNovelType">
            <select
              className="dropdownNovelTypeAndRate"
              value={novelRate}
              onChange={(e) => setNovelRate(e.target.value)}
            >
              <option value="" disabled>เรทนิยาย</option>
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
              className="inputPriceNovel"
              value={novelPrice}
              onChange={(e) => setNovelPrice(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterEditComponent;
