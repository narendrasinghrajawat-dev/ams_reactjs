import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  ClockAlert,
  CalendarOff,
  ClipboardList,
  Calendar,
  LogIn,
  LogOut,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (dateStr) => {
    setLoading(true);
    try {
      const isoDate = new Date(dateStr).toISOString();

      const [usersRes, attRes, leavesRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.ADMIN_USER_LIST).catch(() => []),
        apiService.get(`${API_ENDPOINTS.ADMIN_FETCH_ATTENDANCE_BY_DATE}${isoDate}`).catch(() => []),
        apiService.get(`${API_ENDPOINTS.ADMIN_FETCH_LEAVES_BY_DATE}${isoDate}`).catch(() => []),
      ]);

      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setAttendance(Array.isArray(attRes) ? attRes : []);
      setLeaves(Array.isArray(leavesRes) ? leavesRes : []);
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  // Metrics calculations matching Flutter AdminHomeController
  const totalEmployees = users.length;

  // Present today (distinct users with punch in)
  const presentUserKeys = new Set(
    attendance
      .filter((a) => a.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN)
      .map((a) => a.userKey || a.userId)
  );
  const presentTodayCount = presentUserKeys.size;

  // Late Arrivals (punch in after 10:00 AM)
  const lateCutoff = '10:00:00';
  const lateUserKeys = new Set(
    attendance
      .filter((a) => {
        if (a.punchType !== APP_CONSTANTS.PUNCH_TYPE.CHECK_IN || !a.punchTime) return false;
        const timePart = new Date(a.punchTime).toTimeString().split(' ')[0];
        return timePart > lateCutoff;
      })
      .map((a) => a.userKey || a.userId)
  );
  const lateArrivalsCount = lateUserKeys.size;

  // On leave today (approved leaves)
  const onLeaveTodayCount = leaves.filter(
    (l) => String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.APPROVED
  ).length;

  // Pending leaves
  const pendingLeavesCount = leaves.filter(
    (l) => String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.PENDING
  ).length;

  // Combine attendance & leave records for recent activity stream
  const recentActivities = [
    ...attendance.map((a) => ({
      type: 'punch',
      title: `${a.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN ? 'Punched In' : 'Punched Out'} (${a.userKey || 'Emp'})`,
      timestamp: a.punchTime || a.createdDate,
      isCheckIn: a.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN,
      isWFH: a.isWFH,
    })),
    ...leaves.map((l) => ({
      type: 'leave',
      title: `Leave Applied (${l.userKey || 'Emp'})`,
      timestamp: l.createdDate || l.startDate,
      status: l.leaveStatus,
      duration: l.leaveDuration,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    .slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Date Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Overview</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time workforce attendance metrics, leave requests, and recent activity.
          </p>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-surface)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Calendar size={18} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontWeight: 600 }}
            />
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchDashboardData(selectedDate)}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{totalEmployees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{presentTodayCount}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <ClockAlert size={24} />
          </div>
          <div>
            <div className="stat-val">{lateArrivalsCount}</div>
            <div className="stat-label">Late Arrivals (&gt;10:00)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
            <CalendarOff size={24} />
          </div>
          <div>
            <div className="stat-val">{onLeaveTodayCount}</div>
            <div className="stat-label">On Leave Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="stat-val">{pendingLeavesCount}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity & Attendance Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Activity Feed */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
            Live Activity Stream ({selectedDate})
          </h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading activities...
            </div>
          ) : recentActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No recorded activities on this day.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentActivities.map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor:
                          act.type === 'punch'
                            ? act.isCheckIn
                              ? 'var(--success-bg)'
                              : 'var(--error-bg)'
                            : 'var(--secondary-light)',
                        color:
                          act.type === 'punch'
                            ? act.isCheckIn
                              ? 'var(--success)'
                              : 'var(--error)'
                            : 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {act.type === 'punch' ? act.isCheckIn ? <LogIn size={16} /> : <LogOut size={16} /> : <CalendarOff size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{act.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {act.timestamp
                          ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </div>
                    </div>
                  </div>

                  {act.isWFH && (
                    <span className="badge badge-wfh" style={{ fontSize: '0.7rem' }}>
                      WFH
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Summary List */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
            Employees Present Log ({attendance.length} entries)
          </h4>

          {attendance.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No punch attendance records on this date.
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>User Key</th>
                    <th>Type</th>
                    <th>Time</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 10).map((att, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{att.userKey || att.userId || 'User'}</td>
                      <td>
                        <span className={`badge ${att.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN ? 'badge-success' : 'badge-error'}`}>
                          {att.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN ? 'In' : 'Out'}
                        </span>
                      </td>
                      <td>
                        {att.punchTime
                          ? new Date(att.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </td>
                      <td>
                        {att.isWFH ? <span className="badge badge-wfh">WFH</span> : <span className="badge badge-info">Office</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
