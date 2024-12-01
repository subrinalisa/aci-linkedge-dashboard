<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import MainLayout from "@/components/MainLayout.vue";
import { apiBase } from "@/config";

import { useRouter } from "vue-router";

// Define props and emits
const props = defineProps({
  isDrawerOpen: Boolean,
  fetchUsers: Function,
});

const emit = defineEmits(["update:isDrawerOpen"]);

// State management
const isSnackbarVisible = ref(false);
const isLoading = ref(false);
const roleList = ref([]);

const form = reactive({
  name: "",
  email: "",
  password: "",
  roles: null,
});

// Reset function to clear form and close drawer
const reset = () => {
  emit("update:isDrawerOpen", false);
  form.name = "";
  form.email = "";
  form.password = "";
  form.roles = null;
};

// Get the router instance
const router = useRouter();

// Function to add new user
const addNewUser = async () => {
  isLoading.value = true;
  try {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await axios.post(`${apiBase}/register`, form, config);

    if (res) {
      router.push({ name: "users" });
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Fetch roles on component mount
onMounted(async () => {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await axios.get(`${apiBase}/roles`, config);
    roleList.value = res.data.role.map((role) => role.name); // Corrected mapping

    // const branches = await axios.get(`${apiBase}/all-branch`, config);
    // branchList.value = branches.data;
  } catch (err) {
    console.error(err);
  }
});
</script>

<template>
  <MainLayout>
    <form @submit.prevent="addNewUser">
      <table class="w-full">
        <tbody>
          <tr class="border-white">
            <td class="text-sm w-[8%] text-start font-semibold p-2">
              <label for="name">Name</label>
            </td>
            <td class="p-2">
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Enter here..."
                class="w-full input-text"
                required
              />
            </td>
          </tr>

          <tr class="border-white">
            <td class="text-sm text-start font-semibold p-2">
              <label for="email">Email</label>
            </td>
            <td class="p-2">
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="example@demo.com"
                class="w-full input-text"
                required
              />
            </td>
          </tr>

          <tr class="border-white">
            <td class="text-sm text-start font-semibold p-2">
              <label for="password">Password</label>
            </td>
            <td class="p-2">
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Password"
                class="w-full input-text"
                required
              />
            </td>
          </tr>

          <tr class="border-white">
            <td class="text-sm text-start font-semibold p-2">
              <label for="roles">Select Role</label>
            </td>
            <td class="p-2">
              <select id="roles" v-model="form.roles" class="w-full input-text" required>
                <option v-for="(role, index) in roleList" :key="index">
                  {{ role }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex gap-4 mt-4">
        <button
          type="submit"
          class="px-4 py-2 min-w-32 inline-block bg-[#000180] text-white rounded-lg mt-3"
          :disabled="isLoading"
        >
          Submit
        </button>
        <button
          type="button"
          @click="$router.go(-1)"
          class="px-4 py-2 min-w-32 inline-block bg-gray-600 text-white rounded-lg mt-3 ml-2"
        >
          Cancel
        </button>
      </div>
    </form>
  </MainLayout>
</template>

<style scoped>
.scrollable-content {
  overflow-y: auto;
}
</style>
