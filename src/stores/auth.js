import { defineStore } from "pinia";
import { authService } from "@/services/authService";
import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: Cookies.get("accessToken") || null,
    refreshToken: Cookies.get("refreshToken") || null,
    isAuthenticated: !!Cookies.get("accessToken"),
  }),

  actions: {
    // 로그인 액션
    async login(email, password) {
      try {
        const response = await authService.login(email, password);

        // 토큰 및 사용자 정보 저장
        this.setTokens(response.accessToken, response.refreshToken);
        this.user = response.user;
        this.isAuthenticated = true;

        return this.user;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },

    // 토큰 설정
    setTokens(accessToken, refreshToken) {
      // 상태 업데이트
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;

      // 쿠키에 저장 
      Cookies.set("accessToken", accessToken, { expires: 1 / 24 }); // 1시간
      Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7일
    },

    // 액세스 토큰만 갱신
    setAccessToken(accessToken) {
      this.accessToken = accessToken;
      Cookies.set("accessToken", accessToken, { expires: 1 / 24 }); // 1시간
    },

    // 로그아웃
    async logout() {
      try {
        // 서버에 로그아웃 요청 (선택적)
        if (this.isAuthenticated) {
          await authService.logout();
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // 로컬 상태 및 쿠키 삭제
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;

        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
      }
    },

    // 현재 사용자 정보 로드
    async fetchUserInfo() {
      try {
        if (this.isAuthenticated) {
          const user = await authService.getUserInfo();
          this.user = user;
          return user;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        // 인증 오류인 경우 자동 처리됨 (인터셉터에 의해)
        throw error;
      }
    },
  },
});
