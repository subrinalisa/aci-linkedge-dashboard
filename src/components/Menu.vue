<template>
  <a-layout-sider v-model:collapsed="collapsed" collapsible width="250" collapsedWidth="50">
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      theme="dark"
      mode="inline"
    >
      <!-- Home -->

      <a-menu-item key="home">
        <router-link :to="{ name: 'home' }" class="flex gap-x-2 items-center">
          <HomeOutlined />
          <span>Home</span>
        </router-link>
      </a-menu-item>
      <!-- My Dashboards -->
      <a-sub-menu :key="myDashboards?.key">
        <template #title>
          <span class="flex gap-x-2 items-center">
            <DashboardOutlined />
            <span>{{ myDashboards?.title }}</span>
          </span>
        </template>
        <a-menu-item v-for="item in myDashboards?.child" :key="item?.key">
          <router-link
            :to="{ name: item?.path, params: { id: item?.params } }"
            class="flex gap-x-2 items-center"
          >
            <DashboardOutlined />
            <span>{{ item?.title }}</span>
          </router-link>
        </a-menu-item>
      </a-sub-menu>
      <!-- All Menu -->
      <div v-for="(menu, index) in menuItems" :key="index" v-if="userInfo?.user_id == '123456'">
        <!-- Menu Item -->
        <!-- <a-menu-item :key="menu?.key" v-if="!menu?.child">
          <router-link :to="{ name: menu?.path }" class="flex gap-x-2 items-center">
            <UserSwitchOutlined />
            <span>{{ menu?.title }}</span>
          </router-link>
        </a-menu-item> -->
        <!-- Sub Menu -->
        <a-sub-menu :key="menu?.key" v-if="menu?.child">
          <template #title>
            <span class="flex gap-x-2 items-center">
              <UserSwitchOutlined />
              <span>{{ menu?.title }}</span>
            </span>
          </template>
          <a-menu-item v-for="submenu in menu?.child" :key="submenu?.key">
            <router-link :to="{ name: submenu?.path }" class="flex gap-x-2 items-center">
              <DashboardOutlined />
              <span>{{ submenu?.title }}</span>
            </router-link>
          </a-menu-item>
        </a-sub-menu>
      </div>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { DashboardOutlined, HomeOutlined, UserSwitchOutlined } from "@ant-design/icons-vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

// Menu items data
const allpermissions = ref(
  JSON.parse(localStorage.getItem("all_permissions")).map((item) => ({
    title: item?.name,
    icon: "bi bi-house",
    path: "dynamic",
    params: item?.name?.replace(/\s+/g, "_"),
    key: item?.name?.replace(/\s+/g, "_"),
  }))
);
const myDashboards = ref({
  title: "My Dashboards",
  key: "dashboards",
  child: allpermissions.value,
});
const menuItems = ref([
  {
    title: "Manage Permissions",
    icon: "bi bi-people",
    key: "user",
    child: [
      {
        title: "Users",
        icon: "bi bi-house",
        path: "user",
        key: "user",
      },
      {
        title: "Management Dashboard",
        icon: "bi bi-house",
        path: "permissions",
        key: "permissions",
      },
      // {
      //   title: "Role",
      //   icon: "bi bi-house",
      //   path: "role",
      //   key: "role",
      // },
    ],
  },
  // myDashboards.value,
]);

const collapsed = ref(false);

const selectedKeys = ref([]);
const openKeys = ref([]);
const route = useRoute();

watch(
  () => route.name,
  (currentName) => {
    selectedKeys.value = [currentName];
    openKeys.value = [];

    const findParentKeys = (menuList, currentName) => {
      for (const menu of menuList) {
        if (menu.child) {
          if (menu.child.some((subMenu) => subMenu.path === currentName)) {
            openKeys.value.push(menu.key); // Add parent key
            return true; // Stop searching in deeper levels
          } else if (findParentKeys(menu.child, currentName)) {
            openKeys.value.push(menu.key); // Add parent key
            return true; // Stop searching in deeper levels
          }
        } else if (menu.path === currentName) {
          return true;
        }
      }
      return false;
    };

    findParentKeys(menuItems.value, currentName);

    // Special handling for "My Dashboards"
    if (currentName && currentName.startsWith("dynamic")) {
      openKeys.value.push("dashboards"); // Expand "My Dashboards"
      selectedKeys.value = [currentName];
    }
  },
  { immediate: true }
);
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
</script>
