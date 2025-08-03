import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import './spo2.css';

interface SpO2Data {
  time: string;
  spo2: number;
  hour: number;
  status: 'normal' | 'low' | 'critical' | 'severe';
  activity: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: SpO2Data;
    [key: string]: any;
  }>;
  label?: string;
}

interface StatusDistribution {
  name: string;
  value: number;
  count: number;
  color: string;
}

const Graph4: React.FC = () => {
  // สร้างข้อมูล SpO2 ตัวอย่างสำหรับทั้งวัน
  const generateSpO2Data = (): SpO2Data[] => {
    const data: SpO2Data[] = [];
    
    const activities = [
      { time: '06:00', activity: 'ตื่นนอน', baseLevel: 97 },
      { time: '07:00', activity: 'อาบน้ำ', baseLevel: 96 },
      { time: '08:00', activity: 'ทานข้าว', baseLevel: 98 },
      { time: '09:00', activity: 'เดินทาง', baseLevel: 96 },
      { time: '10:00', activity: 'ทำงาน', baseLevel: 98 },
      { time: '11:00', activity: 'ทำงาน', baseLevel: 97 },
      { time: '12:00', activity: 'พักกลางวัน', baseLevel: 99 },
      { time: '13:00', activity: 'ทานข้าว', baseLevel: 98 },
      { time: '14:00', activity: 'ทำงาน', baseLevel: 97 },
      { time: '15:00', activity: 'ประชุม', baseLevel: 96 },
      { time: '16:00', activity: 'ทำงาน', baseLevel: 98 },
      { time: '17:00', activity: 'ออกกำลัง', baseLevel: 94 },
      { time: '18:00', activity: 'พักผ่อน', baseLevel: 98 },
      { time: '19:00', activity: 'ทานข้าว', baseLevel: 97 },
      { time: '20:00', activity: 'ดูทีวี', baseLevel: 99 },
      { time: '21:00', activity: 'อ่านหนังสือ', baseLevel: 98 },
      { time: '22:00', activity: 'เตรียมนอน', baseLevel: 97 },
      { time: '23:00', activity: 'หลับ', baseLevel: 98 }
    ];

    activities.forEach((activity, index) => {
      const [hour, minute] = activity.time.split(':').map(Number);
      
      // เพิ่มความแปรปรวนเล็กน้อย
      const variation = (Math.random() - 0.5) * 2;
      const spo2 = Math.max(90, Math.min(100, activity.baseLevel + variation));
      const roundedSpO2 = Math.round(spo2);
      
      // กำหนดสถานะ
      let status: 'normal' | 'low' | 'critical' | 'severe';
      if (roundedSpO2 >= 96) {
        status = 'normal';
      } else if (roundedSpO2 >= 90) {
        status = 'low';
      } else if (roundedSpO2 >= 85) {
        status = 'critical';
      } else {
        status = 'severe';
      }
      
      data.push({
        time: activity.time,
        spo2: roundedSpO2,
        hour: hour,
        status: status,
        activity: activity.activity
      });
    });
    
    return data;
  };

  const data = generateSpO2Data();
  
  // คำนวณค่าต่างๆ
  const spo2Values = data.map(d => d.spo2);
  const avgSpO2 = Math.round((spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length) * 10) / 10;
  const maxSpO2 = Math.max(...spo2Values);
  const minSpO2 = Math.min(...spo2Values);
  
  // นับสถานะต่างๆ
  const statusCounts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ข้อมูลสำหรับ Pie Chart
  const statusDistribution: StatusDistribution[] = [
    { name: 'ปกติ', value: ((statusCounts.normal || 0) / data.length) * 100, count: statusCounts.normal || 0, color: '#10b981' },
    { name: 'ต่ำ', value: ((statusCounts.low || 0) / data.length) * 100, count: statusCounts.low || 0, color: '#f59e0b' },
    { name: 'วิกฤต', value: ((statusCounts.critical || 0) / data.length) * 100, count: statusCounts.critical || 0, color: '#ef4444' },
    { name: 'อันตราย', value: ((statusCounts.severe || 0) / data.length) * 100, count: statusCounts.severe || 0, color: '#991b1b' }
  ].filter(item => item.count > 0);

  // ข้อมูลสำหรับ Radial Chart (Current Status)
  const currentSpO2 = data[data.length - 1]?.spo2 || 98;
  const radialData = [
    {
      name: 'SpO2',
      value: currentSpO2,
      fill: getStatusColor(currentSpO2)
    }
  ];

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip-spo2">
          <p className="tooltip-time-spo2">{`${label} - ${data.activity}`}</p>
          <p className="tooltip-spo2">
            {`SpO2: ${payload[0].value}%`}
          </p>
          <p className={`tooltip-status-spo2 ${data.status}`}>
            {getStatusText(data.status)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'normal': return '🟢 ปกติ';
      case 'low': return '🟡 ต่ำ';
      case 'critical': return '🔴 วิกฤต';
      case 'severe': return '🆘 อันตราย';
      default: return 'ไม่ทราบ';
    }
  };

  function getStatusColor(spo2: number): string {
    if (spo2 >= 96) return '#10b981';
    if (spo2 >= 90) return '#f59e0b';
    if (spo2 >= 85) return '#ef4444';
    return '#991b1b';
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // ไม่แสดง label ถ้าน้อยกว่า 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="spo2-container">
      <div className="header-section-spo2">
        <h2 className="title-spo2">
          🫁 SpO2 (ออกซิเจนในเลือด) วันนี้ ({new Date().toLocaleDateString('th-TH')})
        </h2>
        
        {/* สถิติสรุป */}
        <div className="stats-grid-spo2">
          <div className="stat-card-spo2">
            <div className="stat-value-spo2 current">{currentSpO2}%</div>
            <div className="stat-label-spo2">ปัจจุบัน</div>
          </div>
          <div className="stat-card-spo2">
            <div className="stat-value-spo2 avg">{avgSpO2}%</div>
            <div className="stat-label-spo2">ค่าเฉลี่ย</div>
          </div>
          <div className="stat-card-spo2">
            <div className="stat-value-spo2 max">{maxSpO2}%</div>
            <div className="stat-label-spo2">สูงสุด</div>
          </div>
          <div className="stat-card-spo2">
            <div className="stat-value-spo2 min">{minSpO2}%</div>
            <div className="stat-label-spo2">ต่ำสุด</div>
          </div>
        </div>

        {/* Current Status Radial */}
        <div className="current-status-spo2">
          <h3 className="status-title-spo2">📊 สถานะปัจจุบัน</h3>
          <div className="radial-container-spo2">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="90%" 
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={getStatusColor(currentSpO2)}
                />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="radial-text-spo2"
                >
                  <tspan x="50%" dy="-10" fontSize="32" fontWeight="bold" fill={getStatusColor(currentSpO2)}>
                    {currentSpO2}%
                  </tspan>
                  <tspan x="50%" dy="25" fontSize="14" fill="#64748b">
                    SpO2
                  </tspan>
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className={`status-indicator-spo2 ${data[data.length - 1]?.status}`}>
              {getStatusText(data[data.length - 1]?.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="charts-section-spo2">
        {/* Line Chart */}
        <div className="chart-container-spo2 line-chart-spo2">
          <h3 className="chart-title-spo2">📈 แนวโน้ม SpO2 ตลอดวัน</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              
              {/* เส้นอ้างอิง */}
              <ReferenceLine y={96} stroke="#10b981" strokeDasharray="5 5" label="ปกติ (≥96%)" />
              <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="5 5" label="ต่ำ (90-95%)" />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label="วิกฤต (<90%)" />
              
              <XAxis 
                dataKey="time" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
                domain={[80, 100]}
                label={{ value: 'SpO2 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="spo2" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={5} 
                      fill={getStatusColor(payload.spo2)}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-container-spo2 pie-chart-spo2">
          <h3 className="chart-title-spo2">🥧 การกระจายสถานะ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}% (${props.payload.count} ครั้ง)`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="pie-legend-spo2">
            {statusDistribution.map((item, index) => (
              <div key={index} className="legend-item-spo2">
                <div 
                  className="legend-color-spo2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="legend-text-spo2">
                  {item.name}: {item.count} ครั้ง ({item.value.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* สถานะแยกตามช่วง */}
      <div className="status-section-spo2">
        <h3 className="status-title-spo2">🚦 สรุปสถานะตามช่วงเวลา</h3>
        <div className="status-grid-spo2">
          <div className="status-item-spo2 normal">
            <div className="status-count-spo2">{statusCounts.normal || 0}</div>
            <div className="status-text-spo2">ปกติ (≥96%)</div>
            <div className="status-desc-spo2">สุขภาพดี</div>
          </div>
          <div className="status-item-spo2 low">
            <div className="status-count-spo2">{statusCounts.low || 0}</div>
            <div className="status-text-spo2">ต่ำ (90-95%)</div>
            <div className="status-desc-spo2">ควรสังเกต</div>
          </div>
          <div className="status-item-spo2 critical">
            <div className="status-count-spo2">{statusCounts.critical || 0}</div>
            <div className="status-text-spo2">วิกฤต (85-89%)</div>
            <div className="status-desc-spo2">ต้องรักษา</div>
          </div>
          <div className="status-item-spo2 severe">
            <div className="status-count-spo2">{statusCounts.severe || 0}</div>
            <div className="status-text-spo2">อันตราย (&lt;85%)</div>
            <div className="status-desc-spo2">ฉุกเฉิน!</div>
          </div>
        </div>
      </div>

      {/* คำแนะนำ */}
      <div className="info-section-spo2">
        <p className="info-title-spo2">🫁 <strong>ข้อมูล SpO2 (ออกซิเจนในเลือด):</strong></p>
        <ul className="info-list-spo2">
          <li>• SpO2 ปกติ: 96-100% (คนสุขภาพดี)</li>
          <li>• SpO2 ต่ำ: 90-95% (ควรพบแพทย์)</li>
          <li>• SpO2 วิกฤต: 85-89% (ต้องรักษาทันที)</li>
          <li>• SpO2 อันตราย: &lt;85% (ฉุกเฉิน! เข้าโรงพยาบาล)</li>
          <li>• วัดด้วย Pulse Oximeter ที่นิ้วมือหรือหูหอย</li>
          <li>• หลีกเลี่ยงการสูบบุหรี่และมลพิษทางอากาศ</li>
          <li>• ออกกำลังกายสม่ำเสมอเพื่อเพิ่มประสิทธิภาพปอด</li>
        </ul>
      </div>
    </div>
  );
};

export default Graph4;