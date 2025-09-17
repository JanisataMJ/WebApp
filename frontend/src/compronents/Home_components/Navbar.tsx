import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
//import './Navbar.css';
import '../Pubblic_components/header.css'

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState<string>('#cat1');
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const isInPage = location.pathname === '/home';

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
    if (location.pathname !== '/home' && target.startsWith('#')) return false;
    if (!target.startsWith('#')) return location.pathname === target;
    return activeLink === target;
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/home') {
      e.preventDefault();
      navigate('/home');
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
            href="/home"
            onClick={handleHomeClick}
            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            <span>หน้าหลัก</span>
          </a>

          {isInPage && showSubmenu && (
          <div className="sub-nav">
            {[
              { id: 'chart1', label: 'อัตราการเต้นหัวใจ' }, 
              { id: 'chart2', label: 'พลังงานที่ใช้ไป' },
              { id: 'chart3', label: 'จำนวนก้าว' },
              { id: 'chart4', label: 'ออกซิเจนในเลือด' },
              { id: 'chart5', label: 'การนอนหลับ' },
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
          <span>อารมณ์/ความรู้สึก</span>
        </Link>

        <Link
          to="/overview"
          className={`nav-link ${isActive('/overview') ? 'active' : ''}`}
        >
          <span>ภาพรวมสุขภาพ</span>
        </Link>

        <Link
          to="/tips"
          className={`nav-link ${isActive('/tips') ? 'active' : ''}`}
        >
          <span>เคล็ดลับดูแลสุขภาพ</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
