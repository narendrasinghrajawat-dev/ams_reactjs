import { APP_CONSTANTS } from '../constants/appConstants';

export const getBaseUrl = () => {
  const savedCustomUrl = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.CUSTOM_API_URL);
  let url = savedCustomUrl || import.meta.env.VITE_API_BASE_URL || APP_CONSTANTS.DEFAULT_API_URL;
  // Ensure no trailing slash
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

export const setCustomBaseUrl = (url) => {
  if (!url) {
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.CUSTOM_API_URL);
  } else {
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.CUSTOM_API_URL, cleanUrl);
  }
};

const getHeaders = (options = {}) => {
  const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
    ...options.headers,
  };

  if (token && !options.noAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  let json = null;
  const text = await response.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
  }

  if (response.ok) {
    // If backend returns { data: [...], message: ... } or just data
    if (json && typeof json === 'object' && json.data !== undefined) {
      return json.data;
    }
    return json;
  }

  // Handle errors
  const errorMessage = json?.message || `HTTP Error ${response.status}: ${response.statusText}`;
  const error = new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  error.status = response.status;
  error.data = json;
  throw error;
};

export const apiService = {
  get: async (endpoint, options = {}) => {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(options),
      ...options,
    });
    return handleResponse(res);
  },

  post: async (endpoint, body = {}, options = {}) => {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(options),
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  patch: async (endpoint, body = {}, options = {}) => {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(options),
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  delete: async (endpoint, options = {}) => {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(options),
      ...options,
    });
    return handleResponse(res);
  },
};
