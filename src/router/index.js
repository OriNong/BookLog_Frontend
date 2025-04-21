import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Main",
    component: () => import("../views/HomePage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginPage.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/UserRegisterPage.vue")
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
