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
