<template>
  <a-layout-header style="background: #fff; padding: 0 16px">
    <div class="flex justify-end items-center">
      <div>
        <ul class="flex items-center space-x-3 list-none p-0 profile-menu">
          <li class="hidden md:block">
            <span class="font-bold">{{ time }}</span>
          </li>
          <li class="hidden md:block">
            <span class="font-bold">{{ date }}</span>
          </li>
          <li>
            <a-dropdown :trigger="['click']">
              <a class="ant-dropdown-link cursor-pointer" @click.prevent>
                <i class="bi bi-person-circle text-lg mr-2 text-indigo-500"></i>
                <span class="text-xs lg:text-base">{{ userInfo?.name }} </span>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <button type="button" class="w-full text-left" @click="handleLogout($router)">
                      Logout
                    </button>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </li>
        </ul>
      </div>
    </div></a-layout-header
  >
  <!-- <header class="mb-4 ml-20 mr-3"> -->
  <!-- <div class="flex justify-end items-center">
      <div>
        <ul class="flex items-center space-x-3 list-none p-0 profile-menu">
          <li class="hidden md:block">
            <span class="font-bold">{{ time }}</span>
          </li>
          <li class="hidden md:block">
            <span class="font-bold">{{ date }}</span>
          </li>
          <li>
            <a-dropdown :trigger="['click']">
              <a class="ant-dropdown-link cursor-pointer" @click.prevent>
                <i class="bi bi-person-circle text-lg mr-2 text-indigo-500"></i>
                <span class="text-xs lg:text-base"
                  >{{ userInfo?.name }} ({{ userInfo?.email }})</span
                >
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <button type="button" class="w-full text-left" @click="handleLogout($router)">
                      Logout
                    </button>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </li>
        </ul>
      </div>
    </div> -->
  <!-- </header> -->
</template>

<script setup>
import Cookies from "js-cookie";
import { onMounted, ref } from "vue";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));

let timeOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

let dateOptions = {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
};

let time = ref();
let date = ref();

function updateDateTime() {
  let now = new Date();
  time.value = now.toLocaleString("en-US", timeOptions);
  date.value = now.toLocaleString("en-US", dateOptions);
}

onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 60000);
});

const handleLogout = (router) => {
  Cookies.remove("token");
  localStorage.clear();
  router.push({ name: "login" });
};
</script>
