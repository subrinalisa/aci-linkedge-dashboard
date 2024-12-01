<template>
  <a-layout class="h-screen">
    <Menu />
    <a-layout>
      <Header />
      <a-layout-content style="margin: 16px 0 0">
        <div class="p-5 bg-white h-full overflow-y-auto">
          <slot></slot>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import Header from "./Header.vue";
import Menu from "./Menu.vue";
</script>
