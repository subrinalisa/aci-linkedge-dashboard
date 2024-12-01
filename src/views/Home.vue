<template>
  <MainLayout>
    <div class="grid grid-cols-5 gap-3">
      <button
        class="w-full block border text-center p-3"
        v-for="(item, index) in allpermissions"
        :key="index"
        @click="$router.push({ name: 'dynamic', params: { id: item?.params } })"
      >
        <h2 class="text-secondary font-semibold mb-1 text-base">{{ item?.title }}</h2>
        <button type="button" class="font-semibold">Open</button>
      </button>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref } from "vue";

const allpermissions = ref(
  JSON.parse(localStorage.getItem("all_permissions")).map((item) => ({
    title: item?.name,
    icon: "bi bi-house",
    path: "dynamic",
    params: item?.name?.replace(/\s+/g, "_"),
    key: item?.name,
  }))
);
</script>

<style lang="scss" scoped></style>
