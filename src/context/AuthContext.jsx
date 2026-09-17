import React, { createContext, useContext, useState, useEffect } from 'react';
import { APP_CONSTANTS } from '../constants/appConstants';
import { API_ENDPOINTS } from '../constants/endpoints';
import { apiService } from '../services/apiService';
import { getDeviceInformation } from '../utils/deviceInfo';
import { getCurrentLocation } from '../utils/locationService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_PROFILE);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN) || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isLoggedIn = !!currentUser && !!token;
  const roleId = currentUser?.roleId ? String(currentUser.roleId) : null;
  const isAdmin = roleId === APP_CONSTANTS.ROLES.ADMIN;
  const isUser = roleId === APP_CONSTANTS.ROLES.USER;

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // 1. Get browser location
      const locRes = await getCurrentLocation();
      const lat = locRes.coords?.latitude || 26.9124;
      const lng = locRes.coords?.longitude || 75.7873;

      // 2. Get device information
      const deviceInfo = getDeviceInformation();

      // 3. Build Login payload
      const loginPayload = {
        email: email.trim(),
        password: password.trim(),
        lat: lat,
        long: lng,
        deviceInformation: deviceInfo,
      };

      // 4. Send API request
      const res = await apiService.post(API_ENDPOINTS.LOGIN, loginPayload, { noAuth: true });

      // In response: res might be { data: user, token: '...' } or user object
      const userData = res?.data || res?.user || res;
      const authToken = res?.token || userData?.token;

      if (!userData || !authToken) {
        throw new Error(res?.message || 'Invalid server response during login');
      }

      // 5. Store session
      setCurrentUser(userData);
      setToken(authToken);
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, authToken);
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.DEVICE_INFO, JSON.stringify(deviceInfo));
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.LOGIN_LAT, String(lat));
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.LOGIN_LNG, String(lng));

      if (rememberMe) {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.REMEMBER_ME, 'true');
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.SAVED_EMAIL, email.trim());
      } else {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.SAVED_EMAIL);
      }

      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Login failed. Please verify your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
    setCurrentUser(null);
    setToken(null);
  };

  const updateCurrentUser = (updatedData) => {
    const merged = { ...currentUser, ...updatedData };
    setCurrentUser(merged);
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER_PROFILE, JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoggedIn,
        isAdmin,
        isUser,
        roleId,
        isLoading,
        authError,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
