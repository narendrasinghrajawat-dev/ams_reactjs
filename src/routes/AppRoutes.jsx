import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute, UserRoute, AdminRoute } from '../components/auth/RouteGuards';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginScreen } from '../pages/auth/LoginScreen';

// User Screens
import { UserDashboard } from '../pages/user/UserDashboard';
import { UserLeavesScreen } from '../pages/user/UserLeavesScreen';
import { UserActivityScreen } from '../pages/user/UserActivityScreen';
import { UserCalendarScreen } from '../pages/user/UserCalendarScreen';
import { UserProfileScreen } from '../pages/user/UserProfileScreen';

// Admin Screens
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminEmployeesScreen } from '../pages/admin/AdminEmployeesScreen';
import { AdminLeavesScreen } from '../pages/admin/AdminLeavesScreen';
import { AdminActivityScreen } from '../pages/admin/AdminActivityScreen';
import { AdminProfileScreen } from '../pages/admin/AdminProfileScreen';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginScreen />} />
      </Route>

      {/* User Portal Routes */}
      <Route element={<UserRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/leaves" element={<UserLeavesScreen />} />
          <Route path="/user/activity" element={<UserActivityScreen />} />
          <Route path="/user/calendar" element={<UserCalendarScreen />} />
          <Route path="/user/profile" element={<UserProfileScreen />} />
        </Route>
      </Route>

      {/* Admin Portal Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<AdminEmployeesScreen />} />
          <Route path="/admin/leaves" element={<AdminLeavesScreen />} />
          <Route path="/admin/activity" element={<AdminActivityScreen />} />
          <Route path="/admin/profile" element={<AdminProfileScreen />} />
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
