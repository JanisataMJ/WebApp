import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './calendar.css';
import Headers from '../../compronents/Pubblic_components/headerselect';
import CategoryNav from '../../compronents/Home_components/Navbar';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date
  const today = new Date();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className="healthy-calendar">
      <Headers />
      <CategoryNav />

      {/* Calendar */}
      <div className="calendar-container">
        <div className="calendar-wrapper">
          {/* Month Navigation */}
          <div className="month-navigation">
            <button 
              onClick={() => navigateMonth(-1)}
              className="nav-button"
            >
              <ChevronLeft className="nav-icon" />
            </button>
            <h2 className="month-title">
              {currentMonth} {currentYear}
            </h2>
            <button 
              onClick={() => navigateMonth(1)}
              className="nav-button"
            >
              <ChevronRight className="nav-icon" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
              <div key={dayName} className="day-header">
                {dayName}
              </div>
            ))}
            
            {days.map((day, index) => {
              const isToday = day && 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear() && 
                day === today.getDate();
              
              return (
                <div
                  key={index}
                  className={`
                    calendar-day
                    ${day === null ? 'empty-day' : 'normal-day'}
                    ${isToday ? 'today' : ''}
                  `}
                >
                  {day && (
                    <span className="day-number">
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;