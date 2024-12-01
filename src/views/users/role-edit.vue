<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import MainLayout from "@/components/MainLayout.vue";
import { apiBase } from "@/config";

import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const emit = defineEmits(["update:isDrawerOpen"]);

const isSnackbarVisible = ref(false);
const isLoading = ref(false);
const permissionsList = ref([]);
const form = reactive({
  name: "",
  permission: [],
});

const roleId = ref(route.params.id || null);

const reset = () => {
  emit("update:isDrawerOpen", false);
  form.name = "";
  form.permission = [];
};

const addOrUpdateRole = async () => {
  if (!form.name || form.permission.length === 0) {
    isSnackbarVisible.value = true;
    return;
  }

  isLoading.value = true;
  try {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const payload = {
      name: form.name,
      permission: form.permission,
    };

    console.log("Payload:", payload);

    let res;
    if (roleId.value) {
      res = await axios.put(`${apiBase}/roles/${roleId.value}`, payload, config);
    } else {
      res = await axios.post(`${apiBase}/roles`, payload, config);
    }

    if (res.status === 200 || res.status === 201) {
      router.push({ name: "role" });
    } else {
      console.error(res.data.message);
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const fetchPermissions = async () => {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await axios.get(`${apiBase}/permissions`, config);
    permissionsList.value = res?.data?.permissions;
  } catch (err) {
    console.error(err);
  }
};

const fetchRoleData = async () => {
  if (!roleId.value) return;
  try {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axios.get(`${apiBase}/roles/${roleId.value}`, config);
    const roleData = res.data.role;
    form.name = roleData.name;
    form.permission = roleData.permissions.map((permission) => permission.name);
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  await fetchPermissions();
  if (roleId.value) {
    await fetchRoleData();
  }
});
</script>

<template>
  <MainLayout>
    <form @submit.prevent="addOrUpdateRole" class="space-y-6">
      <div class="space-y-4">
        <div class="flex flex-col">
          <label for="name" class="text-sm font-semibold mb-2">Role Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter role name.."
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readonly
          />
        </div>

        <div class="flex flex-col">
          <label for="permissions" class="text-sm font-semibold mb-2"
            >Select Dashboard Permissions
          </label>
          <div class="flex flex-col gap-2">
            <div
              v-for="(permission, index) in permissionsList"
              :key="index"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :id="`permission-${permission.name}`"
                :value="permission.name"
                v-model="form.permission"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label :for="`permission-${permission.name}`" class="ml-2 text-sm"
                >{{ permission?.name }} - {{ permission?.module }}</label
              >
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 mt-4">
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :disabled="isLoading"
        >
          Submit
        </button>
        <button
          type="button"
          @click="$router.go(-1)"
          class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
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
