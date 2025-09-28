import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './slideshow.css';
import { Activity, Heart, Droplets, Moon, TrendingUp } from 'lucide-react';

import { getHealthDataByUserID } from '../../services/https/DataHealth/healthData';
import { RealTimeInterface } from '../../interface/health_data_interface/realtime';

type HealthItem = {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgGradient: string;
};

const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [healthItems, setHealthItems] = useState<HealthItem[]>([]);
  const UserID = Number(localStorage.getItem("id"));

  const findAnalysis = (data: RealTimeInterface, category: string) => {
    return data.HealthAnalysis?.find(a => a.Category === category);
  };


  const mapHealthData = (data: RealTimeInterface): HealthItem[] => [
    {
      icon: Heart,
      label: "อัตราการเต้นหัวใจ",
      value: String(data.Bpm),
      sub: findAnalysis(data, "อัตราการเต้นหัวใจ")?.Interpretation || "ไม่มีข้อมูล",
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
    },
    {
      icon: Activity,
      label: "พลังงานที่ใช้ไป",
      value: String(data.CaloriesBurned.toFixed(0)),
      sub: findAnalysis(data, "พลังงานที่ใช้ไป")?.Interpretation || "ไม่มีข้อมูล",
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
    },
    {
      icon: Droplets,
      label: "ออกซิเจนในเลือด",
      value: `${data.Spo2}%` as string,
      sub: findAnalysis(data, "ออกซิเจนในเลือด")?.Interpretation || "ไม่มีข้อมูล",
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
    },
    {
      icon: Moon,
      label: "การนอนหลับ",
      value: (data.SleepHours || "ไม่มีข้อมูล") as string,
      sub: findAnalysis(data, "การนอนหลับ")?.Interpretation || "ไม่มีข้อมูล",
      color: "#6366f1",
      bgGradient: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
    },
    {
      icon: TrendingUp,
      label: "จำนวนก้าว",
      value: String(data.Steps),
      sub: findAnalysis(data, "จำนวนก้าว")?.Interpretation || "ไม่มีข้อมูล",
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
    },
  ];

  /* useEffect(() => {
    const fetchHealthdatas = async () => {
      try {
        const res = await getHealthDataByUserID(UserID);

        const sorted = res.sort(
          (a: RealTimeInterface, b: RealTimeInterface) =>
            new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        );

        if (sorted.length > 0) {
          const latest = sorted[0];

          // ✅ วันที่ปัจจุบัน (Asia/Bangkok)
          const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
          const latestDate = new Date(latest.Timestamp).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

          if (latestDate === today) {
            setHealthItems(mapHealthData(latest));
          } else {
            console.warn("ข้อมูลล่าสุดไม่ใช่ของวันนี้:", latestDate);
            setHealthItems([]); // ❌ ไม่ต้องแสดงค่า
          }
        }
      } catch (error) {
        console.error("Failed to fetch health data:", error);
      }
    };

    fetchHealthdatas();
  }, [UserID]); */
  useEffect(() => {
    const fetchHealthdatas = async () => {
      try {
        const res = await getHealthDataByUserID(UserID);

        const sorted = res.sort(
          (a: RealTimeInterface, b: RealTimeInterface) =>
            new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        );

        if (sorted.length > 0) {
          const latest = sorted[0];

          // ✅ วันที่ปัจจุบัน (Asia/Bangkok)
          const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
          const latestDate = new Date(latest.Timestamp).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

          if (latestDate === today) {
            // ข้อมูลวันนี้ → ใช้จริง
            setHealthItems(mapHealthData(latest));
          } else {
            // ❌ ไม่ใช่วันนี้ → สร้าง dummy ค่า 0
            const emptyData: RealTimeInterface = {
              ...latest,
              Bpm: 0,
              CaloriesBurned: 0,
              Spo2: 0,
              SleepHours: 0,
              Steps: 0,
              HealthAnalysis: [] // ล้าง interpret
            };

            // แปลงแล้วใส่ข้อความว่าไม่มีข้อมูล
            const items = mapHealthData(emptyData).map(item => ({
              ...item,
              sub: "ไม่พบข้อมูลสุขภาพตอนนี้"
            }));

            setHealthItems(items);
          }
        }
      } catch (error) {
        console.error("Failed to fetch health data:", error);
      }
    };

    fetchHealthdatas();
  }, [UserID]);


  useEffect(() => {
    if (healthItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % healthItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [healthItems]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? healthItems.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % healthItems.length);
  };

  const getCardPosition = (index: number): string => {
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(healthItems.length - 1)) return 'right';
    if (diff === -1 || diff === healthItems.length - 1) return 'left';
    if (diff === 2 || diff === -(healthItems.length - 2)) return 'far-right';
    if (diff === -2 || diff === healthItems.length - 2) return 'far-left';
    return 'hidden';
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit', hour12: false });
  };

  if (healthItems.length === 0) {
    return <div>โหลดข้อมูลสุขภาพ...</div>;
  }

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        <div className="slider-header">
          <h2 className="slider-title">ดัชนีสุขภาพ</h2>
          <div className="date-container">
            <div className="date">{getCurrentDate()}</div>
            <div className="time">{getCurrentTime()}</div>
          </div>
        </div>

        <div className="cards-container">
          <Button className="nav-arrow nav-arrow-left" onClick={handlePrevious} icon={<LeftOutlined />} />

          {healthItems.map((item, index) => {
            const position = getCardPosition(index);
            const IconComponent = item.icon;

            return (
              <div
                key={index}
                className={`health-card card-${position}`}
                style={{
                  borderColor: position === 'center' ? item.color : '#d1d5db',
                  background: position === 'center' ? item.bgGradient : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
                }}
              >
                <div
                  className={`card-icon-container ${position === 'center' ? 'icon-center' : 'icon-side'}`}
                  style={{
                    background: position === 'center'
                      ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)`
                      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                  }}
                >
                  <IconComponent
                    className={`card-icon ${position === 'center' ? 'icon-center-size' : 'icon-side-size'}`}
                    style={{ color: position === 'center' ? item.color : '#6b7280' }}
                  />
                </div>

                <div className={`card-label ${position === 'center' ? 'label-center' : 'label-side'}`}>
                  {item.label}
                </div>

                <div
                  className={`card-value ${position === 'center' ? 'value-center' : 'value-side'}`}
                  style={{ color: position === 'center' ? item.color : '#374151' }}
                >
                  {item.value}
                </div>

                {item.sub && position === 'center' && (
                  <div className="card-sub" style={{ color: `${item.color}80` }}>
                    {item.sub}
                  </div>
                )}

                {position === 'center' && (
                  <div className="status-indicator" style={{ backgroundColor: item.color }} />
                )}
              </div>
            );
          })}

          <Button className="nav-arrow nav-arrow-right" onClick={handleNext} icon={<RightOutlined />} />
        </div>

        <div className="dots-container">
          {healthItems.map((item, index) => (
            <Button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`nav-dot ${index === currentIndex ? 'nav-dot-active' : ''}`}
              style={{
                backgroundColor: index === currentIndex ? item.color : '#d1d5db',
                transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)',
                boxShadow: index === currentIndex ? `0 0 10px ${item.color}40` : 'none'
              }}
            />
          ))}
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              background: `linear-gradient(90deg, ${healthItems[currentIndex].color} 0%, ${healthItems[currentIndex].color}80 100%)`
            }}
          />
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">สิ่งที่ควรโฟกัสวันนี้</span>
            <span className="stat-value" style={{ color: healthItems[currentIndex].color }}>
              {healthItems[currentIndex].label}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">สถานะ</span>
            <span className="stat-value" style={{ color: healthItems[currentIndex].color }}>
              {healthItems[currentIndex].sub || 'Monitoring'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;