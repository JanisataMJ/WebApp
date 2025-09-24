import React, { useState, useEffect } from "react";
import { GetWeeklySummary } from "../../services/https/DataHealth/healthSummary";
import { GetWeeklyHealthData } from "../../services/https/DataHealth/healthData";
import { HealthSummaryInterface } from "../../interface/health_summary_interface/health_summary";
import { HealthDataInterface } from "../../interface/health_data_interface/health_data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Droplets, Thermometer, Moon, TrendingUp, TrendingDown, ArrowRightLeft, Footprints, Bed, Flame } from 'lucide-react';
import { Radio, Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

import "./Overview.css";
import { Form, Input, Modal, message } from "antd";
import Headers from '../../compronents/Pubblic_components/headerselect';
import Notification from '../../compronents/Home_components/Notifiation/notice';

interface VitalCard {
  label: string;
  value: number | string;
  unit: string;
  status: string;
  color: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "same";
  change?: number;
}

const Overview = () => {
  const [summary, setSummary] = useState<HealthSummaryInterface | null>(null);
  const [prevSummary, setPrevSummary] = useState<HealthSummaryInterface | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalCard[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"weekly" | "last7days" | "lastweek">("weekly");
  const UserID = Number(localStorage.getItem("id"));

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const latestWeek: HealthSummaryInterface = await GetWeeklySummary(UserID, mode);

        let previousWeek: HealthSummaryInterface | null = null;
        if (mode === "weekly" || mode === "last7days") {
          previousWeek = await GetWeeklySummary(UserID, "lastweek");
        } else if (mode === "lastweek") {
          previousWeek = await GetWeeklySummary(UserID, "last2weeks");
        }

        setSummary(latestWeek);
        setPrevSummary(previousWeek);

        if (!latestWeek) {
          setVitalSigns([]);
          return;
        }

        const vitals: VitalCard[] = [
          {
            label: "อัตราการเต้นหัวใจ",
            value: latestWeek.avg_bpm?.toFixed(0) || 0,
            unit: "bpm",
            status: latestWeek.risk_level || "ไม่ระบุ",
            color: "heart-rate",
            icon: Heart,
            trend: previousWeek
              ? Number(latestWeek.avg_bpm) > Number(previousWeek.avg_bpm)
                ? "up"
                : Number(latestWeek.avg_bpm) < Number(previousWeek.avg_bpm)
                  ? "down"
                  : "same"
              : undefined,
            change: previousWeek
              ? ((Number(latestWeek.avg_bpm) - Number(previousWeek.avg_bpm)) / Number(previousWeek.avg_bpm)) * 100
              : undefined,
          },
          {
            label: "พลังงานที่ใช้ไป",
            value: latestWeek.avg_calories?.toFixed(0) || 0,
            unit: "kcal",
            status: latestWeek.risk_level || "ไม่ระบุ",
            color: "calories",
            icon: Thermometer,
            trend: previousWeek
              ? Number(latestWeek.avg_calories) > Number(previousWeek.avg_calories)
                ? "up"
                : Number(latestWeek.avg_calories) < Number(previousWeek.avg_calories)
                  ? "down"
                  : "same"
              : undefined,
            change: previousWeek
              ? ((Number(latestWeek.avg_calories) - Number(previousWeek.avg_calories)) / Number(previousWeek.avg_calories)) * 100
              : undefined,
          },
          {
            label: "จำนวนก้าว",
            value: latestWeek.total_steps?.toFixed(0) || 0,
            unit: "steps",
            status: latestWeek.risk_level || "ไม่ระบุ",
            color: "steps",
            icon: Activity,
            trend: previousWeek
              ? Number(latestWeek.total_steps) > Number(previousWeek.total_steps)
                ? "up"
                : Number(latestWeek.total_steps) < Number(previousWeek.total_steps)
                  ? "down"
                  : "same"
              : undefined,
            change: previousWeek
              ? ((Number(latestWeek.total_steps) - Number(previousWeek.total_steps)) / Number(previousWeek.total_steps)) * 100
              : undefined,
          },
          {
            label: "ออกซิเจนในเลือด",
            value: latestWeek.avg_spo2?.toFixed(0) || 0,
            unit: "%",
            status: latestWeek.risk_level || "ไม่ระบุ",
            color: "blood-oxygen",
            icon: Droplets,
            trend: previousWeek
              ? Number(latestWeek.avg_spo2) > Number(previousWeek.avg_spo2)
                ? "up"
                : Number(latestWeek.avg_spo2) < Number(previousWeek.avg_spo2)
                  ? "down"
                  : "same"
              : undefined,
            change: previousWeek
              ? ((Number(latestWeek.avg_spo2) - Number(previousWeek.avg_spo2)) / Number(previousWeek.avg_spo2)) * 100
              : undefined,
          },
          {
            label: "การนอนหลับ",
            value: latestWeek.avg_sleep?.toFixed(1) || 0,
            unit: "hrs",
            status: latestWeek.risk_level || "ไม่ระบุ",
            color: "sleep",
            icon: Moon,
            trend: previousWeek
              ? Number(latestWeek.avg_sleep) > Number(previousWeek.avg_sleep)
                ? "up"
                : Number(latestWeek.avg_sleep) < Number(previousWeek.avg_sleep)
                  ? "down"
                  : "same"
              : undefined,
            change: previousWeek
              ? ((Number(latestWeek.avg_sleep) - Number(previousWeek.avg_sleep)) / Number(previousWeek.avg_sleep)) * 100
              : undefined,
          },
        ];
        setVitalSigns(vitals);
      } catch (error) {
        console.error("Error fetching weekly vitals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVitals();
  }, [UserID, mode]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetWeeklyHealthData(UserID, mode);

        // จัดกลุ่มตามวัน
        const grouped: Record<string, { steps: number; bpm: number; sleep: number; calories: number; spo2: number; count: number }> = {};

        data.forEach((d: any) => {
          const day = new Date(d.date).toLocaleDateString("th-TH", { weekday: "short" });
          if (!grouped[day]) {
            grouped[day] = { steps: 0, bpm: 0, sleep: 0, calories: 0, spo2: 0, count: 0 };
          }
          grouped[day].steps += d.steps;
          grouped[day].bpm += d.avg_bpm || 0;
          grouped[day].sleep += d.sleep_hours || 0;
          grouped[day].calories += d.calories || 0;
          grouped[day].spo2 += d.avg_spo2 || 0;
          grouped[day].count += 1;
        });

        // ทำค่าเฉลี่ยรายวัน
        const mapped = Object.entries(grouped).map(([day, v]) => ({
          date: day,
          avgSteps: Math.round(v.steps / v.count),   // ✅ เฉลี่ย steps
          avg_bpm: Math.round(v.bpm / v.count),
          sleep_hours: (v.sleep / v.count).toFixed(1),
          calories: Math.round(v.calories / v.count),
          avg_spo2: Math.round(v.spo2 / v.count),
        }));

        setWeeklyData(mapped);
      } catch (error) {
        console.error("Error fetching weekly data:", error);
      }
    };
    fetchData();
  }, [UserID, mode]);



  const chartConfig = [
    { key: "avg_bpm", label: "ค่าเฉลี่ยอัตราการเต้นหัวใจ", color: "#ef4444", fill: "#fee2e2", icon: <Heart className="chart-icon heart-rate" /> },
    { key: "calories", label: "ค่าเฉลี่ยพลังงานที่ใช้ไป", color: "#f97316", fill: "#ffedd5", icon: <Flame className="chart-icon calories" /> },
    { key: "avgSteps", label: "จำนวนก้าวเดินทั้งหมด", color: "#3b82f6", fill: "#dbeafe", icon: <Footprints className="chart-icon steps" /> },
    { key: "avg_spo2", label: "ค่าเฉลี่ยออกซิเจนในเลือด", color: "#10b981", fill: "#d1fae5", icon: <Activity className="chart-icon spo2" /> },
    { key: "sleep_hours", label: "ค่าเฉลี่ยจำนวนการนอน", color: "#8b5cf6", fill: "#ede9fe", icon: <Bed className="chart-icon sleep" /> },
  ];


  if (loading) return <p>Loading...</p>;

  const modeLabel: Record<typeof mode, string> = {
    weekly: "สัปดาห์นี้",
    last7days: "7 วันที่ผ่านมา",
    lastweek: "สัปดาห์ที่แล้ว",
  };

  // ตารางเปรียบเทียบ
  const comparisonData = [
    {
      metric: "ค่าเฉลี่ยอัตราการเต้นหัวใจ",
      thisWeek: summary?.avg_bpm?.toFixed(0),
      lastWeek: prevSummary?.avg_bpm?.toFixed(0),
    },
    {
      metric: "ค่าเฉลี่ยพลังงานที่ใช้ไป",
      thisWeek: summary?.avg_calories?.toFixed(0),
      lastWeek: prevSummary?.avg_calories?.toFixed(0),
    },
    {
      metric: "จำนวนก้าวเดินทั้งหมด",
      thisWeek: summary?.total_steps?.toFixed(0),
      lastWeek: prevSummary?.total_steps?.toFixed(0),
    },
    {
      metric: "ค่าเฉลี่ยออกซิเจนในเลือด",
      thisWeek: summary?.avg_spo2?.toFixed(0),
      lastWeek: prevSummary?.avg_spo2?.toFixed(0),
    },
    {
      metric: "ค่าเฉลี่ยจำนวนการนอน",
      thisWeek: summary?.avg_sleep?.toFixed(1),
      lastWeek: prevSummary?.avg_sleep?.toFixed(1),
    },
  ];


  // ชื่อหัวตาราง
  const comparisonTitleMap: Record<typeof mode, string> = {
    weekly: "เปรียบเทียบสัปดาห์นี้ vs สัปดาห์ที่แล้ว",
    last7days: "เปรียบเทียบ 7 วันล่าสุด vs 7 วันก่อนหน้า",
    lastweek: "เปรียบเทียบสัปดาห์ที่แล้ว vs 2 สัปดาห์ก่อนหน้า",
  };

  // ชื่อคอลัมน์
  const comparisonColumnMap: Record<typeof mode, { thisWeek: string; lastWeek: string }> = {
    weekly: { thisWeek: "สัปดาห์นี้", lastWeek: "สัปดาห์ที่แล้ว" },
    last7days: { thisWeek: "7 วันล่าสุด", lastWeek: "7 วันก่อนหน้า" },
    lastweek: { thisWeek: "สัปดาห์ที่แล้ว", lastWeek: "2 สัปดาห์ก่อนหน้า" },
  };

 
  const columns: ColumnsType<typeof comparisonData[0]> = [
  {
    title: "ข้อมูลสุขภาพ",
    dataIndex: "metric",
    key: "metric",
    align: "center",
    className: "col-metric",
  },
  {
    title: comparisonColumnMap[mode].lastWeek,
    dataIndex: "lastWeek",
    key: "lastWeek",
    align: "center",
    className: "col-lastweek",
  },
  {
    title: comparisonColumnMap[mode].thisWeek,
    dataIndex: "thisWeek",
    key: "thisWeek",
    align: "center",
    className:
      "col-thisweek " +
      (["weekly", "last7days", "lastweek"].includes(mode)
        ? "highlight-col"
        : ""),
    render: (value: any, record: any) => {
      const prevValue = Number(record.lastWeek);
      const currentValue = Number(value);

      if (!prevValue || isNaN(prevValue) || isNaN(currentValue)) {
        return <span>{value}</span>;
      }

      let icon = null;
      if (currentValue > prevValue) {
        icon = <TrendingUp size={18} color="green" />;
      } else if (currentValue < prevValue) {
        icon = <TrendingDown size={18} color="red" />;
      } else {
        icon = <ArrowRightLeft size={18} color="gray" />;
      }

      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {value}
          {icon}
        </span>
      );
    },
  },
];


  return (
    <div>
      <Headers />
      <div className="health-dashboard-overview">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title-overview">ภาพรวมสุขภาพ "{modeLabel[mode]}"</h1>
            <Radio.Group
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              className="custom-radio-group-overview"
            >
              <Radio.Button value="weekly">สัปดาห์นี้</Radio.Button>
              <Radio.Button value="last7days">7 วันล่าสุด</Radio.Button>
              <Radio.Button value="lastweek">สัปดาห์ที่แล้ว</Radio.Button>
            </Radio.Group>
          </div>

          {/* Vitals */}
          <div className="vital-signs-grid">
            {vitalSigns.map((v, i) => (
              <div key={i} className="vital-card">
                <div className="vital-card-header">
                  <div className={`vital-icon ${v.color}`}>
                    <v.icon className="icon" />
                  </div>
                  {v.trend && (
                    <span className={`trend ${v.trend}`}>
                      {v.trend === "up" && <TrendingUp color="green" />}
                      {v.trend === "down" && <TrendingDown color="red" />}
                      {v.trend === "same" && <ArrowRightLeft color="gray" />}
                      <span className="trend-change">
                        {v.change ? `${v.change.toFixed(1)}%` : ""}
                      </span>
                    </span>
                  )}
                </div>
                <h3 className="vital-label">{v.label}</h3>
                <div className="vital-value">
                  <span className="value-number">{v.value}</span>
                  <span className="value-unit">{v.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {chartConfig.map(({ key, label, color, fill, icon }) => (
              <div className="chart-card" key={key}>
                <h2 className="chart-title">{icon} {label}</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey={key} stroke={color} fill={fill} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <Card
            title={<span className="comparison-title">{comparisonTitleMap[mode]}</span>}
            style={{ marginTop: 20 }}
            className="comparison-card"
          >
            <Table
              dataSource={comparisonData}
              columns={columns}
              pagination={false}
              rowKey="metric"
            />
          </Card>
        </div>
      </div>
      <Notification />
    </div>
  );
};

export default Overview;
