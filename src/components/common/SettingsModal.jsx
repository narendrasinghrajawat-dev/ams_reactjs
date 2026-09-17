import React, { useState } from 'react';
import { X, Server, RefreshCw, Sun, Moon, Trash2, Check, AlertCircle } from 'lucide-react';
import { useServerConfig } from '../../context/ServerConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_CONSTANTS } from '../../constants/appConstants';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { currentUrl, serverStatus, statusMessage, updateServerUrl, resetToDefault, setLocalhost, checkConnection } = useServerConfig();
  const { isDark, toggleTheme } = useTheme();

  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isSaved, setIsSaved] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    updateServerUrl(inputUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      localStorage.removeItem('ams_web_unique_id');
      setClearingCache(false);
      alert('Local cache cleared successfully');
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Server size={20} color="var(--primary)" />
            <h3>System Settings & Server URL</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Server URL Section */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Backend API Server URL</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: serverStatus === 'connected' ? 'var(--success)' : serverStatus === 'checking' ? 'var(--warning)' : 'var(--error)',
                }}
              >
                {serverStatus === 'connected' ? <Check size={12} /> : <AlertCircle size={12} />}
                {statusMessage}
              </span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
              <input
                type="text"
                className="form-control"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://your-api.onrender.com"
              />
              <button className="btn btn-primary" onClick={handleSaveUrl}>
                {isSaved ? <Check size={16} /> : 'Apply'}
              </button>
            </div>
            
            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setInputUrl(APP_CONSTANTS.DEFAULT_API_URL);
                  resetToDefault();
                }}
              >
                Render Live Cloud
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setInputUrl(APP_CONSTANTS.LOCAL_API_URL);
                  setLocalhost();
                }}
              >
                Localhost (3000)
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => checkConnection(inputUrl)}
              >
                <RefreshCw size={12} /> Test Ping
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

          {/* Theme Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Theme Appearance</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Switch between Light & Dark modes
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={toggleTheme} style={{ display: 'flex', gap: '0.5rem' }}>
              {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Clear Cache */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Storage & Cache</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Clear client cache and persistent device tokens
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleClearCache} disabled={clearingCache}>
              <Trash2 size={16} color="var(--error)" />
              {clearingCache ? 'Clearing...' : 'Clear Cache'}
            </button>
          </div>

          {/* App Version */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AMS Web Client Version</span>
            <span className="badge badge-info">{APP_CONSTANTS.APP_VERSION} (Production Build)</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
