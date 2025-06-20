import axios, { AxiosRequestConfig } from 'axios';

function getBaseURL() {
  const fallback = 'http://localhost:4000';
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
