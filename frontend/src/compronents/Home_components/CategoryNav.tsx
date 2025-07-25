import React, { useState, useEffect, useRef } from 'react';

const CategoryNav: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('#cat1');
  const observer = useRef<IntersectionObserver | null>(null);

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
  };

  useEffect(() => {
    const sections = document.querySelectorAll('.hide');
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% of the section should be visible
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(`#${entry.target.id}`);
        }
      });
    };

    observer.current = new IntersectionObserver(observerCallback, options);

    sections.forEach(section => {
      if (observer.current) {
        observer.current.observe(section);
      }
    });

    // Check if #cat1 is in view on initial load
    const checkInitialPosition = () => {
      const cat1 = document.querySelector('#cat1');
      if (cat1 && window.scrollY === 0) {
        setActiveLink('#cat1');
      }
    };

    checkInitialPosition();

    // Cleanup observer on component unmount
    return () => {
      if (observer.current) {
        sections.forEach(section => {
          observer.current?.unobserve(section);
        });
      }
    };
  }, []);

  return (
    <div className='category'>
      <a
        href='#cat1'
        onClick={() => handleLinkClick('#cat1')}
        style={{
          color: activeLink === '#cat1' || activeLink === '#cat1_2' ? 'yellow' : '#FFF',
          fontWeight: activeLink === '#cat1' || activeLink === '#cat1_2' ? 'bold' : 'normal',
        }}
      >
        <span id="category">หน้าหลัก</span>
      </a>
      <a
        href='#cat2'
        onClick={() => handleLinkClick('#cat2')}
        style={{
          color: activeLink === '#cat2' ? 'yellow' : '#FFF',
          fontWeight: activeLink === '#cat2' ? 'bold' : 'normal',
        }}
      >
        <span id="category">โรแมนติก</span>
      </a>
      <a
        href='#cat3'
        onClick={() => handleLinkClick('#cat3')}
        style={{
          color: activeLink === '#cat3' ? 'yellow' : '#FFF',
          fontWeight: activeLink === '#cat3' ? 'bold' : 'normal',
        }}
      >
        <span id="category">แอ็คชั่น</span>
      </a>
      <a
        href='#cat4'
        onClick={() => handleLinkClick('#cat4')}
        style={{
          color: activeLink === '#cat4' ? 'yellow' : '#FFF',
          fontWeight: activeLink === '#cat4' ? 'bold' : 'normal',
        }}
      >
        <span id="category">สยองขวัญ</span>
      </a>
      <a
        href='#cat5'
        onClick={() => handleLinkClick('#cat5')}
        style={{
          color: activeLink === '#cat5' ? 'yellow' : '#FFF',
          fontWeight: activeLink === '#cat5' ? 'bold' : 'normal',
        }}
      >
        <span id="category">แฟนตาซี</span>
      </a>
      <a
        href='#cat6'
        onClick={() => handleLinkClick('#cat6')}
        style={{
          color: activeLink === '#cat6' ? 'yellow' : '#FFF',
          fontWeight: activeLink === '#cat6' ? 'bold' : 'normal',
        }}
      >
        <span id="category">คอมเมดี้</span>
      </a>
    </div>
  );
};

export default CategoryNav;
