import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './calorie.css';

interface CalorieData {
  time: string;
  calories: number;
  meal: string;
  hour: number;
}

interface MacroData {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: CalorieData;
    [key: string]: any;
  }>;
  label?: string;
}

const Graph3: React.FC = () => {
  // สร้างข้อมูล Calorie ตัวอย่างสำหรับทั้งวัน
  const generateCalorieData = (): CalorieData[] => {
    const data: CalorieData[] = [];
    const meals = [
      { time: '07:00', calories: 450, meal: 'อาหารเช้า' },
      { time: '10:00', calories: 120, meal: 'ขนมว่าง' },
      { time: '12:30', calories: 680, meal: 'อาหารกลางวัน' },
      { time: '15:00', calories: 150, meal: 'ขนมบ่าย' },
      { time: '18:30', calories: 720, meal: 'อาหารเย็น' },
      { time: '20:30', calories: 80, meal: 'ของหวาน' },
    ];

    meals.forEach((meal, index) => {
      const [hour, minute] = meal.time.split(':').map(Number);
      data.push({
        time: meal.time,
        calories: meal.calories + Math.round((Math.random() - 0.5) * 100),
        meal: meal.meal,
        hour: hour
      });
    });

    return data;
  };

  // ข้อมูล Macronutrients
  const macroData: MacroData[] = [
    { name: 'คาร์โบไหเดรต', value: 45, color: '#3b82f6' },
    { name: 'โปรตีน', value: 25, color: '#ef4444' },
    { name: 'ไขมัน', value: 30, color: '#f59e0b' },
  ];

  const data = generateCalorieData();
  
  // คำนวณค่าต่างๆ
  const totalCalories = data.reduce((sum, item) => sum + item.calories, 0);
  const avgCaloriesPerMeal = Math.round(totalCalories / data.length);
  const targetCalories = 2000; // เป้าหมายแคลอรี่ต่อวัน
  const remainingCalories = targetCalories - totalCalories;

  const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip-cal">
          <p className="tooltip-time-cal">{`${data.meal} (${label})`}</p>
          <p className="tooltip-calories">
            {`แคลอรี่: ${payload[0].value} kcal`}
          </p>
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
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="calorie-container">
      <div className="header-section-cal">
        <h2 className="title-cal">
          🔥 Calorie Intake วันนี้ ({new Date().toLocaleDateString('th-TH')})
        </h2>
        
        {/* สถิติสรุป */}
        <div className="stats-grid-cal">
          <div className="stat-card-cal">
            <div className="stat-value total-cal">{totalCalories}</div>
            <div className="stat-label-cal">รวมทั้งหมด (kcal)</div>
          </div>
          <div className="stat-card-cal">
            <div className="stat-value-cal avg">{avgCaloriesPerMeal}</div>
            <div className="stat-label-cal">เฉลี่ยต่อมื้อ (kcal)</div>
          </div>
          <div className="stat-card-cal">
            <div className={`stat-value-cal ${remainingCalories >= 0 ? 'positive' : 'negative'}`}>
              {remainingCalories >= 0 ? remainingCalories : Math.abs(remainingCalories)}
            </div>
            <div className="stat-label-cal">
              {remainingCalories >= 0 ? 'เหลือได้อีก (kcal)' : 'เกินเป้าหมาย (kcal)'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section-cal">
          <div className="progress-header-cal">
            <span className="progress-label-cal">ความคืบหน้าของเป้าหมาย</span>
            <span className="progress-percentage-cal">
              {Math.round((totalCalories / targetCalories) * 100)}%
            </span>
          </div>
          <div className="progress-bar-cal">
            <div 
              className="progress-fill-cal"
              style={{ 
                width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%`,
                backgroundColor: totalCalories > targetCalories ? '#ef4444' : '#10b981'
              }}
            ></div>
          </div>
          <div className="progress-info-cal">
            <span>{totalCalories} kcal</span>
            <span>เป้าหมาย: {targetCalories} kcal</span>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="charts-section-cal">
        {/* Bar Chart */}
        <div className="chart-container-cal bar-chart-cal">
          <h3 className="chart-title-cal">📊 แคลอรี่ตามมื้ออาหาร</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
                label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="calories" 
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-container-cal pie-chart-cal">
          <h3 className="chart-title-cal">🥗 สัดส่วน Macronutrients</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'สัดส่วน']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="pie-legend-cal">
            {macroData.map((item, index) => (
              <div key={index} className="legend-item-cal">
                <div 
                  className="legend-color-cal" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="legend-text-cal">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* คำแนะนำ */}
      <div className="info-section-cal">
        <p className="info-title-cal">💡 <strong>คำแนะนำด้านโภชนาการ:</strong></p>
        <ul className="info-list-cal">
          <li>• ผู้หญิงควรได้รับ 1,800-2,000 แคลอรี่ต่อวัน</li>
          <li>• ผู้ชายควรได้รับ 2,200-2,500 แคลอรี่ต่อวัน</li>
          <li>• คาร์โบไหเดรต 45-65%, โปรตีน 20-35%, ไขมัน 20-35%</li>
          <li>• ควรกินผักผลไม้อย่างน้อย 5 ส่วนต่อวัน</li>
          <li>• ดื่มน้ำ 8-10 แก้วต่อวัน</li>
        </ul>
      </div>
    </div>
  );
};

export default Graph3;