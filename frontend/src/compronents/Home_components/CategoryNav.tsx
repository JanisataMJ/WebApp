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






/*import React, { useEffect, useRef, useState } from 'react';
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

export default CategoryNav;*/

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CategoryNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState<string>('#cat1');
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const isInPage = location.pathname === '/';

  useEffect(() => {
    if (!isInPage) return;

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

  const isActive = (target: string) => {
    if (location.pathname !== '/' && target.startsWith('#')) return false;
    if (!target.startsWith('#')) return location.pathname === target;
    return activeLink === target;
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/');
    }
  };

  return (
    <div className="category">
      <div className="main-nav" style={{ position: 'relative' }}>
        {/* หน้าหลัก: hover เพื่อแสดงเมนูย่อย */}
        <div
          onMouseEnter={() => isInPage && setShowSubmenu(true)}
          onMouseLeave={() => isInPage && setShowSubmenu(false)}
          style={{ display: 'inline-block', position: 'relative' }}
        >
          <a
            href="/"
            onClick={handleHomeClick}
            style={{
              color: location.pathname === '/' ? '#57648E' : '#934A5E',
              fontWeight: location.pathname === '/' ? 'bold' : 'normal',
            }}
          >
            <span id="category">HOME</span>
          </a>

          {/* เมนูย่อยเฉพาะในหน้า / และเมื่อ hover */}
          {isInPage && showSubmenu && (
            <div
              className="sub-nav"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#fff',
                border: '1px solid #ccc',
                padding: '8px 12px',
                zIndex: 100,
              }}
            >
              <a
                href="#cat2"
                style={{
                  color: isActive('#cat2') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#cat2') ? 'bold' : 'normal',
                  display: 'block',
                  marginBottom: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                ปฏิทิน
              </a>
              <a
                href="#cat3"
                style={{
                  color: isActive('#cat3') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#cat3') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                แอ็คชั่น
              </a>
            </div>
          )}
        </div>

        {/* ปุ่มอื่น */}
        <Link
          to="/overview"
          style={{
            color: isActive('/overview') ? '#57648E' : '#934A5E',
            fontWeight: isActive('/overview') ? 'bold' : 'normal',
            marginLeft: '20px',
          }}
        >
          <span id="category">OVERVIEW</span>
        </Link>

        <Link
          to="/tips"
          style={{
            color: isActive('/tips') ? '#57648E' : '#934A5E',
            fontWeight: isActive('/tips') ? 'bold' : 'normal',
            marginLeft: '20px',
          }}
        >
          <span id="category">HEALTHY TIPS</span>
        </Link>
      </div>
    </div>
  );
};

export default CategoryNav;