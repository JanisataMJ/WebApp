import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import './temp.css';

interface TemperatureData {
  time: string;
  temperature: number;
  hour: number;
  status: 'normal' | 'low' | 'high' | 'fever';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: TemperatureData;
    [key: string]: any;
  }>;
  label?: string;
}

const Graph1: React.FC = () => {
  // สร้างข้อมูลอุณหภูมิร่างกายตัวอย่างสำหรับทั้งวัน
  const generateTemperatureData = (): TemperatureData[] => {
    const data: TemperatureData[] = [];
    
    // สร้างข้อมูลทุก 2 ชั่วโมง
    for (let hour = 0; hour < 24; hour += 2) {
      let baseTemp: number;
      
      // จำลองอุณหภูมิร่างกายตามเวลา (circadian rhythm)
      if (hour >= 2 && hour < 6) {
        // ช่วงดึก-เช้า อุณหภูมิต่ำสุด
        baseTemp = 36.1 + Math.random() * 0.4;
      } else if (hour >= 6 && hour < 10) {
        // เช้า อุณหภูมิเริ่มสูงขึ้น
        baseTemp = 36.3 + Math.random() * 0.5;
      } else if (hour >= 10 && hour < 14) {
        // สาย-บ่าย อุณหภูมิปกติ
        baseTemp = 36.5 + Math.random() * 0.6;
      } else if (hour >= 14 && hour < 18) {
        // บ่าย อุณหภูมิสูงสุดของวัน
        baseTemp = 36.6 + Math.random() * 0.7;
      } else if (hour >= 18 && hour < 22) {
        // เย็น อุณหภูมิเริ่มลด
        baseTemp = 36.4 + Math.random() * 0.5;
      } else {
        // ค่ำ-ดึก อุณหภูมิลดลง
        baseTemp = 36.2 + Math.random() * 0.4;
      }

      const temperature = Math.round(baseTemp * 10) / 10;
      
      // กำหนดสถานะ
      let status: 'normal' | 'low' | 'high' | 'fever';
      if (temperature < 36.1) {
        status = 'low';
      } else if (temperature >= 37.5) {
        status = 'fever';
      } else if (temperature >= 37.2) {
        status = 'high';
      } else {
        status = 'normal';
      }
      
      const time = `${hour.toString().padStart(2, '0')}:00`;
      data.push({
        time: time,
        temperature: temperature,
        hour: hour,
        status: status
      });
    }
    
    return data;
  };

  const data = generateTemperatureData();
  
  // คำนวณค่าต่างๆ
  const temperatures = data.map(d => d.temperature);
  const avgTemperature = Math.round((temperatures.reduce((a, b) => a + b, 0) / temperatures.length) * 10) / 10;
  const maxTemperature = Math.max(...temperatures);
  const minTemperature = Math.min(...temperatures);
  
  // นับสถานะต่างๆ
  const statusCounts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ข้อมูลช่วงอุณหภูมิปกติ
  const normalRange = [
    { time: '00:00', normal_min: 36.1, normal_max: 37.2 },
    { time: '23:59', normal_min: 36.1, normal_max: 37.2 }
  ];

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip-temp">
          <p className="tooltip-time-temp">{`เวลา: ${label}`}</p>
          <p className="tooltip-temperature">
            {`อุณหภูมิ: ${payload[0].value}°C`}
          </p>
          <p className={`tooltip-status-temp ${data.status}`}>
            {getStatusText(data.status)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'low': return '🟦 อุณหภูมิต่ำ';
      case 'normal': return '🟢 ปกติ';
      case 'high': return '🟡 สูงเล็กน้อย';
      case 'fever': return '🔴 มีไข้';
      default: return 'ไม่ทราบ';
    }
  };

  const getStatusColor = (temperature: number): string => {
    if (temperature < 36.1) return '#3b82f6';
    if (temperature >= 37.5) return '#ef4444';
    if (temperature >= 37.2) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="temperature-container">
      <div className="header-section-temp">
        <h2 className="title-temp">
          🌡️ อุณหภูมิร่างกาย วันนี้ ({new Date().toLocaleDateString('th-TH')})
        </h2>
        
        {/* สถิติสรุป */}
        <div className="stats-grid-temp">
          <div className="stat-card-temp">
            <div className="stat-value-temp avg">{avgTemperature}°C</div>
            <div className="stat-label-temp">ค่าเฉลี่ย</div>
          </div>
          <div className="stat-card-temp">
            <div className="stat-value-temp max">{maxTemperature}°C</div>
            <div className="stat-label-temp">สูงสุด</div>
          </div>
          <div className="stat-card-temp">
            <div className="stat-value-temp min">{minTemperature}°C</div>
            <div className="stat-label-temp">ต่ำสุด</div>
          </div>
        </div>

        {/* สถานะอุณหภูมิ */}
        <div className="status-section-temp">
          <h3 className="status-title-temp">📊 สรุปสถานะ</h3>
          <div className="status-grid-temp">
            <div className="status-item-temp normal">
              <div className="status-count-temp">{statusCounts.normal || 0}</div>
              <div className="status-text-temp">ปกติ</div>
            </div>
            <div className="status-item-temp low">
              <div className="status-count-temp">{statusCounts.low || 0}</div>
              <div className="status-text-temp">ต่ำ</div>
            </div>
            <div className="status-item-temp high">
              <div className="status-count-temp">{statusCounts.high || 0}</div>
              <div className="status-text-temp">สูง</div>
            </div>
            <div className="status-item-temp fever">
              <div className="status-count-temp">{statusCounts.fever || 0}</div>
              <div className="status-text-temp">มีไข้</div>
            </div>
          </div>
        </div>
      </div>

      {/* กราฟหลัก */}
      <div className="chart-container-temp main-chart-temp">
        <h3 className="chart-title-temp">📈 แนวโน้มอุณหภูมิตลอดวัน</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            {/* เส้นช่วงปกติ */}
            <ReferenceLine y={36.1} stroke="#3b82f6" strokeDasharray="5 5" label="ต่ำ" />
            <ReferenceLine y={37.2} stroke="#f59e0b" strokeDasharray="5 5" label="สูง" />
            <ReferenceLine y={37.5} stroke="#ef4444" strokeDasharray="5 5" label="มีไข้" />
            
            <XAxis 
              dataKey="time" 
              stroke="#666"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fontSize: 12 }}
              domain={[35.5, 38.5]}
              label={{ value: 'อุณหภูมิ (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill={getStatusColor(payload.temperature)}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* กราฟช่วงปกติ */}
      <div className="chart-container-temp range-chart-temp">
        <h3 className="chart-title-temp">📊 ช่วงอุณหภูมิปกติ</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={normalRange} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis 
              stroke="#666" 
              tick={{ fontSize: 12 }}
              domain={[35.8, 37.5]}
              label={{ value: 'อุณหภูมิ (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Area
              type="monotone"
              dataKey="normal_max"
              stackId="1"
              stroke="#10b981"
              fill="#dcfce7"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="normal_min"
              stackId="1"
              stroke="#10b981"
              fill="white"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="range-info-temp">
          <span className="range-text-temp">🟢 ช่วงปกติ: 36.1°C - 37.2°C</span>
        </div>
      </div>

      {/* คำแนะนำ */}
      <div className="info-section-temp">
        <p className="info-title-temp">🌡️ <strong>ข้อมูลอุณหภูมิร่างกาย:</strong></p>
        <ul className="info-list-temp">
          <li>• อุณหภูมิปกติ: 36.1°C - 37.2°C</li>
          <li>• อุณหภูมิต่ำ: น้อยกว่า 36.1°C</li>
          <li>• มีไข้: 37.5°C ขึ้นไป</li>
          <li>• อุณหภูมิร่างกายจะต่ำสุดในตอนเช้า สูงสุดในตอนบ่าย</li>
          <li>• หากมีไข้สูงหรือต่ำผิดปกติ ควรพบแพทย์</li>
          <li>• วัดอุณหภูมิด้วยเครื่องมือที่ถูกต้องและสะอาด</li>
        </ul>
      </div>
    </div>
  );
};

export default Graph1;