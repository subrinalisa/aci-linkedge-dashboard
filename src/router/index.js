import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";
import Login from "@/views/Login.vue";
import Dashboard from "@/views/dashboard/index.vue";
import Home from "@/views/Home.vue";
// Users
import Users from "@/views/users/index.vue";
import UserEdit from "@/views/users/user-edit.vue";
// Permissions
import Permissions from "@/views/users/permissions.vue";
import PermissionsEdit from "@/views/users/permissions-edit.vue";
const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
  },
  {
    path: "/home",
    name: "home",
    component: Home,
  },
  {
    path: "/:id",
    name: "dynamic",
    component: Dashboard,

  },
  {
    path: "/user",
    name: "user",
    component: Users,
  },
  {
    path: "/user/:id",
    name: "user-edit",
    component: UserEdit,
  },
  {
    path: "/permissions",
    name: "permissions",
    component: Permissions,
  },
  {
    path: "/permissions/:id",
    name: "permission-edit",
    component: PermissionsEdit,
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = Cookies.get("token");
  if ((to.path === "/") && !token) {
    next();
  } else if ((to.path === "/") && token) {
    next("/home");
  } else if (token) {
    next();
  } else {
    next("/");
  }
});
export default router;
