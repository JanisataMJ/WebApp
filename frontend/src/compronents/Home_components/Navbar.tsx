/*import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
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
                href="#chart1"
                style={{
                  color: isActive('#chart1') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#chart1') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Temperature
              </a>
              <a
                href="#chart2"
                style={{
                  color: isActive('#chart2') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#chart2') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Heart Rate
              </a>
              <a
                href="#chart3"
                style={{
                  color: isActive('#chart3') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#chart3') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Calorie
              </a>
              <a
                href="#chart4"
                style={{
                  color: isActive('#chart4') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#chart4') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                SPO2
              </a>
              <a
                href="#chart5"
                style={{
                  color: isActive('#chart5') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#chart5') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Steps
              </a>
              <a
                href="#chart6"
                style={{
                  color: isActive('#chart6') ? '#57648E' : '#934A5E',
                  fontWeight: isActive('#chart6') ? 'bold' : 'normal',
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                Sleep
              </a>
            </div>
          )}
        </div>

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

export default Navbar;*/

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
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
      <div className="main-nav">
        <div
          className="nav-home-wrapper"
          onMouseEnter={() => isInPage && setShowSubmenu(true)}
          onMouseLeave={() => isInPage && setShowSubmenu(false)}
        >
          <a
            href="/"
            onClick={handleHomeClick}
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span>HOME</span>
          </a>

          {isInPage && showSubmenu && (
          <div className="sub-nav">
            {[
              { id: 'cat2', label: 'ปฏิทิน' },
              { id: 'chart1', label: 'Temperature' },
              { id: 'chart2', label: 'Heart Rate' },
              { id: 'chart3', label: 'Calorie' },
              { id: 'chart4', label: 'SPO2' },
              { id: 'chart5', label: 'Steps' },
              { id: 'chart6', label: 'Sleep' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-sub-link ${isActive(`#${item.id}`) ? 'active-sub' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
        </div>

        <Link
          to="/calendar"
          className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
        >
          <span>MOOD</span>
        </Link>

        <Link
          to="/overview"
          className={`nav-link ${isActive('/overview') ? 'active' : ''}`}
        >
          <span>OVERVIEW</span>
        </Link>

        <Link
          to="/tips"
          className={`nav-link ${isActive('/tips') ? 'active' : ''}`}
        >
          <span>HEALTHY TIPS</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
