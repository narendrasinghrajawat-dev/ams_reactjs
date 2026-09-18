import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, MapPin, Laptop, AlertCircle, ArrowRight, KeyRound, ShieldCheck, UserCheck, Copy, Check, X, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, isLoading, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    const isRemembered = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.REMEMBER_ME) === 'true';
    const savedEmail = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SAVED_EMAIL);
    if (isRemembered && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password, rememberMe);
    if (res.success) {
      if (res.user?.roleId === APP_CONSTANTS.ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  };

  const handleAutoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('admin@gmail.com');
    } else {
      setEmail('user@gmail.com');
      setPassword('user@gmail.com');
    }
    setShowDemoModal(false);
    setLocalError('');
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% -20%, rgba(13, 148, 136, 0.25), transparent 70%), var(--bg-page)',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Top Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={32} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Welcome to AMS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Enterprise Attendance & Leave Management
          </p>

          {/* Quick Demo Access Trigger */}
          <div style={{ marginTop: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <KeyRound size={14} />
              <span>Demo / Testing Credentials 🔑</span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {(localError || authError) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <div>{localError || authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.25rem',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '1.25rem 0',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>Remember me</span>
              </label>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ver 1.0.0
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick info notes */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} color="var(--primary)" />
              <span>Location Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Laptop size={13} color="var(--secondary)" />
              <span>Device Bound</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo / Testing Credentials Modal */}
      {showDemoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setShowDemoModal(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '1.75rem',
              position: 'relative',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.25rem',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Demo & Testing Credentials</h3>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Portfolio Showcase</span>
              </div>
            </div>

            {/* Notice */}
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(13, 148, 136, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(13, 148, 136, 0.2)',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                This is a live <strong>testing & evaluation build</strong> for portfolio review. Click <strong>Auto-Fill</strong> on either profile below to instantly populate and test the app.
              </div>
            </div>

            {/* Credentials List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Admin Card */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="var(--primary)" />
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Admin Profile</strong>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Full Access</span>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email: <code style={{ color: 'var(--primary)', fontWeight: 600 }}>admin@gmail.com</code>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Password: <code style={{ color: 'var(--primary)', fontWeight: 600 }}>admin@gmail.com</code>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleAutoFill('admin')}
                >
                  ⚡ Auto-Fill Admin Credentials
                </button>
              </div>

              {/* User Card */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <UserCheck size={16} color="var(--secondary)" />
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>User / Employee Profile</strong>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Self-Service</span>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email: <code style={{ color: 'var(--secondary)', fontWeight: 600 }}>user@gmail.com</code>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Password: <code style={{ color: 'var(--secondary)', fontWeight: 600 }}>user@gmail.com</code>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleAutoFill('user')}
                >
                  ⚡ Auto-Fill User Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
