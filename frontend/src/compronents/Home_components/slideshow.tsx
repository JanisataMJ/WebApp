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


const formatSleepHours = (val: string | number | null | undefined): string => {
  if (!val) return "ไม่มีข้อมูล";

  if (typeof val === "number") {
    return `${val.toFixed(2)} ชม.`;
  }

  const match = val.match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return "ไม่มีข้อมูล";

  const hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  const formatted = `${hours}.${minutes.toString().padStart(2, "0")}`;
  return `${formatted} ชม.`;
};


// 👇 helper: หาค่าล่าสุด (ถ้า null → ไปดู record ก่อนหน้า)
const getLatestNonNull = <K extends keyof RealTimeInterface>(
  data: RealTimeInterface[],
  key: K
): RealTimeInterface[K] | 0 => {
  for (const d of data) {
    const val = d[key];
    if (
      val !== null &&
      val !== undefined &&
      !(typeof val === "string" && val.trim() === "")
    ) {
      return val;
    }
  }
  return 0 as RealTimeInterface[K];
};


const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [healthItems, setHealthItems] = useState<HealthItem[]>([]);
  const UserID = Number(localStorage.getItem("id"));

  const findAnalysis = (data: RealTimeInterface, category: string) => {
    return data.HealthAnalysis?.find(a => a.Category === category);
  };

  const formatSleep = (val: string): string => {
    if (!val) return "ไม่มีข้อมูล";
    return val.replace("h", " ชม.").replace("m", " นาที");
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
      label: "พลังงานที่เผาผลาญ",
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
      value: formatSleepHours(data.SleepHours),
      //sub: findAnalysis(data, "การนอนหลับ")?.Interpretation || "ไม่มีข้อมูล",
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


  useEffect(() => {
    const fetchHealthdatas = async () => {
      try {
        const res = await getHealthDataByUserID(UserID);

        // sort ใหม่ → เก่า
        const sorted = [...res].sort(
          (a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        );

        if (sorted.length === 0) {
          // ไม่มีข้อมูลเลย
          const emptyData: RealTimeInterface = {
            ID: 0,
            Timestamp: new Date().toISOString(),
            Bpm: 0,
            CaloriesBurned: 0,
            Spo2: 0,
            SleepHours: 0,
            Steps: 0,
            HealthAnalysis: []
          };
          setHealthItems(
            mapHealthData(emptyData).map(i => ({ ...i, sub: "ไม่พบข้อมูลสุขภาพตอนนี้" }))
          );
          return;
        }

        // ✅ หาค่า latest แบบ fallback ไป record ก่อนหน้า
        const latestBpm = getLatestNonNull(sorted, "Bpm") ?? 0;
        const latestCalories = getLatestNonNull(sorted, "CaloriesBurned") ?? 0;
        const latestSpo2 = getLatestNonNull(sorted, "Spo2") ?? 0;

        /* const latestSleepRaw = getLatestNonNull(sorted, "SleepHours") ?? 0;
        const latestSleep = parseSleepToHours(latestSleepRaw); */
        const latestSleep = getLatestNonNull(sorted, "SleepHours") || "ไม่มีข้อมูล";

        const latestSteps = getLatestNonNull(sorted, "Steps") ?? 0;

        const mergedData: RealTimeInterface = {
          ...sorted[0], // clone field อื่น เช่น HealthAnalysis
          Bpm: latestBpm,
          CaloriesBurned: latestCalories,
          Spo2: latestSpo2,
          SleepHours: latestSleep,
          Steps: latestSteps,
          HealthAnalysis: sorted[0].HealthAnalysis ?? []
        };

        setHealthItems(mapHealthData(mergedData));
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