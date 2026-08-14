import axios from 'axios';

export const TOKEN_KEY = 'itsm_token';
export const USER_KEY = 'itsm_user';

// All requests go through the Vite proxy (/api -> http://localhost:8082).
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: inject JWT bearer token ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: normalise errors, handle auth expiry ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    // Session expired / invalid token -> clear and bounce to login.
    if (status === 401) {
      const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!onAuthPage) {
        window.location.assign('/login?expired=1');
      }
    }

    // Build a human-readable message from the backend error contract.
    let message = 'Something went wrong. Please try again.';
    if (typeof data === 'string' && data.trim()) {
      message = data;
    } else if (data && typeof data === 'object') {
      message =
        data.message ||
        data.error ||
        (data.errors && Object.values(data.errors).join(', ')) ||
        message;
    } else if (error.message === 'Network Error') {
      message = 'Cannot reach the server. Is the backend running on port 8082?';
    }

    return Promise.reject(Object.assign(error, { friendlyMessage: message, status }));
  }
);

export default api;
