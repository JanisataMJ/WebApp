import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  ResponsiveContainer, Tooltip, CartesianGrid
} from "recharts";
import "./sleep.css";
import { getDailySleep } from "../../../services/https/DataHealth/healthData";

interface SleepData {
  sleepHours: string; // เช่น "8h 30m"
}

interface ChartData {
  minute: number;  // หน่วยนาที ใช้ทำแกน X
  value: number;   // 1 = กำลังนอน
}

const DairySleep: React.FC = () => {
  const [sleepRecord, setSleepRecord] = useState<SleepData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [maxMinutes, setMaxMinutes] = useState(480); // default 8 ชม.
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false); // 👈 state บอกว่ามีข้อมูลจริงหรือไม่
  const UserID = Number(localStorage.getItem("id"));

  // helper แปลง "8h 30m" → นาทีทั้งหมด
  const parseSleepMinutes = (text: string): number => {
    const hMatch = text.match(/(\d+)h/);
    const mMatch = text.match(/(\d+)m/);
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
    return hours * 60 + minutes;
  };

  const formatMinutes = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}:00` : `${h}:${m.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchData = async () => {
      try {
        const res = await getDailySleep(UserID);
        const records = res.data || [];

        const latestRecord = [...records].reverse().find(r => r.sleepHours && r.sleepHours.trim() !== "");

        if (!latestRecord) {
          setSleepRecord({ sleepHours: "0h 0m" });
          setChartData([]);
          setHasData(false);
          return;
        }

        setSleepRecord(latestRecord);
        setHasData(true);

        const totalMinutes = parseSleepMinutes(latestRecord.sleepHours);
        setMaxMinutes(totalMinutes);

        const generated: ChartData[] = [];
        for (let i = 0; i <= totalMinutes; i += 30) {
          generated.push({ minute: i, value: 1 });
        }
        if (totalMinutes % 30 !== 0) {
          generated.push({ minute: totalMinutes, value: 1 });
        }

        setChartData(generated);

      } catch (err) {
        console.error("Error fetching sleep data:", err);
        setSleepRecord({ sleepHours: "0h 0m" });
        setChartData([]);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [UserID]);


  // ticks ทุกครึ่งชม.
  const ticks: number[] = [];
  for (let i = 0; i <= Math.max(480, maxMinutes); i += 30) {
    ticks.push(i);
  }

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="sleep-container">
      <h2 className="title-sleep">การนอนเมื่อคืน</h2>

      <div className="summary-section">
        <p>😴 รวมเวลานอน: {sleepRecord?.sleepHours || "0h 0m"}</p>
        {!hasData && <p style={{ color: "red" }}>⚠️ ไม่พบข้อมูลการนอนของเมื่อคืน</p>}
      </div>

      <div className="chart-container-sleep">
        <h3>📊 กราฟชั่วโมงการนอน</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, Math.max(480, maxMinutes)]}
              ticks={ticks}
              tickFormatter={formatMinutes}
              tick={{ fontSize: 12, fill: "#ffffff", fontWeight: "bold" }}
              label={{ value: "เวลา (ชม.:นาที)", position: "insideBottom", offset: -5 }}
            />
            <YAxis hide />
            <Tooltip
              formatter={() => ["นอน"]}
              labelFormatter={(value) => `ชั่วโมงที่: ${formatMinutes(value as number)}`}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #60a5fa",
                borderRadius: "8px"
              }}
              itemStyle={{ color: "#facc15", fontWeight: "bold" }}
              labelStyle={{ color: "#93c5fd", fontWeight: "bold" }}
            />
            <Area
              type="stepAfter"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              fill="#60a5fa"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DairySleep;