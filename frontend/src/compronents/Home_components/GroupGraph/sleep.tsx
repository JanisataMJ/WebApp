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
  const [maxMinutes, setMaxMinutes] = useState(480); // default 8 ชม. = 480 นาที
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  // helper แปลง "8h 30m" → นาทีทั้งหมด
  const parseSleepMinutes = (text: string): number => {
    const hMatch = text.match(/(\d+)h/);
    const mMatch = text.match(/(\d+)m/);
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
    return hours * 60 + minutes;
  };

  // helper แปลง นาที → HH:mm
  const formatMinutes = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}:00` : `${h}:${m.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDailySleep(UserID);
        if (!res.data || res.data.length === 0) {
          setSleepRecord(null);
          return;
        }

        const record: SleepData = res.data[0];
        setSleepRecord(record);

        // คำนวณเป็นนาที
        const totalMinutes = parseSleepMinutes(record.sleepHours);
        setMaxMinutes(totalMinutes);

        // สร้าง dataset: ทีละ 30 นาที
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
        setSleepRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ticks ทุกครึ่งชม.
  const ticks: number[] = [];
  for (let i = 0; i <= Math.max(480, maxMinutes); i += 30) {
    ticks.push(i);
  }

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!sleepRecord) return <div>ยังไม่มีข้อมูลการนอนของเมื่อคืน</div>;

  return (
    <div className="sleep-container">
      <h2 className="title-sleep">การนอนเมื่อคืน</h2>

      <div className="summary-section">
        <p>😴 รวมเวลานอน: {sleepRecord.sleepHours}</p>
      </div>

      <div className="chart-container-sleep">
        <h3>📊 กราฟชั่วโมงการนอน</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, Math.max(480, maxMinutes)]} // ขั้นต่ำ 8 ชม.
              ticks={ticks}
              tickFormatter={formatMinutes} // ✅ นาที → เวลา
              tick={{ fontSize: 12, fill: "#ffffff", fontWeight: "bold" }}
              label={{ value: "เวลา (ชม.:นาที)", position: "insideBottom", offset: -5 }}
            />
            <YAxis hide />
            <Tooltip
              formatter={() => ["นอน"]}
              labelFormatter={(value) => `ชั่วโมงที่: ${formatMinutes(value as number)}`}
              contentStyle={{
                backgroundColor: "#1f2937", // สีพื้นหลัง (เทาเข้ม)
                border: "1px solid #60a5fa",
                borderRadius: "8px"
              }}
              itemStyle={{
                color: "#facc15", // สีตัวหนังสือ (เหลือง)
                fontWeight: "bold"
              }}
              labelStyle={{
                color: "#93c5fd", // สี label (ฟ้าอ่อน)
                fontWeight: "bold"
              }}
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
