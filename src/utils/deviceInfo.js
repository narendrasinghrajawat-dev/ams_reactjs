export const getDeviceInformation = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown Browser';

  if (ua.includes('Firefox/')) {
    browserName = 'Mozilla Firefox';
  } else if (ua.includes('Edg/')) {
    browserName = 'Microsoft Edge';
  } else if (ua.includes('Chrome/')) {
    browserName = 'Google Chrome';
  } else if (ua.includes('Safari/')) {
    browserName = 'Apple Safari';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browserName = 'Opera';
  }

  let os = 'Web';
  if (navigator.userAgent.indexOf('Win') !== -1) os = 'Windows';
  if (navigator.userAgent.indexOf('Mac') !== -1) os = 'macOS';
  if (navigator.userAgent.indexOf('Linux') !== -1) os = 'Linux';
  if (navigator.userAgent.indexOf('Android') !== -1) os = 'Android';
  if (navigator.userAgent.indexOf('like Mac') !== -1) os = 'iOS';

  // Generate or retrieve persistent unique web client ID
  let uniqueId = localStorage.getItem('ams_web_unique_id');
  if (!uniqueId) {
    uniqueId = 'web_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('ams_web_unique_id', uniqueId);
  }

  return {
    os: os,
    uniqueId: uniqueId,
    isPhysicalDevice: false,
    browserName: browserName,
    appVersion: navigator.appVersion || '1.0.0',
    userAgent: ua,
    platform: navigator.platform || os,
    vendor: navigator.vendor || '',
    language: navigator.language || 'en',
  };
};
