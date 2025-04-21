import { defineStore } from "pinia";
import AuthService from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    error: null,
  }),
  actions: {
    async login(email, password) {
      try {
        const userData = await AuthService.login(email, password);
        this.user = userData;
        this.isAuthenticated = true;
        this.error = null;
      } catch (error) {
        this.error = error.message;
        this.isAuthenticated = false;
      }
    },
    async signup(userData) {
      try {
        const newUser = await AuthService.signup(userData);
        this.user = newUser;
        this.isAuthenticated = true;
        this.error = null;
      } catch (error) {
        this.error = error.message;
        this.isAuthenticated = false;
      }
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
