import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";
import Login from "@/views/Login.vue";
import Dashboard from "@/views/dashboard/index.vue";
import Home from "@/views/Home.vue";
// Users
import Users from "@/views/users/index.vue";
import UserEdit from "@/views/users/user-edit.vue";
import Role from "@/views/users/role.vue";
import RoleCreate from "@/views/users/role-create.vue";
import RoleEdit from "@/views/users/role-edit.vue";
import Permissions from "@/views/users/Permissions.vue";
import Permissionsadd from "@/views/users/Permissionsadd.vue";
import Permissionsedit from "@/views/users/Permissionsedit.vue";

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
    meta: { isPermission: "home" },
  },
  {
    path: "/reports/:id",
    name: "dynamic",
    component: Dashboard,
  },

  // User
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
    path: "/user/role",
    name: "role",
    component: Role,
    meta: { isPermission: "user" },
  },
  {
    path: "/user/role-create",
    name: "role-create",
    component: RoleCreate,
    meta: { isPermission: "user" },
  },
  {
    path: "/user/role/:id",
    name: "role-edit",
    component: RoleEdit,
    meta: { isPermission: "user" },
  },
  {
    path: "/user/permissions",
    name: "permissions",
    component: Permissions,
    meta: { isPermission: "user" },
  },
  {
    path: "/permission/create",
    name: "permission-create",
    component: Permissionsadd,
    meta: { isPermission: "user" },
  },
  {
    path: "/permissions/:id",
    name: "permission-edit",
    component: Permissionsedit,
    meta: { isPermission: "user" },
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
