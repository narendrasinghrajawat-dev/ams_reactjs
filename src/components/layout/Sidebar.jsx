import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarCheck,
  History,
  User,
  ShieldCheck,
  LogOut,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ onOpenSettings }) => {
  const { isAdmin, currentUser, logout } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/leaves', label: 'Leave Requests', icon: CalendarDays },
    { to: '/admin/activity', label: 'Activity Logs', icon: History },
    { to: '/admin/profile', label: 'My Profile', icon: ShieldCheck },
  ];

  const userLinks = [
    { to: '/user/dashboard', label: 'Attendance', icon: CalendarCheck },
    { to: '/user/leaves', label: 'My Leaves', icon: CalendarDays },
    { to: '/user/activity', label: 'Punch History', icon: History },
    { to: '/user/calendar', label: 'Year Calendar', icon: CalendarDays },
    { to: '/user/profile', label: 'My Profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            AMS <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>PRO</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Admin Console' : 'Employee Portal'}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            padding: '0 0.75rem 0.5rem',
          }}
        >
          Menu
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.18s ease',
              })}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Card & Actions */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <button
          className="btn btn-outline btn-sm"
          onClick={onOpenSettings}
          style={{ width: '100%', justifyContent: 'flex-start', gap: '0.6rem' }}
        >
          <Sliders size={16} />
          <span>Server & Settings</span>
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={logout}
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: '0.6rem',
            color: 'var(--error)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>

        {/* Mini profile pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-page)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
            </div>
            <div
              style={{
                fontSize: '0.725rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentUser?.email || ''}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
