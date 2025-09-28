/* import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./heartrate.css";
import { getDailyHeartRate } from "../../../services/https/DataHealth/healthData";

interface HeartRatePoint {
  time: string;      // format เช่น "14:30"
  heartRate: number | null;
}

interface DailyHeartRateResponse {
  date: string;
  data: { time: string; heartRate: number }[];
  stats?: { avg: number; min: number; max: number };
}

const DairyHeartRate: React.FC = () => {
  const [data, setData] = useState<HeartRatePoint[]>([]);
  const [stats, setStats] = useState<{ avg: number; min: number; max: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  // เตรียม array ของชั่วโมง 0-23
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  // หาชั่วโมงปัจจุบัน เช่น 14:xx => "14:00"
  const currentHour = new Date().getHours();
  const hoursUntilNow = hours.slice(0, currentHour + 1); // รวมถึงชั่วโมงปัจจุบัน

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: DailyHeartRateResponse = await getDailyHeartRate(UserID);

        // map API data => { "HH:00": heartRate }
        const heartDataMap: Record<string, number> = {};
        res.data.forEach((d) => {
          const hour = d.time.slice(0, 2) + ":00"; // ตัดแค่ชั่วโมง
          heartDataMap[hour] = d.heartRate;
        });

        // รวมกับทุกชั่วโมง 0-23
        const fullDayData: HeartRatePoint[] = hoursUntilNow.map((h) => ({
          time: h,
          heartRate: heartDataMap[h] ?? null,
        }));

        setData(fullDayData);
        if (res.stats) setStats(res.stats);
        else setStats(null);
      } catch (err) { 
        console.error(err);
        setData([]);
        setStats(null);
      } finally {
        setLoading(false);
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
          <p>{`Heart Rate: ${payload[0].value ?? "ไม่มีข้อมูล"} bpm`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="heartrate-container">
      <h2 className="text-header-hr">อัตราการเต้นหัวใจ</h2>

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

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            stroke="#666"
            tick={{ fontSize: 12 }}
            ticks={hoursUntilNow} // ใช้แค่เวลาถึงตอนนี้
          />
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
            connectNulls={false} // จะเว้นช่วงที่ไม่มีข้อมูล
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DairyHeartRate;
 */

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./heartrate.css";
import { getDailyHeartRate } from "../../../services/https/DataHealth/healthData";

interface HeartRatePoint {
  time: string;      // format เช่น "14:30"
  heartRate: number | null;
}

interface DailyHeartRateResponse {
  date: string;
  data: { time: string; heartRate: number }[];
  stats?: { avg: number; min: number; max: number };
}

const DairyHeartRate: React.FC = () => {
  const [data, setData] = useState<HeartRatePoint[]>([]);
  const [stats, setStats] = useState<{ avg: number; min: number; max: number }>({ avg: 0, min: 0, max: 0 });
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  // เตรียม array ของชั่วโมง 0-23
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  const currentHour = new Date().getHours();
  const hoursUntilNow = hours.slice(0, currentHour + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: DailyHeartRateResponse = await getDailyHeartRate(UserID);

        if (!res.data || res.data.length === 0) {
          // ❌ ไม่มีข้อมูล → กำหนดค่า default
          setHasData(false);
          setData(hoursUntilNow.map(h => ({ time: h, heartRate: null })));
          setStats({ avg: 0, min: 0, max: 0 });
          return;
        }

        // ✅ มีข้อมูล → map API data
        const heartDataMap: Record<string, number> = {};
        res.data.forEach((d) => {
          const hour = d.time.slice(0, 2) + ":00";
          heartDataMap[hour] = d.heartRate;
        });

        const fullDayData: HeartRatePoint[] = hoursUntilNow.map((h) => ({
          time: h,
          heartRate: heartDataMap[h] ?? null,
        }));

        setData(fullDayData);
        setStats(res.stats || { avg: 0, min: 0, max: 0 });
        setHasData(true);
      } catch (err) {
        console.error(err);
        setHasData(false);
        setData(hoursUntilNow.map(h => ({ time: h, heartRate: null })));
        setStats({ avg: 0, min: 0, max: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} ticks={hoursUntilNow} />
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
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DairyHeartRate;
