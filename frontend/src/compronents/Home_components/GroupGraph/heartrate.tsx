import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./heartrate.css";
import { getDailyHeartRate } from "../../../services/https/DataHealth/healthData";

interface HeartRatePoint {
  time: string; 
  heartRate: number | null;
  minutes: number;
}

interface DailyHeartRateResponse {
  date: string;
  data: { time: string; heartRate: number }[];
  stats?: { avg: number; min: number; max: number };
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const DairyHeartRate: React.FC = () => {
  const [data, setData] = useState<HeartRatePoint[]>([]);
  const [stats, setStats] = useState<{ avg: number; min: number; max: number }>({ avg: 0, min: 0, max: 0 });
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  const currentHour = new Date().getHours();
  //const hoursUntilNow = hours.slice(0, currentHour + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: DailyHeartRateResponse = await getDailyHeartRate(UserID);

        console.log("Fetched data:", res.data);

        if (!res.data || res.data.length === 0) {
          setHasData(false);
          setData([]);
          setStats({ avg: 0, min: 0, max: 0 });
          return;
        }

        const heartData: HeartRatePoint[] = res.data.map((d) => ({
          time: d.time,
          heartRate: d.heartRate,
          minutes: toMinutes(d.time) 
        })) as any;

        setData(heartData);

        const values = heartData.map(d => d.heartRate).filter(v => v !== null) as number[];
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          setStats({ avg, min, max });
          setHasData(true);
        } else {
          setStats({ avg: 0, min: 0, max: 0 });
          setHasData(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [UserID]);


  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-hr">
          <p>{`เวลา: ${label}`}</p>
          <p>{`Heart Rate: ${payload[0].value ?? "ไม่มีข้อมูล"} bpm`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="heartrate-container">
      <h2 className="text-header-hr">อัตราการเต้นหัวใจ</h2>
      <div className="stats-grid-hr">
        <div className="stat-card-hr">
          <div className="stat-value-hr avg">{Math.round(stats.avg)}</div>
          <div className="stat-label-hr">ค่าเฉลี่ย (bpm)</div>
        </div>
        <div className="stat-card-hr">
          <div className="stat-value-hr max">{stats.max}</div>
          <div className="stat-label-hr">สูงสุด (bpm)</div>
        </div>
        <div className="stat-card-hr">
          <div className="stat-value-hr min">{stats.min}</div>
          <div className="stat-label-hr">ต่ำสุด (bpm)</div>
        </div>
      </div>
      {!hasData && <div className="no-data-msg" style={{ textAlign: "center", color: "red" }}>⚠️ ไม่พบข้อมูลอัตราการเต้นหัวใจของวันนี้</div>}


      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis
            dataKey="minutes"
            tickFormatter={formatTime}
            type="number"
            domain={['auto', 'auto']}
          />
          <YAxis />
          <Tooltip labelFormatter={(v) => formatTime(v as number)} />
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="#ef4444"      // 🔴 สีเส้น (แดง)
            strokeWidth={2}       // 🔧 ความหนา
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DairyHeartRate;
