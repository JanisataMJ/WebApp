import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDailyCalories } from '../../../services/https/DataHealth/healthData';
import './calorie.css';

interface CalorieData {
  time: string;
  calories: number;
  activity: string;
}

interface DailyCalorieResponse {
  date: string;
  data: CalorieData[];
  stats?: { avg: number; min: number; max: number };
}

const DairyCalorie: React.FC = () => {
  const [data, setData] = useState<CalorieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBurnedCalories, setTotalBurnedCalories] = useState(0);
  const [targetCalories, setTargetCalories] = useState<number>(500);
  const [noData, setNoData] = useState(false);
  const UserID = Number(localStorage.getItem("id"));

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchData = async () => {
      try {
        const res: DailyCalorieResponse = await getDailyCalories(UserID);
        const rawData = res.data || [];

        if (rawData.length === 0) {
          setNoData(true);
          setData([]);
          setTotalBurnedCalories(0);
        } else {
          setNoData(false);

          // 🕒 หา min/max เวลา
          const times = rawData.map(d => d.time);
          const minTime = Math.min(...times.map(t => parseInt(t.split(":")[0])));
          const maxTime = Math.max(...times.map(t => parseInt(t.split(":")[0])));

          // 1) Group by hour → เลือกค่า max ของแต่ละชั่วโมง
          const grouped: { [hour: string]: CalorieData } = {};
          rawData.forEach(d => {
            const hour = d.time.split(":")[0]; // เอาเฉพาะชั่วโมง
            if (!grouped[hour] || d.calories > grouped[hour].calories) {
              grouped[hour] = d;
            }
          });

          // 2) เรียงตามเวลา
          const sorted = Object.values(grouped).sort((a, b) =>
            a.time.localeCompare(b.time)
          );

          // 3) คำนวณ diff
          const diffData: CalorieData[] = sorted.map((d, i) => {
            if (i === 0) return { ...d };
            const prev = sorted[i - 1];
            return { ...d, calories: d.calories - prev.calories };
          });

          setData(diffData);
          setTotalBurnedCalories(sorted[sorted.length - 1].calories);
        }
      } catch (err) {
        console.error("Failed to fetch daily burned calories", err);
        setNoData(true);
        setData([]);
        setTotalBurnedCalories(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [UserID]);



  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  const avgBurnedCaloriesPerHour = data.length > 0 ? (totalBurnedCalories / data.length) : 0;
  const remainingCalories = targetCalories - totalBurnedCalories;
  const progressPercentage = targetCalories > 0 ? (totalBurnedCalories / targetCalories) * 100 : 0;

  const CustomBarTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-cal">
          <p>{`เวลา: ${label}`}</p>
          <p>{`แคลอรี่: ${payload[0].value} kcal`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calorie-container">
      <div className="header-section-cal">
        <h2 className="title-cal">พลังงานที่เผาผลาญ</h2>

        {/* Input Field ตั้งค่าเป้าหมาย */}
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
        <div className="progress-section-cal">
          <div className="progress-header-cal">
            <span className="progress-label-cal">ความคืบหน้าของเป้าหมายการเผาผลาญ</span>
            <span className="progress-percentage-cal">{progressPercentage.toFixed(2)}%</span>
          </div>
          <div className="progress-bar-cal">
            <div
              className="progress-fill-cal"
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: totalBurnedCalories > targetCalories ? '#10b981' : '#f59e0b'
              }}
            />
          </div>
          <div className="progress-info-cal">
            <span>{totalBurnedCalories.toFixed(2)} kcal</span>
            <span>เป้าหมาย: {targetCalories} kcal</span>
          </div>
        </div>
      </div>

      <div className="charts-section-cal">
        <div className="chart-container-cal bar-chart-cal">
          <h3 className="chart-title-cal">📊 แคลอรี่ที่เผาผลาญรายชั่วโมง</h3>
          {noData && (
            <p style={{ textAlign: "center", color: "red" }}>
              ⚠️ ไม่พบข้อมูลพลังงานที่เผาผลาญของวันนี้
            </p>
          )}
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} label={{ value: 'แคลอรี่ (kcal)', angle: -90, position: 'insideLeft' }} />
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
