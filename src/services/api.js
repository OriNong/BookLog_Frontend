import axios from "axios";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import Cookies from "js-cookie";
import { authService } from "./authService";

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

    // accessToken 만료로 401 → refresh 시도
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await authService.refresh(auth.refreshToken);
        console.log("🎫 새로 발급받은 accessToken:", newAccessToken);

        auth.setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // 원래 요청 재시도
      } catch (refreshErr) {
        console.error("🔐 Refresh Token 만료 또는 위조됨. 로그아웃 처리");
        await auth.logout();
        router.push("/");
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
