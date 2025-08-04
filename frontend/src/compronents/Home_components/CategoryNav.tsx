/*import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
      <Link
        to='/'
        onClick={() => handleLinkClick('#cat1')}
        style={{
          color: activeLink === '#cat1' || activeLink === '#cat1_2' ? '#57648E' : '#934A5E',
          fontWeight: activeLink === '#cat1' || activeLink === '#cat1_2' ? 'bold' : 'normal',
        }}
      >
        <span id="category">หน้าหลัก</span>
      </Link>
      <a
        href='#cat2'
        onClick={() => handleLinkClick('#cat2')}
        style={{
          color: activeLink === '#cat2' ? '#57648E' : '#934A5E',
          fontWeight: activeLink === '#cat2' ? 'bold' : 'normal',
        }}
      >
        <span id="category">ปฏิทิน</span>
      </a>
      <a
        href='#cat3'
        onClick={() => handleLinkClick('#cat3')}
        style={{
          color: activeLink === '#cat3' ? '#57648E' : '#934A5E',
          fontWeight: activeLink === '#cat3' ? 'bold' : 'normal',
        }}
      >
        <span id="category">แอ็คชั่น</span>
      </a>
      
      <Link
        to="/overview"
        onClick={() => handleLinkClick('#overview')}
        style={{
          color: activeLink === '#overview' ? '#57648E' : '#934A5E',
          fontWeight: activeLink === '#overview' ? 'bold' : 'normal',
        }}
      >
        <span id="category">OVERVIEW</span>
      </Link>
      <Link
        to="/tips"
        onClick={() => handleLinkClick('#overview')}
        style={{
          color: activeLink === '#tips' ? '#57648E' : '#934A5E',
          fontWeight: activeLink === '#tips' ? 'bold' : 'normal',
        }}
      >
        <span id="category">HEALTHY TIPS</span>
      </Link>
    </div>
  );
};

export default CategoryNav;*/


import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CategoryNav: React.FC = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState<string>('#cat1');
  const observer = useRef<IntersectionObserver | null>(null);

  // ใช้ location.pathname สำหรับหน้าที่เปลี่ยน route
  const isInPage = location.pathname === '/';

  useEffect(() => {
    if (!isInPage) return; // ถ้าไม่ใช่หน้าหลัก ไม่ต้อง observe

    const sections = document.querySelectorAll('.hide');
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(`#${entry.target.id}`);
        }
      });
    };

    observer.current = new IntersectionObserver(observerCallback, options);
    sections.forEach((section) => observer.current?.observe(section));

    return () => {
      sections.forEach((section) => observer.current?.unobserve(section));
    };
  }, [isInPage]);

  // ฟังก์ชันช่วยเช็คว่า active หรือไม่
  const isActive = (target: string) => {
    if (location.pathname !== '/' && target.startsWith('#')) return false; // scroll ใช้เฉพาะหน้า /
    if (!target.startsWith('#')) return location.pathname === target;
    return activeLink === target;
  };

  const menuItems = [
    { type: 'link', to: '/', hash: '#cat1', label: 'หน้าหลัก' },
    { type: 'a', to: '#cat2', label: 'ปฏิทิน' },
    { type: 'a', to: '#cat3', label: 'แอ็คชั่น' },
    { type: 'link', to: '/overview', label: 'OVERVIEW' },
    { type: 'link', to: '/tips', label: 'HEALTHY TIPS' },
  ];

  return (
    <div className="category">
      {menuItems.map((item, index) => {
        const isItemActive = isActive(item.to);

        const style = {
          color: isItemActive ? '#57648E' : '#934A5E',
          fontWeight: isItemActive ? 'bold' : 'normal',
        };

        if (item.type === 'link') {
          return (
            <Link key={index} to={item.to} style={style}>
              <span id="category">{item.label}</span>
            </Link>
          );
        } else {
          return (
            <a key={index} href={item.to} style={style}>
              <span id="category">{item.label}</span>
            </a>
          );
        }
      })}
    </div>
  );
};

export default CategoryNav;
