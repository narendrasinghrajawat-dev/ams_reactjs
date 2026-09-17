export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',

  // Master Data
  MASTER_DATA: '/masterdata',

  // Admin APIs
  ADMIN_CREATE_USER: '/admin/create-user',
  ADMIN_USER_LIST: '/admin/user-list',
  ADMIN_UPDATE_USER: '/admin/update-user/', // append :key
  ADMIN_DELETE_USER: '/admin/delete-user/', // append :key
  ADMIN_GET_TOTAL_ATTENDANCE: '/admin/getTotalAttendance',
  ADMIN_GET_ALL_LEAVE_REQUESTS: '/admin/getAllLeavesRequests',
  ADMIN_ACTION_ON_LEAVE: '/admin/adminActionOnLeaveRequest',
  ADMIN_FETCH_LEAVES_BY_DATE: '/admin/fetchLeavesByDate/', // append :date
  ADMIN_FETCH_ATTENDANCE_BY_DATE: '/admin/fetchAttendanceByDate/', // append :date
  ADMIN_FETCH_ACTIVITIES_BY_DATE: '/admin/fetchActivitiesByDate/', // append :date
  ADMIN_CHANGE_USER_PASSWORD: '/admin/changeUserPasswordByAdmin',
  ADMIN_ADD_LEAVES: '/admin/addLeavesByAdmin',
  ADMIN_GET_ALL_ADDED_LEAVES: '/admin/getAllLeavesByAdmin',
  ADMIN_ADD_HOLIDAY: '/admin/addHoliday',

  // User APIs
  USER_PUNCH: '/user/attendance/punch',
  USER_ALL_ATTENDANCE_ACTIVITY: '/user/attendance/getAllAttedanceActivity/', // append :userKey
  USER_ACTIVITIES_BY_DATE: '/user/attendance/getActivitiesByDate/', // append :userKey/:date
  USER_GET_TAKEN_MONTH_WFH: '/user/attendance/getAllTakenCurrentMonthWFH/', // append :userKey
  USER_GET_LEAVES_STATUS: '/user/leaves/getLeavesStatus/', // append :userKey
  USER_GET_LEAVES_BALANCE: '/user/leaves/getLeavesBalance/', // append :userKey
  USER_APPLY_LEAVES: '/user/leaves/applyLeaves',
  USER_CANCEL_LEAVE: '/user/leaves/cancel/', // append :leaveId
  USER_CHANGE_PASSWORD: '/user/changePasswordByUser',
  USER_GET_CALENDAR: '/user/getUserCalendar/', // append :userKey/:year
};
