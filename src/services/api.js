import axios from "axios";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
});

// 요청 인터셉터 - 모든 요청에 액세스 토큰 추가
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 리프레시 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // 액세스 토큰이 만료된 경우 (401 에러)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const response = await api.post(
          "/auth/refresh",
          { refreshToken: authStore.refreshToken }
        );

        const { accessToken } = response.data;

        // 새 액세스 토큰 저장
        authStore.setAccessToken(accessToken);

        // 원래 요청 재시도
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        authStore.logout();
        router.push("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
