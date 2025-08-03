import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import './steps.css';

interface StepsData {
  time: string;
  steps: number;
  cumulativeSteps: number;
  hour: number;
  activity: string;
  calories: number;
  distance: number;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
}

interface StepsSummary {
  totalSteps: number;
  targetSteps: number;
  completionPercentage: number;
  totalDistance: number;
  totalCalories: number;
  activeMinutes: number;
  averageStepsPerHour: number;
  peakHour: string;
  peakSteps: number;
}

interface HourlyActivity {
  hour: string;
  steps: number;
  activity: string;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: StepsData;
    [key: string]: any;
  }>;
  label?: string;
}

const Graph5: React.FC = () => {
  const TARGET_STEPS = 10000;

  // สร้างข้อมูลการเดินตัวอย่าง
  const generateStepsData = (): StepsData[] => {
    const data: StepsData[] = [];
    let cumulativeSteps = 0;
    
    const activities = [
      { time: '06:00', activity: 'ตื่นนอน', baseSteps: 50, intensity: 'low' as const },
      { time: '07:00', activity: 'เตรียมตัว', baseSteps: 300, intensity: 'moderate' as const },
      { time: '08:00', activity: 'เดินทางไปทำงาน', baseSteps: 800, intensity: 'high' as const },
      { time: '09:00', activity: 'ทำงาน', baseSteps: 150, intensity: 'low' as const },
      { time: '10:00', activity: 'ทำงาน', baseSteps: 200, intensity: 'low' as const },
      { time: '11:00', activity: 'เดินไปประชุม', baseSteps: 400, intensity: 'moderate' as const },
      { time: '12:00', activity: 'เดินไปทานข้าว', baseSteps: 600, intensity: 'high' as const },
      { time: '13:00', activity: 'ทานข้าวกลางวัน', baseSteps: 100, intensity: 'low' as const },
      { time: '14:00', activity: 'กลับที่ทำงาน', baseSteps: 500, intensity: 'moderate' as const },
      { time: '15:00', activity: 'ทำงาน', baseSteps: 180, intensity: 'low' as const },
      { time: '16:00', activity: 'เดินไปซื้อกาแฟ', baseSteps: 350, intensity: 'moderate' as const },
      { time: '17:00', activity: 'ทำงาน', baseSteps: 120, intensity: 'low' as const },
      { time: '18:00', activity: 'เดินทางกลับบ้าน', baseSteps: 900, intensity: 'very_high' as const },
      { time: '19:00', activity: 'ออกกำลังกาย', baseSteps: 1200, intensity: 'very_high' as const },
      { time: '20:00', activity: 'อาบน้ำ เตรียมข้าว', baseSteps: 400, intensity: 'moderate' as const },
      { time: '21:00', activity: 'ทานข้าวเย็น', baseSteps: 200, intensity: 'low' as const },
      { time: '22:00', activity: 'พักผ่อน', baseSteps: 150, intensity: 'low' as const },
      { time: '23:00', activity: 'เตรียมนอน', baseSteps: 100, intensity: 'low' as const }
    ];

    activities.forEach((activity, index) => {
      const [hour, minute] = activity.time.split(':').map(Number);
      
      // เพิ่มความแปรปรวน
      const variation = (Math.random() - 0.5) * 200;
      const steps = Math.max(0, Math.round(activity.baseSteps + variation));
      cumulativeSteps += steps;
      
      // คำนวณแคลอรี่และระยะทาง
      const calories = Math.round(steps * 0.04); // ประมาณ 0.04 แคลอรี่ต่อก้าว
      const distance = Math.round((steps * 0.0008) * 100) / 100; // ประมาณ 0.8 เมตรต่อก้าว แปลงเป็น กิโลเมตร
      
      data.push({
        time: activity.time,
        steps: steps,
        cumulativeSteps: cumulativeSteps,
        hour: hour,
        activity: activity.activity,
        calories: calories,
        distance: distance,
        intensity: activity.intensity
      });
    });
    
    return data;
  };

  const data = generateStepsData();
  
  // คำนวณสถิติ
  const calculateStepsSummary = (): StepsSummary => {
    const totalSteps = data[data.length - 1]?.cumulativeSteps || 0;
    const totalDistance = data.reduce((sum, item) => sum + item.distance, 0);
    const totalCalories = data.reduce((sum, item) => sum + item.calories, 0);
    
    // หาช่วงเวลาที่เดินมากที่สุด
    const peakData = data.reduce((max, item) => item.steps > max.steps ? item : max, data[0]);
    
    // นับจำนวนชั่วโมงที่มีกิจกรรม (> 100 ก้าว)
    const activeHours = data.filter(item => item.steps > 100).length;
    
    return {
      totalSteps,
      targetSteps: TARGET_STEPS,
      completionPercentage: (totalSteps / TARGET_STEPS) * 100,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalCalories,
      activeMinutes: activeHours * 60,
      averageStepsPerHour: Math.round(totalSteps / data.length),
      peakHour: peakData.time,
      peakSteps: peakData.steps
    };
  };

  const stepsSummary = calculateStepsSummary();
  
  // ข้อมูลสำหรับ Intensity Distribution
  const intensityData = data.reduce((acc, item) => {
    acc[item.intensity] = (acc[item.intensity] || 0) + item.steps;
    return acc;
  }, {} as Record<string, number>);

  const intensityDistribution = [
    { name: 'ผ่อนคลาย', value: intensityData.low || 0, color: '#10b981', percentage: 0 },
    { name: 'ปานกลาง', value: intensityData.moderate || 0, color: '#f59e0b', percentage: 0 },
    { name: 'หนัก', value: intensityData.high || 0, color: '#ef4444', percentage: 0 },
    { name: 'หนักมาก', value: intensityData.very_high || 0, color: '#dc2626', percentage: 0 }
  ].map(item => ({
    ...item,
    percentage: (item.value / stepsSummary.totalSteps) * 100
  })).filter(item => item.value > 0);

  // ข้อมูลสำหรับ Progress Radial Chart
  const progressData = [
    {
      name: 'Progress',
      value: Math.min(stepsSummary.completionPercentage, 100),
      fill: stepsSummary.completionPercentage >= 100 ? '#10b981' : 
            stepsSummary.completionPercentage >= 70 ? '#f59e0b' : '#ef4444'
    }
  ];

  // ข้อมูลสำหรับ Hourly Bar Chart
  const hourlyData = data.map(item => ({
    hour: item.time,
    steps: item.steps,
    activity: item.activity,
    intensity: item.intensity
  }));

  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'very_high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getIntensityText = (intensity: string): string => {
    switch (intensity) {
      case 'low': return '🟢 ผ่อนคลาย';
      case 'moderate': return '🟡 ปานกลาง';
      case 'high': return '🟠 หนัก';
      case 'very_high': return '🔴 หนักมาก';
      default: return 'ไม่ทราบ';
    }
  };

  const getProgressStatus = (percentage: number): { text: string; emoji: string; color: string } => {
    if (percentage >= 100) return { text: 'เป้าหมายสำเร็จ!', emoji: '🎉', color: '#10b981' };
    if (percentage >= 80) return { text: 'ใกล้เป้าหมายแล้ว', emoji: '💪', color: '#f59e0b' };
    if (percentage >= 50) return { text: 'กำลังดี', emoji: '👍', color: '#3b82f6' };
    return { text: 'ต้องเดินเพิ่ม', emoji: '🚶‍♂️', color: '#ef4444' };
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('th-TH');
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      return (
        <div className="steps-tooltip">
          <p className="tooltip-time-step">{`${label} - ${data.activity}`}</p>
          <div className="tooltip-steps">
            <span>👣 จำนวนก้าว: {formatNumber(payload[0].value)}</span>
          </div>
          <div className="tooltip-intensity-step">
            <span className="intensity-indicator-step" style={{ backgroundColor: getIntensityColor(data.intensity) }}></span>
            {getIntensityText(data.intensity)}
          </div>
          <p className="tooltip-calories-step">🔥 แคลอรี่: {data.calories} cal</p>
          <p className="tooltip-distance-step">📏 ระยะทาง: {data.distance} km</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

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

  const progress = getProgressStatus(stepsSummary.completionPercentage);

  return (
    <div className="steps-container">
      <div className="header-section-step">
        <h2 className="title-step">
          👣 การติดตามจำนวนก้าวเดิน วันนี้ ({new Date().toLocaleDateString('th-TH')})
        </h2>
        
        {/* สถิติสรุป */}
        <div className="steps-stats-grid">
          <div className="steps-stat-card total">
            <div className="stat-icon-step">👣</div>
            <div className="stat-value-step">{formatNumber(stepsSummary.totalSteps)}</div>
            <div className="stat-label-step">ก้าวทั้งหมด</div>
          </div>
          <div className="steps-stat-card distance">
            <div className="stat-icon-step">📏</div>
            <div className="stat-value-step">{stepsSummary.totalDistance} km</div>
            <div className="stat-label-step">ระยะทางรวม</div>
          </div>
          <div className="steps-stat-card calories">
            <div className="stat-icon-step">🔥</div>
            <div className="stat-value-step">{formatNumber(stepsSummary.totalCalories)}</div>
            <div className="stat-label-step">แคลอรี่เผาผลาญ</div>
          </div>
          <div className="steps-stat-card active">
            <div className="stat-icon-step">⏱️</div>
            <div className="stat-value-step">{stepsSummary.activeMinutes}</div>
            <div className="stat-label-step">นาทีที่ใช้งาน</div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section-step">
          <h3 className="progress-title-step">📊 ความคืบหน้าเป้าหมาย</h3>
          <div className="progress-container-step">
            <div className="radial-progress-step">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  data={progressData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={progress.color}
                  />
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="radial-text"
                  >
                    <tspan x="50%" dy="-10" fontSize="28" fontWeight="bold" fill={progress.color}>
                      {stepsSummary.completionPercentage.toFixed(1)}%
                    </tspan>
                    <tspan x="50%" dy="25" fontSize="14" fill="#64748b">
                      เป้าหมาย
                    </tspan>
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="progress-info-step">
              <div className="progress-status-step" style={{ backgroundColor: progress.color }}>
                {progress.emoji} {progress.text}
              </div>
              <div className="progress-details-step">
                <p>🎯 เป้าหมาย: {formatNumber(TARGET_STEPS)} ก้าว</p>
                <p>📈 เหลืออีก: {formatNumber(Math.max(0, TARGET_STEPS - stepsSummary.totalSteps))} ก้าว</p>
                <p>⭐ ช่วงที่เดินมากที่สุด: {stepsSummary.peakHour} ({formatNumber(stepsSummary.peakSteps)} ก้าว)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="steps-charts-section">
        {/* Cumulative Steps Chart */}
        <div className="chart-container-step cumulative-chart-step">
          <h3 className="chart-title-step">📈 ก้าวสะสมตลอดวัน</h3>
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
                label={{ value: 'ก้าวสะสม', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeSteps"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#stepsGradient)"
              />
              <defs>
                <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Steps Bar Chart */}
        <div className="chart-container-step hourly-chart-step">
          <h3 className="chart-title-step">📊 ก้าวรายชั่วโมง</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="hour" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
                label={{ value: 'จำนวนก้าว', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Bar 
                dataKey="steps" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="bottom-charts-section-step">
        {/* Intensity Distribution */}
        <div className="chart-container-step pie-chart-step">
          <h3 className="chart-title-step">🥧 การกระจายความหนักของกิจกรรม</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={intensityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {intensityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${formatNumber(value)} ก้าว (${props.payload.percentage.toFixed(1)}%)`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="pie-legend-step">
            {intensityDistribution.map((item, index) => (
              <div key={index} className="legend-item-step">
                <div 
                  className="legend-color-step" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="legend-text-step">
                  {item.name}: {formatNumber(item.value)} ก้าว ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Achievements */}
        <div className="achievements-container-step">
          <h3 className="chart-title-step">🏆 ความสำเร็จวันนี้</h3>
          <div className="achievements-grid-step">
            <div className={`achievement-item-step ${stepsSummary.totalSteps >= 10000 ? 'completed' : 'pending'}`}>
              <div className="achievement-icon-step">🎯</div>
              <div className="achievement-content-step">
                <h4>เป้าหมายหลัก</h4>
                <p>เดิน 10,000 ก้าว</p>
                <div className="achievement-status-step">
                  {stepsSummary.totalSteps >= 10000 ? '✅ สำเร็จ' : '⏳ ยังไม่สำเร็จ'}
                </div>
              </div>
            </div>

            <div className={`achievement-item-step ${stepsSummary.totalDistance >= 5 ? 'completed' : 'pending'}`}>
              <div className="achievement-icon-step">🚶</div>
              <div className="achievement-content-step">
                <h4>นักเดินทาง</h4>
                <p>เดินระยะทาง 5 km</p>
                <div className="achievement-status-step">
                  {stepsSummary.totalDistance >= 5 ? '✅ สำเร็จ' : '⏳ ยังไม่สำเร็จ'}
                </div>
              </div>
            </div>

            <div className={`achievement-item-step ${stepsSummary.totalCalories >= 300 ? 'completed' : 'pending'}`}>
              <div className="achievement-icon-step">🔥</div>
              <div className="achievement-content-step">
                <h4>เผาผลาญแคลอรี่</h4>
                <p>เผาผลาญ 300 แคลอรี่</p>
                <div className="achievement-status-step">
                  {stepsSummary.totalCalories >= 300 ? '✅ สำเร็จ' : '⏳ ยังไม่สำเร็จ'}
                </div>
              </div>
            </div>

            <div className={`achievement-item-step ${stepsSummary.activeMinutes >= 480 ? 'completed' : 'pending'}`}>
              <div className="achievement-icon-step">⏰</div>
              <div className="achievement-content-step">
                <h4>นักกิจกรรม</h4>
                <p>ใช้งาน 8 ชั่วโมง</p>
                <div className="achievement-status-step">
                  {stepsSummary.activeMinutes >= 480 ? '✅ สำเร็จ' : '⏳ ยังไม่สำเร็จ'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="health-tips-section-step">
        <h3 className="tips-title-step">💡 เทคนิคการเดินเพื่อสุขภาพ</h3>
        <div className="tips-grid-step">
          <div className="tip-card-step">
            <div className="tip-icon-step">👟</div>
            <div className="tip-content-step">
              <h4>เลือกรองเท้าที่เหมาะสม</h4>
              <p>ใส่รองเท้าที่รองรับเท้าดี มีการรองรับส้นเท้า</p>
            </div>
          </div>
          <div className="tip-card-step">
            <div className="tip-icon-step">🚶‍♂️</div>
            <div className="tip-content-step">
              <h4>เดินให้ถูกท่า</h4>
              <p>เดินตัวตรง แกว่งแขน ก้าวเท้าให้เป็นธรรมชาติ</p>
            </div>
          </div>
          <div className="tip-card-step">
            <div className="tip-icon-step">💧</div>
            <div className="tip-content-step">
              <h4>ดื่มน้ำให้เพียงพอ</h4>
              <p>ดื่มน้ำก่อน ระหว่าง และหลังการเดิน</p>
            </div>
          </div>
          <div className="tip-card-step">
            <div className="tip-icon-step">🎵</div>
            <div className="tip-content-step">
              <h4>ฟังเพลงสร้างแรงจูงใจ</h4>
              <p>เลือกเพลงที่มีจังหวะเร็วเพื่อกระตุ้นการเดิน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph5;