<template>
  <a-layout class="h-screen">
    <Menu />
    <a-layout>
      <Header />
      <a-layout-content>
        <div class="h-[100%] bg-white p-4 overflow-y-auto mt-4"><slot></slot></div>
      </a-layout-content>
      <a-layout-footer style="text-align: center; padding: 14px 16px">
        Created By MIS</a-layout-footer
      >
    </a-layout>
  </a-layout>
</template>

<script setup>
import Header from "./Header.vue";
import Menu from "./Menu.vue";
</script>
