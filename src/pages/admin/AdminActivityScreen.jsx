import React, { useState, useEffect } from 'react';
import { History, Calendar, LogIn, LogOut, MapPin, Laptop, Home, User, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const AdminActivityScreen = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (dateStr) => {
    setLoading(true);
    try {
      const isoDate = new Date(dateStr).toISOString();
      const res = await apiService.get(`${API_ENDPOINTS.ADMIN_FETCH_ACTIVITIES_BY_DATE}${isoDate}`);
      setActivities(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching admin activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(selectedDate);
  }, [selectedDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Organization Attendance Logs</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Daily punch records, geolocations, and terminal device metrics across all staff.
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
            onClick={() => fetchActivities(selectedDate)}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee Key</th>
                <th>Punch Type</th>
                <th>Recorded Time</th>
                <th>Work Mode</th>
                <th>Coordinates</th>
                <th>Device & Browser</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading organization activity logs...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No activity logs recorded on this date.
                  </td>
                </tr>
              ) : (
                activities.map((item, idx) => {
                  const isCheckIn = item.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN;
                  const timeStr = item.punchTime ? new Date(item.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--';
                  const isWFH = item.isWFH;

                  return (
                    <tr key={item._id || item.id || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} color="var(--primary)" />
                          <span style={{ fontWeight: 600 }}>{item.userKey || item.userId || 'Emp'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isCheckIn ? 'badge-success' : 'badge-error'}`}>
                          {isCheckIn ? 'Checked In' : 'Checked Out'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{timeStr}</td>
                      <td>
                        {isWFH ? (
                          <span className="badge badge-wfh">
                            <Home size={12} /> WFH
                          </span>
                        ) : (
                          <span className="badge badge-info">
                            <MapPin size={12} /> Office
                          </span>
                        )}
                      </td>
                      <td>
                        {item.lat && item.long ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {parseFloat(item.lat).toFixed(4)}, {parseFloat(item.long).toFixed(4)}
                          </span>
                        ) : (
                          '--'
                        )}
                      </td>
                      <td>
                        {item.deviceInformation?.browserName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                            <Laptop size={14} color="var(--text-muted)" />
                            <span>{item.deviceInformation.browserName} ({item.deviceInformation.os || 'Web'})</span>
                          </div>
                        ) : (
                          '--'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
