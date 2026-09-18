import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { APP_CONSTANTS } from '../../constants/appConstants';

import { useAuth } from '../../context/AuthContext';

export const AdminLeavesScreen = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminRemark, setAdminRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(API_ENDPOINTS.ADMIN_GET_ALL_LEAVE_REQUESTS);
      setRequests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      setNotice({ type: 'error', message: 'Failed to load leave requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleAdminAction = async (statusAction) => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      const leaveDocId = selectedLeave._id || selectedLeave.id || selectedLeave.key || selectedLeave._key;
      const adminKey = currentUser?._id || currentUser?.id || currentUser?.key || currentUser?._key || 'admin';
      const payload = {
        leavesId: leaveDocId,
        leaveId: leaveDocId,
        leavesStatus: String(statusAction), // '2' for approved, '3' for rejected
        leaveStatus: String(statusAction),
        approveByKey: adminKey,
        adminRemark: adminRemark.trim() || (statusAction === APP_CONSTANTS.LEAVE_STATUS.APPROVED ? 'Approved' : 'Rejected'),
      };

      await apiService.post(API_ENDPOINTS.ADMIN_ACTION_ON_LEAVE, payload);
      setNotice({
        type: 'success',
        message: `Leave request has been ${statusAction === APP_CONSTANTS.LEAVE_STATUS.APPROVED ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedLeave(null);
      setAdminRemark('');
      await fetchLeaveRequests();
    } catch (err) {
      console.error('Action failed:', err);
      setNotice({ type: 'error', message: err.message || 'Action on leave failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const countPending = requests.filter((r) => String(r.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.PENDING).length;
  const countApproved = requests.filter((r) => String(r.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.APPROVED).length;
  const countRejected = requests.filter((r) => String(r.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.REJECTED).length;

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return String(r.leaveStatus) === activeFilter;
  });

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
      {/* Notice Banner */}
      {notice && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: notice.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: notice.type === 'success' ? 'var(--success-text)' : 'var(--error-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Leave Requests & Approvals</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review employee leave requests, inspect reasons, and grant approvals.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={fetchLeaveRequests}>
          <RefreshCw size={15} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs & Content */}
      <div className="glass-card">
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
            { key: 'ALL', label: 'All Requests', count: requests.length },
            { key: APP_CONSTANTS.LEAVE_STATUS.PENDING, label: 'Pending Review', count: countPending },
            { key: APP_CONSTANTS.LEAVE_STATUS.APPROVED, label: 'Approved', count: countApproved },
            { key: APP_CONSTANTS.LEAVE_STATUS.REJECTED, label: 'Rejected', count: countRejected },
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
                <th>Employee</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Remark</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading leave requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => {
                  const isPending = String(req.leaveStatus) === APP_CONSTANTS.LEAVE_STATUS.PENDING;
                  const startStr = req.startDate ? new Date(req.startDate).toLocaleDateString() : '';
                  const endStr = req.endDate ? new Date(req.endDate).toLocaleDateString() : '';

                  return (
                    <tr key={req._id || req.id || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} color="var(--primary)" />
                          <span style={{ fontWeight: 600 }}>{req.userName || req.employeeName || req.userKey || 'Employee'}</span>
                        </div>
                      </td>
                      <td>{req.leaveName || (req.leaveType === '1' ? 'Casual/Sick Leave' : req.leaveType === '2' ? 'Annual Leave' : req.leaveType || 'General Leave')}</td>
                      <td>
                        <span className="badge badge-info">
                          {String(req.leaveDuration) === APP_CONSTANTS.LEAVE_DURATION.HALF_DAY ? 'Half Day' : 'Full Day'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>{startStr} - {endStr}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.reason || 'N/A'}
                      </td>
                      <td>{getStatusBadge(req.leaveStatus)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {req.adminRemark || '--'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedLeave(req);
                              setAdminRemark('');
                            }}
                          >
                            Review
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

      {/* Review & Approve / Reject Modal */}
      {selectedLeave && (
        <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarDays size={20} color="var(--primary)" />
                <h3>Review Leave Application</h3>
              </div>
              <button className="btn-icon" onClick={() => setSelectedLeave(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Applicant Name:</span>{' '}
                  <strong>{selectedLeave.userName || selectedLeave.employeeName || selectedLeave.userKey || 'Employee'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Leave Type:</span>{' '}
                  <strong>{selectedLeave.leaveName || (selectedLeave.leaveType === '1' ? 'Casual/Sick Leave' : selectedLeave.leaveType === '2' ? 'Annual Leave' : selectedLeave.leaveType || 'General Leave')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Duration:</span>{' '}
                  <strong>
                    {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                    {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reason:</span>{' '}
                  <p style={{ marginTop: '0.2rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    "{selectedLeave.reason || 'No description provided'}"
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Remarks / Note</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Optional comments for employee..."
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleAdminAction(APP_CONSTANTS.LEAVE_STATUS.REJECTED)}
                disabled={submitting}
              >
                <XCircle size={16} />
                <span>Reject</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAdminAction(APP_CONSTANTS.LEAVE_STATUS.APPROVED)}
                disabled={submitting}
              >
                <CheckCircle2 size={16} />
                <span>Approve Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
