import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';

export const UserCalendarScreen = () => {
  const { currentUser } = useAuth();
  const userKey = currentUser?.key || currentUser?.id || '';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendar = async () => {
    if (!userKey) return;
    setLoading(true);
    try {
      const res = await apiService.get(`${API_ENDPOINTS.USER_GET_CALENDAR}${userKey}/${year}`).catch(() => null);
      const calendarMap = res?.data || (res && typeof res === 'object' && !Array.isArray(res) ? res : {});
      setCalendarData(calendarMap);
    } catch (err) {
      console.error('Calendar error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [userKey, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const monthName = currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Attendance Calendar</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monthly calendar tracking attendance, leaves, weekends, and holidays.
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ fontWeight: 700, minWidth: '160px', textAlign: 'center' }}>
            {monthName}
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setCurrentDate(new Date())}
            style={{ marginLeft: '0.5rem' }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card">
        {/* Days of week header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
            marginBottom: '0.75rem',
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div
              key={d}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: i === 0 || i === 6 ? 'var(--text-muted)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
          }}
        >
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: '80px' }} />;
            }

            const dayOfWeek = (firstDayIndex + day - 1) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = isCurrentMonth && today.getDate() === day;

            const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const isPast = dayStr < todayDateStr;
            const isFuture = dayStr > todayDateStr;

            const isPresent = dayInfo?.status === 'present' || !!dayInfo?.punch?.punchIn;
            const isLeave = dayInfo?.status === 'leave' || !!dayInfo?.leave;
            const isHoliday = dayInfo?.isHoliday && !isWeekend;
            const isAbsent = !isPresent && !isLeave && !isHoliday && !isWeekend && isPast;

            return (
              <div
                key={day}
                style={{
                  minHeight: '85px',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isToday ? 'var(--primary-light)' : 'var(--bg-surface)',
                  border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontWeight: isToday ? 800 : 600,
                      fontSize: '0.9rem',
                      color: isToday ? 'var(--primary)' : isWeekend ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Today
                    </span>
                  )}
                </div>

                {/* Day status badge */}
                <div>
                  {isPresent ? (
                    <div>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                        {isToday ? 'Active' : 'Present'}
                      </span>
                      {dayInfo?.punch?.duration && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {dayInfo.punch.duration}
                        </div>
                      )}
                    </div>
                  ) : isLeave ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }} title={dayInfo?.leave?.leaveName || 'Leave'}>
                      On Leave
                    </span>
                  ) : isHoliday ? (
                    <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }} title={dayInfo?.holidayName}>
                      {dayInfo?.holidayName || 'Holiday'}
                    </span>
                  ) : isWeekend ? (
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Weekend</span>
                  ) : isToday ? (
                    <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                      Today
                    </span>
                  ) : isAbsent ? (
                    <span className="badge badge-error" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                      Absent
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>--</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
