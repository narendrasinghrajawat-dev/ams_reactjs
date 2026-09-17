import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  MapPin,
  Laptop,
  CheckCircle2,
  LogOut,
  LogIn,
  AlertTriangle,
  Calendar,
  Briefcase,
  Home,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';
import { getCurrentLocation, isWithinRadius } from '../../utils/locationService';
import { getDeviceInformation } from '../../utils/deviceInfo';

export const UserDashboard = () => {
  const { currentUser } = useAuth();
  const userKey = currentUser?.key || currentUser?.id || '';

  const [activities, setActivities] = useState([]);
  const [wfhTaken, setWfhTaken] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [masterData, setMasterData] = useState(null);
  const [isWFH, setIsWFH] = useState(false);
  const [isPunching, setIsPunching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Live timer states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Load today's activity and summary
  const loadDashboardData = async () => {
    if (!userKey) return;
    setLoading(true);
    try {
      const todayIso = new Date().toISOString();
      const [todayActivities, wfhCount, balanceData, mData] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.USER_ACTIVITIES_BY_DATE}${userKey}/${todayIso}`).catch(() => []),
        apiService.get(`${API_ENDPOINTS.USER_GET_TAKEN_MONTH_WFH}${userKey}`).catch(() => 0),
        apiService.get(`${API_ENDPOINTS.USER_GET_LEAVES_BALANCE}${userKey}`).catch(() => ({})),
        apiService.get(API_ENDPOINTS.MASTER_DATA).catch(() => null),
      ]);

      const actList = Array.isArray(todayActivities) ? todayActivities : [];
      setActivities(actList);
      setWfhTaken(typeof wfhCount === 'number' ? wfhCount : 0);
      setLeaveBalance(balanceData?.leavesBalance || (Array.isArray(balanceData) ? balanceData : []));
      setMasterData(mData);

      // Check if already checked in as WFH today
      const todayIn = actList.find((a) => a.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN);
      if (todayIn?.isWFH) {
        setIsWFH(true);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userKey]);

  // Determine current punch status
  const checkInActivity = activities.find((a) => a.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_IN);
  const checkOutActivity = activities.find((a) => a.punchType === APP_CONSTANTS.PUNCH_TYPE.CHECK_OUT);
  const isCheckedIn = !!checkInActivity && !checkOutActivity;
  const isCompletedToday = !!checkInActivity && !!checkOutActivity;

  // Live elapsed timer calculation
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isCheckedIn && checkInActivity?.punchTime) {
      const inTime = new Date(checkInActivity.punchTime).getTime();

      const updateElapsed = () => {
        const diff = Math.max(0, Math.floor((Date.now() - inTime) / 1000));
        setElapsedSeconds(diff);
      };

      updateElapsed();
      timerRef.current = setInterval(updateElapsed, 1000);
    } else if (isCompletedToday && checkInActivity?.punchTime && checkOutActivity?.punchTime) {
      const inTime = new Date(checkInActivity.punchTime).getTime();
      const outTime = new Date(checkOutActivity.punchTime).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((outTime - inTime) / 1000)));
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCheckedIn, isCompletedToday, checkInActivity, checkOutActivity]);

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Perform Punch In / Punch Out
  const handlePunch = async () => {
    setIsPunching(true);
    setNotice(null);

    try {
      const punchType = isCheckedIn ? APP_CONSTANTS.PUNCH_TYPE.CHECK_OUT : APP_CONSTANTS.PUNCH_TYPE.CHECK_IN;

      // 1. Geolocation check
      const locRes = await getCurrentLocation();
      const userLat = locRes.coords?.latitude || 26.9124;
      const userLng = locRes.coords?.longitude || 75.7873;

      // 2. Office radius validation (if not WFH)
      if (!isWFH && masterData) {
        const officeLat = masterData.officeLat;
        const officeLng = masterData.officeLong;
        const officeRadius = masterData.officeRadius || 100;

        if (officeLat && officeLng) {
          const within = isWithinRadius(userLat, userLng, officeLat, officeLng, officeRadius);
          if (!within) {
            setNotice({
              type: 'warning',
              message: 'You are outside the office radius (100m). Please switch on the "Work From Home (WFH)" toggle above to record attendance.',
            });
            setIsPunching(false);
            return;
          }
        }
      }

      // 3. Device info
      const deviceInfo = getDeviceInformation();

      // 4. Punch request payload
      const payload = {
        userKey: userKey,
        punchType: punchType,
        punchTime: new Date().toISOString(),
        punchDate: new Date().toISOString(),
        lat: String(userLat),
        long: String(userLng),
        deviceInformation: deviceInfo,
        isWFH: isWFH,
      };

      await apiService.post(API_ENDPOINTS.USER_PUNCH, payload);

      // Celebrate on check in
      if (!isCheckedIn) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setNotice({
        type: 'success',
        message: isCheckedIn ? 'Successfully Checked Out! Have a great evening!' : 'Successfully Checked In! Have a productive day!',
      });

      // Reload updated activities
      await loadDashboardData();
    } catch (err) {
      console.error('Punch failed:', err);
      setNotice({
        type: 'error',
        message: err.message || 'Failed to record attendance. Please try again.',
      });
    } finally {
      setIsPunching(false);
    }
  };

  // Compute total leaves available from balance
  const totalRemainingLeaves = leaveBalance.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Notice */}
      {notice && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              notice.type === 'success'
                ? 'var(--success-bg)'
                : notice.type === 'warning'
                ? 'var(--warning-bg)'
                : 'var(--error-bg)',
            color:
              notice.type === 'success'
                ? 'var(--success-text)'
                : notice.type === 'warning'
                ? 'var(--warning-text)'
                : 'var(--error-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {notice.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span style={{ fontWeight: 500, fontSize: '0.925rem' }}>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div className="stat-val">{activities.length > 0 ? 'Present' : 'Not Marked'}</div>
            <div className="stat-label">Today's Attendance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <Home size={26} />
          </div>
          <div>
            <div className="stat-val">{wfhTaken} Days</div>
            <div className="stat-label">WFH Taken This Month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <Briefcase size={26} />
          </div>
          <div>
            <div className="stat-val">{totalRemainingLeaves} Days</div>
            <div className="stat-label">Remaining Leave Balance</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Attendance Card */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: isCheckedIn ? '2px solid var(--primary)' : '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Punch Attendance</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {isCheckedIn
                ? 'You are currently punched in and on shift.'
                : isCompletedToday
                ? 'Shift completed for today. Great job!'
                : 'Mark your attendance to start your work session.'}
            </p>
          </div>

          {/* WFH Toggle Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Home size={17} color={isWFH ? 'var(--secondary)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isWFH ? 'var(--secondary)' : 'var(--text-secondary)' }}>
              Work From Home (WFH)
            </span>
            <input
              type="checkbox"
              className="switch-input"
              checked={isWFH}
              onChange={(e) => setIsWFH(e.target.checked)}
              disabled={isCheckedIn || isCompletedToday}
            />
          </div>
        </div>

        {/* Center Timer & Action */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            textAlign: 'center',
          }}
        >
          {/* Live Working Hours Clock */}
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.05em',
              color: isCheckedIn ? 'var(--primary)' : isCompletedToday ? 'var(--success)' : 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}
          >
            {formatTimer(elapsedSeconds)}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {isCheckedIn
              ? 'Elapsed Working Time Today'
              : isCompletedToday
              ? 'Total Time Recorded Today'
              : 'Working Timer (00:00:00)'}
          </div>

          {/* Big Action Punch Button */}
          {isCompletedToday ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.9rem 2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
            >
              <CheckCircle2 size={22} />
              <span>Shift Finished for Today</span>
            </div>
          ) : (
            <button
              className={`btn btn-lg ${isCheckedIn ? 'btn-danger' : 'btn-primary'}`}
              onClick={handlePunch}
              disabled={isPunching}
              style={{
                minWidth: '240px',
                padding: '1.1rem 2.5rem',
                fontSize: '1.15rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: isCheckedIn ? '0 8px 24px rgba(239, 68, 68, 0.3)' : '0 8px 24px var(--primary-glow)',
              }}
            >
              {isPunching ? (
                <span>Recording...</span>
              ) : isCheckedIn ? (
                <>
                  <LogOut size={22} />
                  <span>Punch Out (End Shift)</span>
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  <span>Punch In (Start Shift)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Today's Punch Timestamps */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: checkInActivity ? 'var(--success-bg)' : 'var(--bg-hover)',
                color: checkInActivity ? 'var(--success)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogIn size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Punch In Time
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {checkInActivity?.punchTime
                  ? new Date(checkInActivity.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: checkOutActivity ? 'var(--error-bg)' : 'var(--bg-hover)',
                color: checkOutActivity ? 'var(--error)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Punch Out Time
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {checkOutActivity?.punchTime
                  ? new Date(checkOutActivity.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isWFH ? 'var(--secondary-light)' : 'var(--info-bg)',
                color: isWFH ? 'var(--secondary)' : 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isWFH ? <Home size={20} /> : <MapPin size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Work Mode
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {isWFH ? 'Remote (WFH)' : 'In-Office (Geofenced)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
