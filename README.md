# AMS React.js Frontend (Attendance Management System)

A feature-complete, modern web application for the **Attendance Management System (AMS)** built with React 18, Vite, Lucide Icons, and modern design aesthetics (dark/light themes, glassmorphism cards, micro-animations, and responsive layout).

---

## Key Features

- **Full Parity with Flutter AMS**:
  - **User Portal**:
    - Interactive Punch In / Punch Out with live ticking working hours counter
    - Work From Home (WFH) toggle with automatic office distance (100m) check
    - Today's punch timestamps and monthly summary stats
    - Leave balances and Leave request manager with status filtering (Approved, Pending, Rejected, Cancelled)
    - Apply Leave modal (Half-day / Full-day, reason, date picker) & Cancel pending leave
    - Punch history log filterable by date
    - Monthly interactive visual attendance calendar
    - User Profile & Security Password updates
  - **Admin Portal**:
    - Organization overview with 5 core metrics: Total Employees, Present Today, Late Arrivals (>10:00 AM), On Leave Today, Pending Approvals
    - Date picker to inspect attendance records for any historical or future day
    - Real-time live activity stream combining punches and leave submissions
    - Employee directory with search, role filter, Add Employee, Edit Employee, and Delete Employee
    - Admin Password Reset for any user
    - Leave Balance Allocation for employees
    - Leave Approvals Manager: Review requests, provide admin remarks, Approve or Reject
    - Organization-wide daily attendance logs with geolocations, terminals, and devices
    - Admin Profile & credential management
- **Dynamic Backend Server URL**:
  - Automatically connects to Render live cloud backend: `https://ams-backend-w03p.onrender.com`
  - Allows runtime switching between Render, Localhost (`http://localhost:3000`), or custom backend URL via the in-app **Server & Settings** modal without rebuilding!
  - Built-in ping test to verify server connectivity directly in the UI.
- **Vercel Deployment Ready**:
  - Pre-configured `vercel.json` with SPA routing rewrite rules to avoid 404 on page refresh.

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## Deploying to Vercel

### Method 1: Using Vercel Web Dashboard (Recommended)
1. Push this repository to GitHub: `https://github.com/narendrasinghrajawat-dev/ams_reactjs.git`
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Import the `ams_reactjs` repository.
4. Keep the default Vite build preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. (Optional) Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://ams-backend-w03p.onrender.com`
6. Click **Deploy**. Vercel will build and assign you a live `.vercel.app` URL!

### Method 2: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
ams_reactjs/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/           # RouteGuards (AdminRoute, UserRoute, PublicRoute)
│   │   ├── common/         # SettingsModal (Dynamic Server URL & Theme)
│   │   └── layout/         # DashboardLayout, Sidebar, Header
│   ├── constants/          # endpoints.js, appConstants.js
│   ├── context/            # AuthContext, ThemeContext, ServerConfigContext
│   ├── pages/
│   │   ├── admin/          # AdminDashboard, AdminEmployees, AdminLeaves, AdminActivity, AdminProfile
│   │   ├── auth/           # LoginScreen
│   │   └── user/           # UserDashboard, UserLeaves, UserActivity, UserCalendar, UserProfile
│   ├── services/           # apiService.js (HTTP fetch client with dynamic base URL)
│   ├── styles/             # theme.css (CSS design tokens, dark mode)
│   ├── utils/              # deviceInfo.js, locationService.js
│   ├── App.jsx             # Top-level Router & Providers
│   ├── index.css           # Global typography, glassmorphic cards, buttons, badges
│   └── main.jsx
├── .env.example
├── .env
├── vercel.json             # Vercel SPA rewrite rules
├── package.json
└── vite.config.js
```
