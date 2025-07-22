import axios, { AxiosRequestConfig } from 'axios';
import { safeLocalStorage } from './utils';

function getBaseURL() {
  const fallback = 'http://localhost:8000';
  if (typeof window === 'undefined') {
    return process.env.API_ENDPOINT || fallback;
  }
  // @ts-ignore
  return window.ENV?.API_ENDPOINT || fallback;
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = safeLocalStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          safeLocalStorage.setItem('accessToken', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        safeLocalStorage.removeItem('accessToken');
        safeLocalStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await api.get<T>(url, config);
  return data;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await api.post<T>(url, body, config);
  return data;
}

export default api;