import axios from "axios";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - accessToken 삽입
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  const token = auth.accessToken || Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - accessToken 만료 시 refresh 시도
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const auth = useAuthStore();
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post("/auth/refresh", {
          refreshToken: auth.refreshToken,
        });

        const { accessToken } = response.data;
        auth.setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        await auth.logout();
        router.push("/");
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
