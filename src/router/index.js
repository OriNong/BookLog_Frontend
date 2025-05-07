import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    name: "Login",
    component: () => import("../pages/LoginPage.vue"),
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("../pages/HomePage.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../pages/UserRegisterPage.vue"),
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("../pages/BookSearchResult.vue"),
  },
  {
    path: '/book/:isbn',
    name: 'BookDetail',
    component: () => import('../pages/BookDetail.vue') 
  },  
  {
    path: '/bookcase',
    name: 'BookCase',
    component: () => import("../pages/BookcasePage.vue"),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // accessToken 없을 경우 쿠키에서 복원
  if (!auth.accessToken) {
    await auth.initialize(); // 쿠키 기반으로 복원
  }

  // 인증이 필요한 페이지 접근 제한 (선택)
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/");
  }

  next();
});

export default router;
