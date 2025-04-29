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
    component: () => import("../pages/UserRegisterPage.vue")
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
