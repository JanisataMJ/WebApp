import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import './sleep.css';
import { getDailySleep } from '../../../services/https/DataHealth/healthData'; 
import { GetSleepAnalysisByUser } from '../../../services/https/DataHealth/healthAnalysis';

 interface SleepData {
  time: string;
  sleepStage: 'awake' | 'light' | 'deep' | 'rem';
  stageValue: number;
  hour: number;
  heartRate?: number;
  movement?: number;
}

interface SleepSummary {
  totalSleep: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awakeTime: number;
  sleepEfficiency: number;
  fallAsleepTime: number;
}

interface SleepStageDistribution {
  name: string;
  value: number;
  duration: number;
  color: string;
  percentage: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: SleepData;
    [key: string]: any;
  }>;
  label?: string;
}

  interface SleepAnalysis {
  riskId: number;
  note?: string;
}

const DairySleep: React.FC = () => {
  const [data, setData] = useState<SleepData[]>([]);
  const [sleepAnalysis, setSleepAnalysis] = useState<SleepAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSleep, resAnalysis] = await Promise.all([
          getDailySleep(UserID),
          GetSleepAnalysisByUser(UserID)
        ]);

        const mappedData: SleepData[] = resSleep.data.map((d: any) => {
          const [hourStr, minStr] = d.time.split(':').map(Number);
          const hour = hourStr + minStr / 60;
          return { ...d, hour };
        });

        setData(mappedData);
        setSleepAnalysis(resAnalysis.data);

      } catch (err) {
        console.error('Error fetching sleep data/analysis:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (data.length === 0) return <div>ยังไม่มีข้อมูลการนอนของวันนี้</div>;

  // ✅ หาเวลานอนเริ่มต้น-สิ้นสุด
  const sleepStart = data[0]?.time;
  const sleepEnd = data[data.length - 1]?.time;

  // ✅ นับจำนวนการนอนวันนี้ (session)
  const sessionCount = 1; // ถ้าอยากละเอียด ให้ detect gap > 30 นาที = session ใหม่

  // ✅ ใช้ riskId จาก HealthAnalysis
  const getSleepQualityFromRisk = (riskId: number) => {
    switch (riskId) {
      case 1: return { text: 'ดีเยี่ยม', emoji: '🌟', color: '#10b981' };
      case 2: return { text: 'พอใช้', emoji: '😐', color: '#f59e0b' };
      case 3: return { text: 'เสี่ยง', emoji: '⚠️', color: '#ef4444' };
      default: return { text: 'ไม่ทราบ', emoji: '❓', color: '#6b7280' };
    }
  };

  const quality = sleepAnalysis ? getSleepQualityFromRisk(sleepAnalysis.riskId) : null;

  return (
    <div className="sleep-container">
      <h2 className="title-sleep">การนอนหลับวันนี้</h2>

      <div className="summary-section">
        <p>🛏️ ช่วงเวลานอน: {sleepStart} - {sleepEnd}</p>
        <p>🔁 จำนวนครั้งการนอน: {sessionCount} ครั้ง</p>
        {quality && (
          <p style={{ color: quality.color }}>
            {quality.emoji} คุณภาพการนอน: {quality.text}
          </p>
        )}
      </div>

      {/* กราฟช่วงเวลาการนอน */}
      <div className="chart-container-sleep">
        <h3>📈 ระยะการนอนตลอดคืน</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[0.5, 4.5]} />
            <Area type="stepAfter" dataKey="stageValue" stroke="#3b82f6" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DairySleep;