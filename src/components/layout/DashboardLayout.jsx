import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout = () => {
  const location = useLocation();

  // Determine current page title based on pathname
  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/dashboard')) return 'Admin Overview';
    if (pathname.includes('/admin/employees')) return 'Employee Directory';
    if (pathname.includes('/admin/leaves')) return 'Leave Management';
    if (pathname.includes('/admin/activity')) return 'Activity & Logs';
    if (pathname.includes('/admin/profile')) return 'Admin Profile';
    if (pathname.includes('/user/dashboard')) return 'Attendance Dashboard';
    if (pathname.includes('/user/leaves')) return 'Leave Portal';
    if (pathname.includes('/user/activity')) return 'Punch Logs';
    if (pathname.includes('/user/calendar')) return 'Attendance Calendar';
    if (pathname.includes('/user/profile')) return 'Employee Profile';
    return 'Dashboard';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header
          title={getPageTitle(location.pathname)}
        />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
