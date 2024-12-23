<template>
  <MainLayout>
    <div class="md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      <button
        class="w-full text-left border rounded flex justify-between items-start gap-x-2 p-4 shadow-md hover:border-secondary transition duration-300 ease-in-out mb-3"
        v-for="(item, index) in allpermissions"
        :key="index"
        @click="$router.push({ name: 'dynamic', params: { id: item?.params } })"
      >
        <h2 class="font-medium">{{ item?.title }}</h2>
        <BarChartOutlined class="text-secondary text-2xl" />
      </button>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { BarChartOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";

const allpermissions = ref(
  JSON.parse(localStorage.getItem("all_permissions")).map((item) => ({
    title: item?.name,
    path: "dynamic",
    params: item?.id,
  }))
);
</script>
