import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./heartrate.css";
import { getDailyHeartRate } from "../../../services/https/DataHealth/healthData";

interface HeartRatePoint {
  time: string;
  heartRate: number;
}

interface DailyHeartRateResponse {
  date: string;
  data: HeartRatePoint[];
  stats?: { avg: number; min: number; max: number };
}


const DairyHeartRate: React.FC = () => {
  const [data, setData] = useState<HeartRatePoint[]>([]);
  const [stats, setStats] = useState<{ avg: number; min: number; max: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDailyHeartRate(UserID);

        // map data ให้ตรงกับ interface
        const heartData: HeartRatePoint[] = res.data.map((d: any) => ({
          time: d.time,
          heartRate: d.heartRate,
        }));
        setData(heartData);

        if (res.stats) setStats(res.stats);
        else setStats(null);

      } catch (err) {
        console.error(err);
        setData([]);
        setStats(null);
      } finally {
        setLoading(false); // สำคัญ ไม่งั้นจะค้างที่ Loading...
      }
    };
    fetchData();
  }, []);


  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (data.length === 0) return <div>ไม่พบข้อมูลอัตราการเต้นหัวใจของวันนี้</div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-hr">
          <p>{`เวลา: ${label}`}</p>
          <p>{`Heart Rate: ${payload[0].value} bpm`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="heartrate-container">
      <h2 className="text-header-hr">อัตราการเต้นหัวใจ</h2>

      {/* Stats */}
      {stats && (
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
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 12 }}
            domain={["dataMin - 5", "dataMax + 5"]}
            label={{ value: "Heart Rate (bpm)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 3 }}
            activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DairyHeartRate;
