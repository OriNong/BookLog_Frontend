// src/stores/auth.js
import { defineStore } from "pinia";
import Cookies from "js-cookie";
import { authService } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: Cookies.get("accessToken") || null,
    refreshToken: Cookies.get("refreshToken") || null,
    isAuthenticated: !!Cookies.get("accessToken"),
  }),

  actions: {
    async login(email, password) {
      const res = await authService.login(email, password);
      console.log(res.accessToken);
      this.setTokens(res.accessToken, res.refreshToken);
      this.user = res.user;
      this.isAuthenticated = true;
    },

    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;
      Cookies.set("accessToken", accessToken, { expires: 1 / 24 }); // 1시간
      Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7일
    },

    setAccessToken(accessToken) {
      this.accessToken = accessToken;
      Cookies.set('accessToken', accessToken, {
        expires: 1 / 24,
        path: '/',
        sameSite: 'Lax',
        secure: false,
      });
      
    },

    async fetchUserInfo() {
      try {
        const user = await authService.getUserInfo(); // GET /auth/user
        this.user = user;
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
