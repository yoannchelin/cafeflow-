import axios from "axios";
import { clearSession, getAccessToken, setSession, getSession } from "./auth";
import type { LoginResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await api.post<{ accessToken: string; user: { email: string; role: string } }>(
      "/api/auth/refresh",
      {}
    );
    const { accessToken, user } = res.data;
    setSession(accessToken, user.email, user.role);
    return accessToken;
  } catch {
    clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (!original) throw err;

    if (err.response?.status === 401 && !original.__retried) {
      original.__retried = true;

      if (!refreshing) refreshing = refreshAccessToken();
      const token = await refreshing;
      refreshing = null;

      if (token) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return api.request(original);
      }
    }
    throw err;
  }
);

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>("/api/auth/login", { email, password });
  const { accessToken, user } = res.data;
  setSession(accessToken, user.email, user.role);
  return res.data;
}

export async function logout() {
  await api.post("/api/auth/logout", {});
  clearSession();
}

export function isAuthed() {
  const { token } = getSession();
  return Boolean(token);
}

export default api;
