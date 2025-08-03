import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './heartrate.css';

interface HeartRateData {
  time: string;
  heartRate: number;
  hour: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    [key: string]: any;
  }>;
  label?: string;
}

const Graph2: React.FC = () => {
  // สร้างข้อมูล Heart Rate ตัวอย่างสำหรับทั้งวัน
  const generateHeartRateData = (): HeartRateData[] => {
    const data: HeartRateData[] = [];
    
    // สร้างข้อมูลทุก 30 นาที
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        let heartRate: number;
        
        // จำลอง Heart Rate ตามช่วงเวลาต่างๆ
        if (hour >= 0 && hour < 6) {
          // ช่วงหลับ - อัตราการเต้นต่ำ
          heartRate = 50 + Math.random() * 15;
        } else if (hour >= 6 && hour < 8) {
          // ตื่นนอน - เริ่มสูงขึ้น
          heartRate = 65 + Math.random() * 20;
        } else if (hour >= 8 && hour < 12) {
          // เช้า - ทำงาน
          heartRate = 70 + Math.random() * 25;
        } else if (hour >= 12 && hour < 13) {
          // พักเที่ยง
          heartRate = 75 + Math.random() * 15;
        } else if (hour >= 13 && hour < 17) {
          // บ่าย - ทำงาน
          heartRate = 72 + Math.random() * 28;
        } else if (hour >= 17 && hour < 19) {
          // หลังเลิกงาน - อาจออกกำลังกาย
          heartRate = 80 + Math.random() * 40;
        } else if (hour >= 19 && hour < 22) {
          // เย็น - พักผ่อน
          heartRate = 68 + Math.random() * 22;
        } else {
          // ก่อนเข้านอน
          heartRate = 60 + Math.random() * 15;
        }
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        data.push({
          time: time,
          heartRate: Math.round(heartRate),
          hour: hour
        });
      }
    }
    
    return data;
  };

  const data = generateHeartRateData();
  
  // คำนวณค่าเฉลี่ย, สูงสุด, ต่ำสุด
  const heartRates = data.map(d => d.heartRate);
  const avgHeartRate = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);
  const maxHeartRate = Math.max(...heartRates);
  const minHeartRate = Math.min(...heartRates);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-hr">
          <p className="tooltip-time-hr">{`เวลา: ${label}`}</p>
          <p className="tooltip-heartrate">
            {`Heart Rate: ${payload[0].value} bpm`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="heartrate-container">
      <div className="header-section-hr">
        <h2 className="title-hr">
          📊 Heart Rate วันนี้ ({new Date().toLocaleDateString('th-TH')})
        </h2>
        
        {/* สถิติสรุป */}
        <div className="stats-grid-hr">
          <div className="stat-card-hr">
            <div className="stat-value-hr avg">{avgHeartRate}</div>
            <div className="stat-label-hr">ค่าเฉลี่ย (bpm)</div>
          </div>
          <div className="stat-card-hr">
            <div className="stat-value-hr max">{maxHeartRate}</div>
            <div className="stat-label-hr">สูงสุด (bpm)</div>
          </div>
          <div className="stat-card-hr">
            <div className="stat-value-hr min">{minHeartRate}</div>
            <div className="stat-label-hr">ต่ำสุด (bpm)</div>
          </div>
        </div>
      </div>

      {/* กราฟ */}
      <div className="chart-container-hr">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#666"
              tick={{ fontSize: 12 }}
              interval={3} // แสดงทุก 4 จุด (ทุก 2 ชั่วโมง)
            />
            <YAxis 
              stroke="#666"
              tick={{ fontSize: 12 }}
              domain={['dataMin - 5', 'dataMax + 5']}
              label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* คำอธิบาย */}
      <div className="info-section-hr">
        <p className="info-title-hr">💡 <strong>คำแนะนำ:</strong></p>
        <ul className="info-list-hr">
          <li>• Heart Rate ปกติขณะพัก: 60-100 bpm</li>
          <li>• ขณะหลับ: 40-60 bpm</li>
          <li>• ขณะออกกำลังกาย: 120-160 bpm (ขึ้นกับอายุ)</li>
          <li>• หากมีความผิดปกติควรปรึกษาแพทย์</li>
        </ul>
      </div>
    </div>
  );
};

export default Graph2;