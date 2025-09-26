import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { getDailyCalories } from '../../../services/https/DataHealth/healthData';
import './calorie.css';

interface CalorieData {
  time: string;     // HH:00
  calories: number; // แคลอรี่ที่เผาผลาญในชั่วโมงนั้น
  activity?: string;
}

interface DailyCalorieResponse {
  date: string;
  data: { time: string; calories: number; activity: string }[];
  stats?: { avg: number; min: number; max: number };
}

const DairyCalorie: React.FC = () => {
  const [data, setData] = useState<CalorieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBurnedCalories, setTotalBurnedCalories] = useState(0);
  const [targetCalories, setTargetCalories] = useState<number>(500);
  const UserID = Number(localStorage.getItem("id"));

  // เตรียม array ชั่วโมง 0-23
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: DailyCalorieResponse = await getDailyCalories(UserID);
        const rawData = res.data || [];

        // แปลงข้อมูล API เป็น map { "HH:00": calories }
        const calorieMap: Record<string, number> = {};
        rawData.forEach((item, index) => {
          const hour = item.time.slice(0, 2) + ":00"; // เอาเฉพาะชั่วโมง
          const prevCalories = index > 0 ? rawData[index - 1].calories : 0;
          const burnedThisHour = Math.max(0, item.calories - prevCalories);
          calorieMap[hour] = (calorieMap[hour] || 0) + burnedThisHour;
        });

        // รวมข้อมูลครบทุกชั่วโมง
        const hourlyData: CalorieData[] = hours.map((h) => ({
          time: h,
          calories: calorieMap[h] ?? 0,
        }));

        setData(hourlyData);

        if (rawData.length > 0) {
          setTotalBurnedCalories(rawData[rawData.length - 1].calories);
        }
      } catch (err) {
        console.error('Failed to fetch daily burned calories', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [UserID]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (data.length === 0) return <div>ไม่พบข้อมูลพลังงานที่เผาผลาญของวันนี้</div>;

  const avgBurnedCaloriesPerHour = totalBurnedCalories / 24; // เฉลี่ยต่อ 24 ชั่วโมง
  const remainingCalories = targetCalories - totalBurnedCalories;
  const progressPercentage = (totalBurnedCalories / targetCalories) * 100;

  const CustomBarTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-cal">
          <p className="tooltip-time-cal">{`เวลา: ${label}`}</p>
          <p className="tooltip-calories">{`แคลอรี่: ${payload[0].value} kcal`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calorie-container">
      <div className="header-section-cal">
        <h2 className="title-cal">พลังงานที่เผาผลาญ</h2>

        {/* Input สำหรับเป้าหมาย */}
        <div className="target-input-group">
          <label htmlFor="target-cal" className="target-label">ตั้งเป้าหมายแคลอรี่</label>
          <div className="input-with-unit">
            <input
              id="target-cal"
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="target-input"
              min="0"
            />
            <span className="unit-label">kcal</span>
          </div>
        </div>

        <div className="stats-grid-cal">
          <div className="stat-card-cal">
            <div className="stat-value-cal total">{totalBurnedCalories.toFixed(2)}</div>
            <div className="stat-label-cal">เผาผลาญวันนี้ (kcal)</div>
          </div>
          <div className="stat-card-cal">
            <div className="stat-value-cal avg">{avgBurnedCaloriesPerHour.toFixed(2)}</div>
            <div className="stat-label-cal">เฉลี่ยต่อชั่วโมง (kcal)</div>
          </div>
          <div className="stat-card-cal">
            <div className={`stat-value-cal ${remainingCalories >= 0 ? 'negative' : 'positive'}`}>
              {remainingCalories >= 0 ? remainingCalories.toFixed(2) : Math.abs(remainingCalories).toFixed(2)}
            </div>
            <div className="stat-label-cal">
              {remainingCalories >= 0 ? 'เหลือที่ต้องเผาผลาญ (kcal)' : 'เกินเป้าหมาย (kcal)'}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section-cal">
        <div className="chart-container-cal bar-chart-cal">
          <h3 className="chart-title-cal">📊 แคลอรี่ที่เผาผลาญรายชั่วโมง</h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                stroke="#666"
                tick={{ fontSize: 12 }}
                ticks={hours} // บังคับให้แสดงครบทุกชั่วโมง
              />
              <YAxis stroke="#666" tick={{ fontSize: 12 }}
                label={{ value: 'แคลอรี่ (kcal)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default DairyCalorie;
