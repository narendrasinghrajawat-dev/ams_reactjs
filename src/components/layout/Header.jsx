import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Header = ({ title, onToggleMobileNav }) => {
  const { isDark, toggleTheme } = useTheme();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleMobileNav && (
          <button className="btn-icon mobile-only" onClick={onToggleMobileNav} style={{ display: 'none' }}>
            <Menu size={20} />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {formattedDate} • <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formattedTime}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Theme Toggle Button */}
        <button className="btn-icon" onClick={toggleTheme} title="Toggle Light/Dark Theme">
          {isDark ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
};
