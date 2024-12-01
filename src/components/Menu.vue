<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    collapsible
    class="overflow-y-auto whitespace-nowrap"
    width="250"
    collapsedWidth="50"
  >
    <a-menu
      v-model:openKeys="state.openKeys"
      v-model:selectedKeys="state.selectedKeys"
      mode="inline"
      theme="dark"
      :inline-collapsed="state.collapsed"
      :items="items"
    ></a-menu>
  </a-layout-sider>
</template>

<script setup>
import { ref, watch, reactive, h, onMounted } from "vue";
import { HomeOutlined, PieChartOutlined, UserOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const state = reactive({
  openKeys: [],
  selectedKeys: [route.path],
});
const allpermissions = ref(
  JSON.parse(localStorage.getItem("all_permissions")).map((item) => ({
    key: `/${item?.name?.replace(/\s+/g, "_")}`,
    label: item?.name,
    onClick: () =>
      router.push({ name: "dynamic", params: { id: item?.name?.replace(/\s+/g, "_") } }),
  }))
);

const items = reactive([
  {
    key: "/home",
    label: "Home",
    icon: () => h(HomeOutlined),
    onClick: () => router.push("/home"),
  },
  {
    key: "dashboards",
    label: "My Dashboards",
    icon: () => h(PieChartOutlined),
    children: allpermissions.value,
  },

  ...(userInfo?.user_id == "123456"
    ? [
        {
          key: "permissions",
          label: "Manage Permissions",
          icon: () => h(UserOutlined),
          children: [
            {
              key: "/permissions",
              label: "Manage Dashboards",
              onClick: () => router.push("/permissions"),
            },
            {
              key: "/user",
              label: "Manage Users",
              onClick: () => router.push("/user"),
            },
          ],
        },
      ]
    : []),
]);

watch(
  () => route.path,
  (newPath) => {
    const parentKey = items.find((item) =>
      item.children?.some((child) => newPath.startsWith(child.key))
    )?.key;

    state.openKeys = parentKey ? [parentKey] : [];
    state.selectedKeys = [
      items
        .flatMap((item) => (item.children ? item.children : item))
        .find((child) => newPath.startsWith(child.key))?.key || newPath,
    ];
  },
  { immediate: true }
);

onMounted(() => {
  if (window.innerWidth < 760) collapsed.value = true;
});
</script>
