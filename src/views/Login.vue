<template>
  <section class="w-full box-border overflow-x-hidden">
    <div class="flex flex-col md:flex-row h-screen items-center">
      <div class="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
        <img src="@/assets/images/login-bg.jpg" alt="bg" class="w-full h-full object-cover" />
      </div>

      <div
        class="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center"
      >
        <div class="w-full h-100">
          <h1 class="text-xl md:text-2xl font-bold leading-tight mt-12">Log in to your account</h1>
          <form class="mt-6" @submit.prevent="handleLogin(data, $router)">
            <div>
              <label class="block text-gray-700">User ID</label>
              <input
                type="text"
                placeholder="Enter User ID"
                class="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                autofocus
                required
                v-model="data.user_id"
              />
            </div>
            <div class="mt-4">
              <label class="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                class="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                required
                v-model="data.password"
              />
            </div>

            <button
              type="submit"
              class="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white text-base font-semibold rounded-lg px-4 py-3 mt-6"
            >
              Log In <a-spin class="white-spinner ml-2" v-if="isLoading" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { apiBase } from "@/config";
import axios from "axios";
import { ref } from "vue";
import Cookies from "js-cookie";
import { showNotification } from "@/utilities/notification";

const data = ref({
  user_id: "",
  password: "",
});
const isLoading = ref(false);

const handleLogin = async (data, router) => {
  isLoading.value = true;

  try {
    const response = await axios.post(`${apiBase}/login`, data);
    isLoading.value = false;
    if (response?.data?.status === "success") {
      const userInfo = response?.data?.user;
      Cookies.set("token", response?.data?.token);

      const permissions = response?.data?.user?.all_permissions?.map(
        (permission) => permission.name
      );
      localStorage.setItem(
        "all_permissions",
        JSON.stringify(response?.data?.user?.all_permissions)
      );
      localStorage.setItem("permissions", JSON.stringify(permissions));
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      showNotification(
        "success",
        response?.data?.message || "Welcome back! You've successfully logged in"
      );
      router.push({ name: "home" });
    }
  } catch (error) {
    isLoading.value = false;
    Cookies.remove("token");
    if (error?.response?.data?.status == "error")
      showNotification(
        "error",
        error?.response?.data?.error || "Login failed. Please check your credentials and try again"
      );
    else showNotification("error", error?.message);
  }
};
</script>

<style>
.white-spinner .ant-spin-dot-item {
  background: #fff !important;
}
</style>
