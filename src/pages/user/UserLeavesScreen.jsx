import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const UserLeavesScreen = () => {
  const { currentUser } = useAuth();
  const userKey = currentUser?.key || currentUser?.id || '';

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | '1' | '2' | '3' | '4'
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Form states
  const [leaveTypeId, setLeaveTypeId] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState(APP_CONSTANTS.LEAVE_DURATION.FULL_DAY);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveData = async () => {
    if (!userKey) return;
    setLoading(true);
    try {
      const [statusRes, balRes] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.USER_GET_LEAVES_STATUS}${userKey}`).catch(() => []),
        apiService.get(`${API_ENDPOINTS.USER_GET_LEAVES_BALANCE}${userKey}`).catch(() => ({})),
      ]);

      setLeaves(Array.isArray(statusRes) ? statusRes : []);
      setBalances(balRes?.leavesBalance || (Array.isArray(balRes) ? balRes : []));
    } catch (err) {
      console.error('Error fetching leave details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [userKey]);

  // Status counts
  const countApproved = leaves.filter((l) => String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.APPROVED).length;
  const countPending = leaves.filter((l) => String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.PENDING).length;
  const countRejected = leaves.filter((l) => String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.REJECTED).length;
  const countCancelled = leaves.filter((l) => String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.CANCELLED).length;

  const filteredLeaves = leaves.filter((l) => {
    if (activeFilter === 'ALL') return true;
    return String(l.leaveStatus) === activeFilter;
  });

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userKey: userKey,
        leaveType: leaveTypeId,
        startDate: startDate,
        endDate: endDate,
        leaveDuration: duration,
        reason: reason.trim(),
      };

      await apiService.post(API_ENDPOINTS.USER_APPLY_LEAVES, payload);
      setActionNotice({ type: 'success', message: 'Leave application submitted successfully!' });
      setIsApplyModalOpen(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      await fetchLeaveData();
    } catch (err) {
      console.error('Failed to submit leave:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to submit leave request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await apiService.delete(`${API_ENDPOINTS.USER_CANCEL_LEAVE}${leaveId}`);
      setActionNotice({ type: 'success', message: 'Leave application cancelled successfully.' });
      await fetchLeaveData();
    } catch (err) {
      console.error('Cancel leave failed:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to cancel leave application.' });
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status);
    if (s === APP_CONSTANTS.LEAVE_STATUS.APPROVED) return <span className="badge badge-approved">Approved</span>;
    if (s === APP_CONSTANTS.LEAVE_STATUS.PENDING) return <span className="badge badge-pending">Pending</span>;
    if (s === APP_CONSTANTS.LEAVE_STATUS.REJECTED) return <span className="badge badge-rejected">Rejected</span>;
    if (s === APP_CONSTANTS.LEAVE_STATUS.CANCELLED) return <span className="badge badge-cancelled">Cancelled</span>;
    return <span className="badge badge-info">{s}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Notice */}
      {actionNotice && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: actionNotice.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: actionNotice.type === 'success' ? 'var(--success-text)' : 'var(--error-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Apply Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Leaves & Time Off</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Check your allocated balance, review status, and apply for upcoming leave.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={18} />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {balances.length > 0 ? (
          balances.map((b, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <CalendarDays size={24} />
              </div>
              <div>
                <div className="stat-val">{b.balance || 0}</div>
                <div className="stat-label">{b.leaveName || `Type ${b.leaveType || idx + 1}`}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <CalendarDays size={24} />
            </div>
            <div>
              <div className="stat-val">Standard</div>
              <div className="stat-label">Casual & Medical Leave</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs and Applications Table */}
      <div className="glass-card">
        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.25rem',
          }}
        >
          {[
            { key: 'ALL', label: 'All Requests', count: leaves.length },
            { key: APP_CONSTANTS.LEAVE_STATUS.APPROVED, label: 'Approved', count: countApproved },
            { key: APP_CONSTANTS.LEAVE_STATUS.PENDING, label: 'Pending', count: countPending },
            { key: APP_CONSTANTS.LEAVE_STATUS.REJECTED, label: 'Rejected', count: countRejected },
            { key: APP_CONSTANTS.LEAVE_STATUS.CANCELLED, label: 'Cancelled', count: countCancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeFilter === tab.key ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: activeFilter === tab.key ? 'var(--primary-light)' : 'transparent',
                color: activeFilter === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'inherit',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Dates Range</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Remark</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l, index) => {
                  const isPending = String(l.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.PENDING;
                  const startStr = l.startDate ? new Date(l.startDate).toLocaleDateString() : '';
                  const endStr = l.endDate ? new Date(l.endDate).toLocaleDateString() : '';

                  return (
                    <tr key={l._id || l.id || index}>
                      <td style={{ fontWeight: 600 }}>{l.leaveName || l.leaveType || 'General Leave'}</td>
                      <td>
                        <span className="badge badge-info">
                          {String(l.leaveDuration) === APP_CONSTANTS.LEAVE_DURATION.HALF_DAY ? 'Half Day' : 'Full Day'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>{startStr} - {endStr}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.reason || 'N/A'}
                      </td>
                      <td>{getStatusBadge(l.leaveStatus)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {l.adminRemark || l.remark || '--'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleCancelLeave(l._id || l.id || l.key)}
                            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            title="Cancel Request"
                          >
                            <Trash2 size={14} />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed</span>
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

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsApplyModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarDays size={20} color="var(--primary)" />
                <h3>Apply for Leave</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsApplyModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                {/* Leave Type */}
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-control form-select"
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(e.target.value)}
                  >
                    <option value="1">Casual Leave</option>
                    <option value="2">Sick / Medical Leave</option>
                    <option value="3">Earned / Paid Leave</option>
                    <option value="4">Unpaid Leave</option>
                  </select>
                </div>

                {/* Duration Full or Half */}
                <div className="form-group">
                  <label className="form-label">Leave Duration</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="duration"
                        value={APP_CONSTANTS.LEAVE_DURATION.FULL_DAY}
                        checked={duration === APP_CONSTANTS.LEAVE_DURATION.FULL_DAY}
                        onChange={() => setDuration(APP_CONSTANTS.LEAVE_DURATION.FULL_DAY)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>Full Day</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="duration"
                        value={APP_CONSTANTS.LEAVE_DURATION.HALF_DAY}
                        checked={duration === APP_CONSTANTS.LEAVE_DURATION.HALF_DAY}
                        onChange={() => setDuration(APP_CONSTANTS.LEAVE_DURATION.HALF_DAY)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>Half Day</span>
                    </label>
                  </div>
                </div>

                {/* Date Ranges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="form-group">
                  <label className="form-label">Reason for Absence</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Provide detailed reason for the leave application..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
