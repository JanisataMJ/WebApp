import React, { useState, useEffect } from "react";
import { GetWeeklySummary } from "../../services/https/DataHealth/healthSummary";
import { GetWeeklyHealthData } from "../../services/https/DataHealth/healthData";
import { HealthSummaryInterface } from "../../interface/health_summary_interface/health_summary";
import { HealthDataInterface } from "../../interface/health_data_interface/health_data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Droplets, Thermometer, Moon, TrendingUp, Calendar, User, Settings, Footprints, Bed, Flame } from 'lucide-react';
import { Radio } from "antd";

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
}

const Overview = () => {
  const [summary, setSummary] = useState<HealthSummaryInterface[] | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalCard[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"weekly" | "last7days" | "lastweek">("weekly");
  const UserID = Number(localStorage.getItem("id"));

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const latestWeek: HealthSummaryInterface = await GetWeeklySummary(UserID);

        if (!latestWeek) {
          setVitalSigns([]);
          return;
        }

        const vitals: VitalCard[] = [
          { label: "Heart Rate", value: latestWeek.avg_bpm?.toFixed(0) || 0, unit: "bpm", status: latestWeek.risk_level || "ไม่ระบุ", color: "heart-rate", icon: Heart },
          { label: "SpO₂", value: latestWeek.avg_spo2?.toFixed(0) || 0, unit: "%", status: latestWeek.risk_level || "ไม่ระบุ", color: "blood-oxygen", icon: Droplets },
          { label: "Calories", value: latestWeek.avg_calories?.toFixed(0) || 0, unit: "kcal", status: latestWeek.risk_level || "ไม่ระบุ", color: "calories", icon: Thermometer },
          { label: "Steps", value: latestWeek.avg_steps?.toFixed(0) || 0, unit: "steps", status: latestWeek.risk_level || "ไม่ระบุ", color: "steps", icon: Activity },
          { label: "Sleep", value: latestWeek.avg_sleep?.toFixed(1) || 0, unit: "hrs", status: latestWeek.risk_level || "ไม่ระบุ", color: "sleep", icon: Moon },
        ];
        setVitalSigns(vitals);
      } catch (error) {
        console.error("Error fetching weekly vitals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVitals();
  }, [UserID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetWeeklyHealthData(UserID, mode);

        const mapped = data.map((d: any) => ({
          ...d,
          date: new Date(d.date).toLocaleDateString("th-TH", { weekday: "short" }),
        }));

        setWeeklyData(mapped);
      } catch (error) {
        console.error("Error fetching weekly data:", error);
      }
    };
    fetchData();
  }, [UserID, mode]);


  const chartConfig = [
    { key: "avg_bpm", label: "Heart Rate", color: "#ef4444", fill: "#fee2e2", icon: <Heart className="chart-icon heart-rate" /> },
    { key: "steps", label: "Steps", color: "#3b82f6", fill: "#dbeafe", icon: <Footprints className="chart-icon steps" /> },
    { key: "sleep_hours", label: "Sleep Hours", color: "#8b5cf6", fill: "#ede9fe", icon: <Bed className="chart-icon sleep" /> },
    { key: "calories", label: "Calories Burned", color: "#f97316", fill: "#ffedd5", icon: <Flame className="chart-icon calories" /> },
    { key: "avg_spo2", label: "SpO₂", color: "#10b981", fill: "#d1fae5", icon: <Activity className="chart-icon spo2" /> },
  ];

  if (loading) return <p>Loading...</p>;

  const modeLabel: Record<typeof mode, string> = {
    weekly: "สัปดาห์นี้",
    last7days: "7 วันที่ผ่านมา",
    lastweek: "สัปดาห์ที่แล้ว",
  };


  return (
    <div><Headers />
      <div className="health-dashboard-overview">

        {/* Header */}
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="header-content">
              <h1 className="dashboard-title">ภาพรวมสุขภาพ "{modeLabel[mode]}"</h1>
              <p className="dashboard-subtitle">ติดตามสุขภาพและความก้าวหน้าในการดูแลตัวเอง</p>
            </div>

            {/* 👉 ปุ่มเลือก mode */}
            <div className="mode-selector">
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
          </div>

          <div className="vital-signs-grid">
            {vitalSigns.map((vital, index) => (
              <div key={index} className="vital-card">
                <div className="vital-card-header">
                  <div className={`vital-icon ${vital.color}`}>
                    <vital.icon className="icon" />
                  </div>
                  <span
                    className={`status-badge ${vital.status === "good" || vital.status === "optimal"
                      ? "status-good"
                      : "status-normal"
                      }`}
                  >
                    {vital.status}
                  </span>
                </div>
                <h3 className="vital-label">{vital.label}</h3>
                <div className="vital-value">
                  <span className="value-number">{vital.value}</span>
                  <span className="value-unit">{vital.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {chartConfig.map(({ key, label, color, fill, icon }) => (
              <div className="chart-card" key={key}>
                <div className="chart-header">
                  <h2 className="chart-title">
                    {icon} {label}
                  </h2>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        fill={fill}
                        strokeWidth={3}
                        name={label}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}




            {/* Activity Summary */}
            <div className="activity-card">
              <h2 className="activity-title">Today's Activity</h2>

              {/* Activity Cards */}
              <div className="activity-list">
                <div className="activity-item steps">
                  <div className="activity-info">
                    <div className="activity-dot steps-dot"></div>
                    <span className="activity-name">Steps</span>
                  </div>
                  <span className="activity-value">8,500</span>
                </div>

                <div className="activity-item calories">
                  <div className="activity-info">
                    <div className="activity-dot calories-dot"></div>
                    <span className="activity-name">Calories</span>
                  </div>
                  <span className="activity-value">2,150</span>
                </div>

                <div className="activity-item distance">
                  <div className="activity-info">
                    <div className="activity-dot distance-dot"></div>
                    <span className="activity-name">Distance</span>
                  </div>
                  <span className="activity-value">6.2 km</span>
                </div>

                <div className="activity-item active-time">
                  <div className="activity-info">
                    <div className="activity-dot active-time-dot"></div>
                    <span className="activity-name">Active Time</span>
                  </div>
                  <span className="activity-value">45 min</span>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="progress-container">
                <div className="progress-ring">
                  <svg className="progress-svg">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                      className="progress-bg"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#8b5cf6"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray="351.86"
                      strokeDashoffset="87.96"
                      className="progress-fill"
                    />
                  </svg>
                  <div className="progress-text">
                    <span className="progress-percentage">75%</span>
                    <span className="progress-label">Goal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Notification />
    </div>

  );
};

export default Overview;
