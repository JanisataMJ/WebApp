import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Card3 from '../../../แดนโค้ดมรณา/card3';
import './slideshow.css'

function Slider() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

  const slides = [
    {
      name: "ชีวิตที่แสนเหงา",
      imgUrl: 'https://4kwallpapers.com/images/walls/thumbs_3t/9292.jpg',
      views: "1000",
      like: "500",
      tag: "Drama",
      price: 30,
      rate: "13+",
      writer: "John Doe",
      title: "A brief description of this novel..."
    },
    {
      name: "Second slide label",
      imgUrl: 'https://4kwallpapers.com/images/walls/thumbs_3t/9311.png',
      views: "1500",
      like: "700",
      tag: "Adventure",
      price: 30,
      rate: "13+",
      writer: "Jane Doe",
      title: "Another brief description..."
    },
    {
      name: "Third slide label",
      imgUrl: 'https://4kwallpapers.com/images/walls/thumbs_3t/9254.jpg',
      views: "1200",
      like: "800",
      tag: "Thriller",
      price: 30,
      rate: "13+",
      writer: "Alice",
      title: "Yet another description..."
    }
  ];

  const handleSlideClick = (slide: any) => {
    setSelectedSlide(slide);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Carousel>
        {slides.map((slide, index) => (
          <Carousel.Item key={index} interval={1000} onClick={() => handleSlideClick(slide)}>
            <img id='pic' src={slide.imgUrl} alt={slide.name} />
            <Carousel.Caption>
              <h3 id='hd'>{slide.name}</h3>
              <p id='pd'>{slide.title}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Modal that shows on slide click */}
      {/* {selectedSlide && (
        <Card3
          card={selectedSlide}
          showModal={showModal}
          handleCloseModal={handleCloseModal}
        />
      )} */}
    </>
  );
}

export default Slider;