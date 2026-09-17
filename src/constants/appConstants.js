export const APP_CONSTANTS = {
  APP_NAME: 'AMS',
  APP_VERSION: '1.0.0',
  DEFAULT_API_URL: 'https://ams-backend-w03p.onrender.com',
  LOCAL_API_URL: 'http://localhost:3000',

  STORAGE_KEYS: {
    TOKEN: 'token',
    USER_PROFILE: 'profileJson',
    DEVICE_INFO: 'device_information',
    SAVED_EMAIL: 'saved_email',
    REMEMBER_ME: 'remember_me',
    CUSTOM_API_URL: 'custom_api_url',
    THEME_MODE: 'pref_is_dark',
    APP_LANGUAGE: 'pref_language',
    AUTO_LOGIN: 'pref_auto_login',
    LOGIN_LAT: 'login_lat',
    LOGIN_LNG: 'login_long',
  },

  ROLES: {
    USER: '1',
    ADMIN: '2',
  },

  LEAVE_STATUS: {
    PENDING: '1',
    APPROVED: '2',
    REJECTED: '3',
    CANCELLED: '4',
  },

  PUNCH_TYPE: {
    CHECK_IN: '1',
    CHECK_OUT: '2',
  },

  LEAVE_DURATION: {
    FULL_DAY: '1',
    HALF_DAY: '2',
  },
};
