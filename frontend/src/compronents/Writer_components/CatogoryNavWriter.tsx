import React, { useState, useEffect } from 'react';

const CategoryNavWriter: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>(window.location.pathname); // Set default active link based on the current path

  const handleLinkClick = (href: string) => {
    setActiveLink(href); // Update active link
  };

  useEffect(() => {
    setActiveLink(window.location.pathname); // Update active link when the component is mounted
  }, []);

  return (
    <div className='category'>
      <a
        href='/'
        onClick={() => handleLinkClick('/')}
        style={{ color: activeLink === '/' ? 'yellow' : '#FFF' , fontWeight: activeLink === '/' ? 'bold' : 'normal' }}
      >
        <span id="category">หน้าหลัก</span>
      </a>
      <a
        href='/Writer'
        onClick={() => handleLinkClick('/Writer')}
        style={{ color: activeLink === '/Writer' ? 'yellow' : '#FFF' , fontWeight: activeLink === '/Writer' ? 'bold' : 'normal' }}
      >
        <span id="category">งานเขียน</span>
      </a>
      <a
        href='/Income'
        onClick={() => handleLinkClick('/Income')}
        style={{ color: activeLink === '/Income' ? 'yellow' : '#FFF' , fontWeight: activeLink === '/Income' ? 'bold' : 'normal' }}
      >
        <span id="category">รายได้</span>
      </a>
    </div>
  );
};

export default CategoryNavWriter;
