import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import './sleep.css';
import { getDailySleep } from '../../../services/https/DataHealth/healthData'; // ตัวอย่าง service function

interface SleepData {
  time: string;
  sleepStage: 'awake' | 'light' | 'deep' | 'rem';
  stageValue: number;
  hour: number;
  heartRate?: number;
  movement?: number;
}

interface SleepSummary {
  totalSleep: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awakeTime: number;
  sleepEfficiency: number;
  fallAsleepTime: number;
}

interface SleepStageDistribution {
  name: string;
  value: number;
  duration: number;
  color: string;
  percentage: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: SleepData;
    [key: string]: any;
  }>;
  label?: string;
}

const DairySleep: React.FC = () => {
  const [data, setData] = useState<SleepData[]>([]);
  const [loading, setLoading] = useState(true);
  const UserID = Number(localStorage.getItem("id"));

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        const res = await getDailySleep(UserID);
        const mappedData: SleepData[] = res.data.map((d: any) => {
          const [hourStr, minStr] = d.time.split(':').map(Number);
          const hour = hourStr + minStr / 60;
          return {
            ...d,
            hour
          };
        });
        setData(mappedData);
      } catch (err) {
        console.error('Error fetching sleep data:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSleepData();
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (data.length === 0) return <div>ไม่พบข้อมูลการนอนหลับของวันนี้</div>;

  // คำนวณสรุปการนอน
  const calculateSleepSummary = (): SleepSummary => {
    const stageCounts = data.reduce((acc, item) => {
      acc[item.sleepStage] = (acc[item.sleepStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDataPoints = data.length;
    const minutesPerPoint = 15;

    const deepSleep = (stageCounts.deep || 0) * minutesPerPoint;
    const lightSleep = (stageCounts.light || 0) * minutesPerPoint;
    const remSleep = (stageCounts.rem || 0) * minutesPerPoint;
    const awakeTime = (stageCounts.awake || 0) * minutesPerPoint;
    const totalSleep = deepSleep + lightSleep + remSleep;

    return {
      totalSleep,
      deepSleep,
      lightSleep,
      remSleep,
      awakeTime,
      sleepEfficiency: totalSleep > 0 ? (totalSleep / (totalSleep + awakeTime)) * 100 : 0,
      fallAsleepTime: 15 // สมมติ
    };
  };

  const sleepSummary = calculateSleepSummary();

  // Pie chart
  const sleepStageDistribution: SleepStageDistribution[] = [
    { 
      name: 'การนอนหลับลึก', 
      value: sleepSummary.deepSleep, 
      duration: sleepSummary.deepSleep,
      color: '#1e40af',
      percentage: (sleepSummary.deepSleep / sleepSummary.totalSleep) * 100
    },
    { 
      name: 'การนอนหลับเบา', 
      value: sleepSummary.lightSleep, 
      duration: sleepSummary.lightSleep,
      color: '#3b82f6',
      percentage: (sleepSummary.lightSleep / sleepSummary.totalSleep) * 100
    },
    { 
      name: 'REM Sleep', 
      value: sleepSummary.remSleep, 
      duration: sleepSummary.remSleep,
      color: '#8b5cf6',
      percentage: (sleepSummary.remSleep / sleepSummary.totalSleep) * 100
    },
    { 
      name: 'ตื่น', 
      value: sleepSummary.awakeTime, 
      duration: sleepSummary.awakeTime,
      color: '#ef4444',
      percentage: (sleepSummary.awakeTime / (sleepSummary.totalSleep + sleepSummary.awakeTime)) * 100
    }
  ].filter(item => item.duration > 0);

  // RadialBar Sleep Efficiency
  const efficiencyData = [
    {
      name: 'Sleep Efficiency',
      value: sleepSummary.sleepEfficiency,
      fill: sleepSummary.sleepEfficiency >= 85 ? '#10b981' : 
            sleepSummary.sleepEfficiency >= 70 ? '#f59e0b' : '#ef4444'
    }
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ช ${mins}น`;
  };

  // ฟังก์ชันช่วยเหลือ
  const getSleepStageColor = (stage: string) => {
    switch (stage) {
      case 'deep': return '#1e40af';
      case 'light': return '#3b82f6';
      case 'rem': return '#8b5cf6';
      case 'awake': return '#ef4444';
      default: return '#6b7280';
    }
  };
  const getSleepStageText = (stage: string) => {
    switch (stage) {
      case 'deep': return '😴 นอนลึก';
      case 'light': return '💤 นอนเบา';
      case 'rem': return '🌙 REM';
      case 'awake': return '👁️ ตื่น';
      default: return 'ไม่ทราบ';
    }
  };
  const getSleepQuality = (efficiency: number) => {
    if (efficiency >= 85) return { text: 'ดีเยี่ยม', emoji: '🌟', color: '#10b981' };
    if (efficiency >= 70) return { text: 'ดี', emoji: '😊', color: '#f59e0b' };
    if (efficiency >= 50) return { text: 'พอใช้', emoji: '😐', color: '#f97316' };
    return { text: 'ต้องปรับปรุง', emoji: '😔', color: '#ef4444' };
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      return (
        <div className="sleep-tooltip">
          <p className="tooltip-time-sleep">{label}</p>
          <div className="tooltip-stage-sleep">
            <span className="stage-indicator-sleep" style={{ backgroundColor: getSleepStageColor(data.sleepStage) }}></span>
            {getSleepStageText(data.sleepStage)}
          </div>
          {data.heartRate && <p>💓 {data.heartRate} bpm</p>}
          {data.movement !== undefined && <p>🏃 {data.movement}</p>}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const quality = getSleepQuality(sleepSummary.sleepEfficiency);

  return (
    <div className="sleep-container">
      <div className="header-section-sleep">
        <h2 className="title-sleep">การนอนหลับ</h2>
        
        {/* สถิติสรุปการนอน */}
        <div className="sleep-stats-grid">
          <div className="sleep-stat-card total">
            <div className="stat-icon-sleep">🛏️</div>
            <div className="stat-value-sleep">{formatDuration(sleepSummary.totalSleep)}</div>
            <div className="stat-label-sleep">เวลานอนรวม</div>
          </div>
          <div className="sleep-stat-card deep">
            <div className="stat-icon-sleep">😴</div>
            <div className="stat-value-sleep">{formatDuration(sleepSummary.deepSleep)}</div>
            <div className="stat-label-sleep">นอนลึก</div>
          </div>
          <div className="sleep-stat-card rem">
            <div className="stat-icon-sleep">🌙</div>
            <div className="stat-value-sleep">{formatDuration(sleepSummary.remSleep)}</div>
            <div className="stat-label-sleep">REM Sleep</div>
          </div>
          <div className="sleep-stat-card efficiency">
            <div className="stat-icon-sleep">{quality.emoji}</div>
            <div className="stat-value-sleep">{sleepSummary.sleepEfficiency.toFixed(1)}%</div>
            <div className="stat-label-sleep">ประสิทธิภาพ</div>
          </div>
        </div>

        {/* Sleep Quality Indicator */}
        <div className="sleep-quality-section">
          <h3 className="quality-title-sleep">📊 คุณภาพการนอน</h3>
          <div className="quality-container-sleep">
            <div className="radial-chart-sleep">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  data={efficiencyData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={quality.color}
                  />
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="radial-text-sleep"
                  >
                    <tspan x="50%" dy="-10" fontSize="28" fontWeight="bold" fill={quality.color}>
                      {sleepSummary.sleepEfficiency.toFixed(1)}%
                    </tspan>
                    <tspan x="50%" dy="25" fontSize="14" fill="#64748b">
                      ประสิทธิภาพ
                    </tspan>
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="quality-indicator-sleep" style={{ backgroundColor: quality.color }}>
              {quality.emoji} {quality.text}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="sleep-charts-section">
        {/* Sleep Stages Chart */}
        <div className="chart-container-sleep sleep-stages-chart">
          <h3 className="chart-title-sleep">📈 ระยะการนอนตลอดคืน</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
                domain={[0.5, 4.5]}
                tickFormatter={(value) => {
                  switch (value) {
                    case 1: return 'นอนลึก';
                    case 2: return 'REM';
                    case 3: return 'นอนเบา';
                    case 4: return 'ตื่น';
                    default: return '';
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="stageValue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#sleepGradient)"
              />
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e40af" stopOpacity={0.8}/>
                  <stop offset="25%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Heart Rate Chart */}
        <div className="chart-container-sleep heart-rate-chart-sleep">
          <h3 className="chart-title-sleep">💓 อัตราการเต้นหัวใจขณะนอน</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
                domain={[45, 95]}
                label={{ value: 'BPM', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="bottom-charts-section-sleep">
        {/* Sleep Distribution Pie Chart */}
        <div className="chart-container-sleep pie-chart-sleep">
          <h3 className="chart-title-sleep">🥧 การกระจายระยะการนอน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sleepStageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sleepStageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${formatDuration(value)} (${props.payload.percentage.toFixed(1)}%)`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="pie-legend-sleep">
            {sleepStageDistribution.map((item, index) => (
              <div key={index} className="legend-item-sleep">
                <div 
                  className="legend-color-sleep" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="legend-text-sleep">
                  {item.name}: {formatDuration(item.duration)} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Score Summary */}
        <div className="sleep-score-container">
          <h3 className="chart-title-sleep">⭐ คะแนนการนอน</h3>
          <div className="score-grid-sleep">
            <div className="score-item-sleep">
              <div className="score-label-sleep">ระยะเวลา</div>
              <div className="score-value-sleep" style={{ color: sleepSummary.totalSleep >= 420 ? '#10b981' : '#f59e0b' }}>
                {sleepSummary.totalSleep >= 420 ? '🟢' : '🟡'} 
                {sleepSummary.totalSleep >= 420 ? '85' : '70'}/100
              </div>
            </div>
            <div className="score-item-sleep">
              <div className="score-label-sleep">การนอนลึก</div>
              <div className="score-value-sleep" style={{ color: sleepSummary.deepSleep >= 90 ? '#10b981' : '#f59e0b' }}>
                {sleepSummary.deepSleep >= 90 ? '🟢' : '🟡'} 
                {sleepSummary.deepSleep >= 90 ? '90' : '75'}/100
              </div>
            </div>
            <div className="score-item-sleep">
              <div className="score-label-sleep">ประสิทธิภาพ</div>
              <div className="score-value-sleep" style={{ color: quality.color }}>
                {quality.emoji} {sleepSummary.sleepEfficiency.toFixed(0)}/100
              </div>
            </div>
            <div className="score-item-sleep">
              <div className="score-label-sleep">ความสม่ำเสมอ</div>
              <div className="score-value-sleep" style={{ color: '#10b981' }}>
                🟢 88/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Tips */}
      <div className="sleep-tips-section">
        <h3 className="tips-title-sleep">💡 คำแนะนำสำหรับการนอนที่ดี</h3>
        <div className="tips-grid-sleep">
          <div className="tip-card-sleep">
            <div className="tip-icon-sleep">⏰</div>
            <div className="tip-content-sleep">
              <h4>เวลานอนสม่ำเสมอ</h4>
              <p>เข้านอนและตื่นนอนเวลาเดิมทุกวัน</p>
            </div>
          </div>
          <div className="tip-card-sleep">
            <div className="tip-icon-sleep">🌡️</div>
            <div className="tip-content-sleep">
              <h4>อุณหภูมิที่เหมาะสม</h4>
              <p>ห้องนอนเย็น 18-22°C</p>
            </div>
          </div>
          <div className="tip-card-sleep">
            <div className="tip-icon-sleep">📱</div>
            <div className="tip-content-sleep">
              <h4>หลีกเลี่ยงแสงสีน้ำเงิน</h4>
              <p>ไม่ใช้มือถือก่อนนอน 1 ชั่วโมง</p>
            </div>
          </div>
          <div className="tip-card-sleep">
            <div className="tip-icon-sleep">🏃</div>
            <div className="tip-content-sleep">
              <h4>ออกกำลังกายสม่ำเสมอ</h4>
              <p>แต่ไม่ใช่ก่อนเข้านอน 3 ชั่วโมง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DairySleep;