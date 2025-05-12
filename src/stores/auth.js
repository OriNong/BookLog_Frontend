// src/stores/auth.js
import { defineStore } from "pinia";
import Cookies from "js-cookie";
import { authService } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: {
      userId: null,
      email: null,
      nickname: null,
      createdAt: null,
      updatedAt: null,
    },
    accessToken: Cookies.get("accessToken") || null,
    refreshToken: Cookies.get("refreshToken") || null,
    isAuthenticated: !!Cookies.get("accessToken"),
  }),

  actions: {
    async login(email, password) {
      const res = await authService.login(email, password);
      console.log(res.accessToken);
      this.setTokens(res.accessToken, res.refreshToken);
      this.isAuthenticated = true;
    },

    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;

      const cookieOptions = {
        path: "/",        // 전체 경로 유효
        sameSite: "Lax",  // Lax는 로그인 후 자동 전송 가능
        secure: false,    // 로컬 환경에서 false, 배포 시 true(Https)
      };

      Cookies.set("accessToken", accessToken, {
        ...cookieOptions,
        expires: 1 / 24, // 1시간
      });

      Cookies.set("refreshToken", refreshToken, {
        ...cookieOptions,
        expires: 7, // 7일
      });
    },

    setAccessToken(accessToken) {
      this.accessToken = accessToken;
      Cookies.set("accessToken", accessToken, {
        path: "/",
        sameSite: "Lax",
        secure: false,
        expires: 1 / 24,
      });
    },

    async fetchUserInfo() {
      try {
        const res = await authService.getUserInfo(); // GET /auth/user
        this.user = {
          userId: res.userId,
          email: res.email,
          nickname: res.nickname,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
        };
      } catch (err) {
        this.logout();
      }
    },

    initialize() {
      this.accessToken = Cookies.get("accessToken") || null;
      this.refreshToken = Cookies.get("refreshToken") || null;
      this.isAuthenticated = !!this.accessToken;

      if (this.isAuthenticated) {
        this.fetchUserInfo().catch(() => this.logout());
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch (err) {
        console.log(err);
      }

      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
});
