import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function apiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) return err.response?.data?.error || fallback;
  return fallback;
}

export function isUnauthorized(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 401;
}
