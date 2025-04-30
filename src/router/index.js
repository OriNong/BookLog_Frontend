import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Main",
    component: () => import("../pages/HomePage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/LoginPage.vue"),
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
    component: () => import('@/pages/BookDetail.vue')  // 또는 실제 경로에 맞게 수정
  },  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
