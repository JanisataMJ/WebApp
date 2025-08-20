import React from "react";
import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Droplets, Thermometer, Moon, TrendingUp, Calendar, User, Settings } from 'lucide-react';

import "./Overview.css";
import { Form, Input, Modal, message } from "antd";
import Headers from '../../compronents/Pubblic_components/headerselect';
import Notification from '../../compronents/Home_components/Notifiation/notice';

const Overview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Sample health data
  const heartRateData = [
    { time: '00:00', rate: 65 },
    { time: '04:00', rate: 58 },
    { time: '08:00', rate: 72 },
    { time: '12:00', rate: 85 },
    { time: '16:00', rate: 78 },
    { time: '20:00', rate: 70 },
    { time: '24:00', rate: 68 }
  ];

  const bloodPressureData = [
    { date: 'Mon', systolic: 120, diastolic: 80 },
    { date: 'Tue', systolic: 118, diastolic: 78 },
    { date: 'Wed', systolic: 122, diastolic: 82 },
    { date: 'Thu', systolic: 125, diastolic: 85 },
    { date: 'Fri', systolic: 119, diastolic: 79 },
    { date: 'Sat', systolic: 121, diastolic: 81 },
    { date: 'Sun', systolic: 117, diastolic: 77 }
  ];

  const sleepData = [
    { day: 'Mon', deep: 2.5, light: 4.5, rem: 1.5 },
    { day: 'Tue', deep: 3.0, light: 4.0, rem: 1.8 },
    { day: 'Wed', deep: 2.2, light: 5.0, rem: 1.3 },
    { day: 'Thu', deep: 2.8, light: 4.2, rem: 1.6 },
    { day: 'Fri', deep: 2.6, light: 4.8, rem: 1.4 },
    { day: 'Sat', deep: 3.2, light: 3.8, rem: 2.0 },
    { day: 'Sun', deep: 2.9, light: 4.3, rem: 1.7 }
  ];

  const activityData = [
    { name: 'Steps', value: 8500, color: '#8b5cf6' },
    { name: 'Calories', value: 2150, color: '#06b6d4' },
    { name: 'Distance', value: 6.2, color: '#10b981' },
    { name: 'Minutes', value: 45, color: '#f59e0b' }
  ];

  const vitalSigns = [
    { icon: Heart, label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', color: 'heart-rate' },
    { icon: Droplets, label: 'Blood Oxygen', value: '98', unit: '%', status: 'good', color: 'blood-oxygen' },
    { icon: Thermometer, label: 'Body Temp', value: '36.8', unit: '°C', status: 'normal', color: 'temperature' },
    { icon: Activity, label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'optimal', color: 'blood-pressure' }
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div><Headers />
      <div className="health-dashboard">
      {/* Header */}
      <div className="dashboard-container"> 
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Health Dashboard</h1>
            <p className="dashboard-subtitle">Track your health metrics and wellness progress</p>
          </div>
          <div className="header-controls">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 3 Months</option>
            </select>
            <button className="settings-button">
              <Settings className="settings-icon" />
            </button>
          </div>
        </div>

        {/* Vital Signs Cards */}
        <div className="vital-signs-grid">
          {vitalSigns.map((vital, index) => (
            <div key={index} className="vital-card">
              <div className="vital-card-header">
                <div className={`vital-icon ${vital.color}`}>
                  <vital.icon className="icon" />
                </div>
                <span className={`status-badge ${vital.status === 'good' || vital.status === 'optimal' ? 'status-good' : 'status-normal'}`}>
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
          
          {/* Heart Rate Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">
                <Heart className="chart-icon heart-rate" />
                Heart Rate Today
              </h2>
              <TrendingUp className="trend-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={heartRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#ef4444" 
                    fill="#fef2f2" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blood Pressure Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">
                <Activity className="chart-icon blood-pressure" />
                Blood Pressure (7 Days)
              </h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bloodPressureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Systolic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    name="Diastolic"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sleep & Activity Row */}
        <div className="bottom-grid">
          
          {/* Sleep Pattern */}
          <div className="sleep-card">
            <div className="chart-header">
              <h2 className="chart-title">
                <Moon className="chart-icon sleep" />
                Sleep Pattern (Hours)
              </h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Bar dataKey="deep" stackId="a" fill="#6366f1" name="Deep Sleep" />
                  <Bar dataKey="light" stackId="a" fill="#a78bfa" name="Light Sleep" />
                  <Bar dataKey="rem" stackId="a" fill="#c4b5fd" name="REM Sleep" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
