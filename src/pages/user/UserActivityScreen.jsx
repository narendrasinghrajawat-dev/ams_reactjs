import React, { useState, useEffect } from 'react';
import { History, Calendar, LogIn, LogOut, MapPin, Laptop, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const UserActivityScreen = () => {
  const { currentUser } = useAuth();
  const userKey = currentUser?.key || currentUser?.id || '';

  const [activities, setActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchActivitiesByDate = async (dateStr) => {
    if (!userKey) return;
    setLoading(true);
    try {
      const isoDate = new Date(dateStr).toISOString();
      const res = await apiService.get(`${API_ENDPOINTS.USER_ACTIVITIES_BY_DATE}${userKey}/${isoDate}`);
      setActivities(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesByDate(selectedDate);
  }, [userKey, selectedDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Punch Activity & History</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Daily attendance breakdown, timestamps, work mode, and device details.
          </p>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
          Activity Log for {new Date(selectedDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading attendance records...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No punch activity found for this date.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((item, idx) => {
              const isCheckIn = item.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN;
              const timeStr = item.punchTime ? new Date(item.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--';
              const isWFH = item.isWFH;

              return (
                <div
                  key={item._id || item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isCheckIn ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: isCheckIn ? 'var(--success)' : 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCheckIn ? <LogIn size={22} /> : <LogOut size={22} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {isCheckIn ? 'Checked In' : 'Checked Out'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Recorded at <strong style={{ color: 'var(--text-primary)' }}>{timeStr}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {/* Mode */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      {isWFH ? (
                        <span className="badge badge-wfh">
                          <Home size={13} /> WFH
                        </span>
                      ) : (
                        <span className="badge badge-info">
                          <MapPin size={13} /> In Office
                        </span>
                      )}
                    </div>

                    {/* Coordinates */}
                    {item.lat && item.long && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} />
                        <span>{parseFloat(item.lat).toFixed(4)}, {parseFloat(item.long).toFixed(4)}</span>
                      </div>
                    )}

                    {/* Device */}
                    {item.deviceInformation?.browserName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Laptop size={14} />
                        <span>{item.deviceInformation.browserName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
