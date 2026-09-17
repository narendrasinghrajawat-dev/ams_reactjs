import React, { createContext, useContext, useState, useEffect } from 'react';
import { APP_CONSTANTS } from '../constants/appConstants';
import { getBaseUrl, setCustomBaseUrl } from '../services/apiService';

const ServerConfigContext = createContext();

export const ServerConfigProvider = ({ children }) => {
  const [currentUrl, setCurrentUrl] = useState(getBaseUrl());
  const [serverStatus, setServerStatus] = useState('idle'); // 'idle' | 'checking' | 'connected' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const checkConnection = async (targetUrl = currentUrl) => {
    setServerStatus('checking');
    setStatusMessage('Pinging server...');
    try {
      const cleanUrl = targetUrl.endsWith('/') ? targetUrl.slice(0, -1) : targetUrl;
      const res = await fetch(`${cleanUrl}/masterdata`, { method: 'GET' });
      if (res.ok) {
        setServerStatus('connected');
        setStatusMessage('Server online & responsive');
        return true;
      } else {
        setServerStatus('error');
        setStatusMessage(`Server replied with status ${res.status}`);
        return false;
      }
    } catch (err) {
      setServerStatus('error');
      setStatusMessage('Unable to reach server. Check URL or CORS.');
      return false;
    }
  };

  useEffect(() => {
    checkConnection(currentUrl);
  }, [currentUrl]);

  const updateServerUrl = (newUrl) => {
    setCustomBaseUrl(newUrl);
    setCurrentUrl(getBaseUrl());
  };

  const resetToDefault = () => {
    setCustomBaseUrl(null);
    setCurrentUrl(APP_CONSTANTS.DEFAULT_API_URL);
  };

  const setLocalhost = () => {
    setCustomBaseUrl(APP_CONSTANTS.LOCAL_API_URL);
    setCurrentUrl(APP_CONSTANTS.LOCAL_API_URL);
  };

  return (
    <ServerConfigContext.Provider
      value={{
        currentUrl,
        serverStatus,
        statusMessage,
        updateServerUrl,
        resetToDefault,
        setLocalhost,
        checkConnection,
      }}
    >
      {children}
    </ServerConfigContext.Provider>
  );
};

export const useServerConfig = () => useContext(ServerConfigContext);
