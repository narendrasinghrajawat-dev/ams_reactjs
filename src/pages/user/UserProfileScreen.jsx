import React, { useState } from 'react';
import { User, Mail, Phone, Building, Briefcase, Lock, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/endpoints';

export const UserProfileScreen = () => {
  const { currentUser, logout } = useAuth();
  const userKey = currentUser?.key || currentUser?.id || '';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.post(API_ENDPOINTS.USER_CHANGE_PASSWORD, {
        userKey: userKey,
        newPassword: newPassword,
      });

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Profile</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Personal details, employment information, and security settings.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: message.type === 'success' ? 'var(--success-text)' : 'var(--error-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '2rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge badge-info">
                {currentUser?.designation || 'Employee'}
              </span>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

        {/* Detailed Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</div>
              <div style={{ fontWeight: 600 }}>{currentUser?.email || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Phone size={18} color="var(--secondary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone Number</div>
              <div style={{ fontWeight: 600 }}>{currentUser?.phone || '+91 9876543210'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building size={18} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Department</div>
              <div style={{ fontWeight: 600 }}>{currentUser?.department || 'Engineering'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase size={18} color="var(--info)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Employee ID / Key</div>
              <div style={{ fontWeight: 600 }}>{userKey || 'EMP001'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Lock size={20} color="var(--primary)" />
          <h4 style={{ fontSize: '1.15rem' }}>Change Security Password</h4>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
