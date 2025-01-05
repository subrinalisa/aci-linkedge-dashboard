<script setup>
import { ref, onMounted } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import { useRoute } from "vue-router";
import { apiBase } from "@/config";
import axios from "axios";
import { showNotification } from "@/utilities/notification";
import Spinner from "@/components/Spinner.vue";
import Cookies from "js-cookie";

const config = {
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
};
const route = useRoute();
const { id } = route?.params;

/* Role List */
const roleLoading = ref(false);
const roleList = ref([]);

const getRoles = async () => {
  roleLoading.value = true;
  try {
    const res = await axios.get(`${apiBase}/roles`, config);
    roleLoading.value = false;
    roleList.value = res?.data?.role;
  } catch (err) {
    roleList.value = [];
    roleLoading.value = false;
  }
};
/* Permission List */
const check_all_permission = ref(false);
const permissionLoading = ref(false);
const permissionList = ref([]);

const getPermission = async () => {
  permissionLoading.value = true;
  try {
    const res = await axios.get(`${apiBase}/permissions`, config);
    permissionLoading.value = false;
    permissionList.value = res?.data?.module_wise_permissions;
  } catch (err) {
    permissionList.value = [];
    permissionLoading.value = false;
  }
};
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    check_all_permission.value = true;

    permissionList.value &&
      Object.entries(permissionList.value).forEach(([moduleName, modulePermissions]) => {
        modulePermissions.check = true;
        modulePermissions.permissions.forEach((permission) => {
          permission.check = true;
        });
      });
  } else {
    check_all_permission.value = false;
    permissionList.value &&
      Object.entries(permissionList.value).forEach(([moduleName, modulePermissions]) => {
        modulePermissions.check = false;
        modulePermissions.permissions.forEach((permission) => {
          permission.check = false;
        });
      });
  }
};
const toggleModuleSelectAll = (module_permission) => {
  if (module_permission.check) {
    module_permission &&
      module_permission.permissions.forEach((permission) => {
        permission.check = true;
      });
  } else {
    module_permission &&
      module_permission.permissions.forEach((permission) => {
        permission.check = false;
      });
  }

  toggleSelect();
};
const toggleSelect = () => {
  permissionList.value &&
    Object.entries(permissionList.value).forEach(([moduleName, modulePermissions]) => {
      modulePermissions.check = modulePermissions.permissions.every(
        (permission) => permission.check === true
      );
    });
  check_all_permission.value = Object.values(permissionList.value).every(
    (permission) => permission.check === true
  );
};
/* User Info */
const userData = ref();
const isLoading = ref(true);

const getUserInfo = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(`${apiBase}/user_edit/${id}`, config);
    if (res?.data?.status == "success") {
      userData.value = res?.data?.user_info;
      isLoading.value = false;

      permissionList.value &&
        Object.entries(permissionList.value).forEach(([moduleName, modulePermissions]) => {
          modulePermissions.check = false;
          modulePermissions.permissions.forEach((permission) => {
            permission.check = userData.value?.all_permissions.some(
              (element) => element.name === permission.name
            );
          });
        });
      toggleSelect();

      formData.value = {
        name: userData.value?.name,
        email: userData.value?.email,
        user_id: userData.value?.user_id,
        roles: userData.value?.roles?.map((item) => item?.name),
      };
    }
  } catch (err) {
    userData.value = "";
    isLoading.value = false;
  }
};
/* User Edit */
const formData = ref({
  name: null,
  email: null,
  user_id: null,
  roles: [],
  permissions: [],
});
const isUpdating = ref(false);
const userEdit = async (router) => {
  isUpdating.value = true;
  formData.value.permissions = [];
  permissionList.value &&
    Object.entries(permissionList.value).forEach(([moduleName, modulePermissions]) => {
      modulePermissions.permissions.forEach((permission) => {
        if (permission.check == true) {
          formData.value.permissions.push(permission.name);
        }
      });
    });
  try {
    const res = await axios.put(`${apiBase}/user_update/${id}`, formData.value, config);
    isUpdating.value = false;
    showNotification(res?.data?.status, res?.data?.message);
    if (res?.data?.status == "success") {
      console.log(res?.data?.auth_user_permission?.all_permissions);
      localStorage.setItem(
        "all_permissions",
        JSON.stringify(res?.data?.auth_user_permission?.all_permissions)
      );
      router.go(-1);
    }
  } catch (err) {
    isUpdating.value = false;
  }
};
/* onMounted */
onMounted(async () => {
  await getRoles();
  await getPermission();
  await getUserInfo();
});
</script>

<template>
  <MainLayout>
    <a-skeleton v-if="isLoading" />
    <div class="md:grid grid-cols-3 gap-3" v-else>
      <div class="border text-center py-3 px-5 rounded mb-3">
        <h2 class="text-xl font-semibold capitalize mt-4">{{ userData?.name }}</h2>
        <div class="flex flex-wrap justify-center gap-2 mt-2">
          <span class="bg-gray-200 text-gray-700 rounded-full px-4 py-1 text-sm font-medium"
            >{{ userData?.user_id }}
          </span>
        </div>
        <hr class="my-3" />
        <div class="text-left">
          <h3 class="text-lg font-semibold">Details</h3>
          <p class="capitalize"><strong class="mr-1">Name:</strong> {{ userData?.name }}</p>
          <p><strong class="mr-1">Email:</strong> {{ userData?.email }}</p>

          <p>
            <strong class="mr-1">Manage Dashboard Permissions:</strong>
            <span
              class="capitalize text-blue-500"
              v-for="(permission, index) in userData?.all_permissions"
              :key="index"
            >
              <span>{{ permission?.name }}</span>
              <span class="mr-1" v-if="index < userData?.all_permissions?.length - 1">,</span>
            </span>
          </p>
        </div>
      </div>
      <div class="col-span-2">
        <div class="mb-3 py-3 px-5 rounded-md border">
          <div class="md:flex justify-between items-center">
            <h2 class="title mb-3">Update User</h2>
            <button type="button" class="c-btn mb-3" @click="$router.go(-1)">Back</button>
          </div>
          <form @submit.prevent="userEdit($router)">
            <div class="mb-3">
              <h4 class="text-base font-medium mb-1">Name <span class="text-red-600">*</span></h4>
              <input
                type="text"
                class="border w-full rounded px-3 py-1 outline-none"
                v-model="formData.name"
                required
              />
            </div>
            <div class="mb-3">
              <h4 class="text-base font-medium mb-1">
                User ID <span class="text-red-600">*</span>
              </h4>
              <input
                type="text"
                class="border w-full rounded px-3 py-1 outline-none"
                v-model="formData.user_id"
                required
              />
            </div>
            <div class="mb-3">
              <h4 class="text-base font-medium mb-1">Email</h4>
              <input
                type="email"
                class="border w-full rounded px-3 py-1 outline-none"
                v-model="formData.email"
              />
            </div>
            <div class="mb-3">
              <h4 class="text-base font-medium mb-1 flex items-center gap-x-2">
                Manage Dashboard Permissions
                <input
                  type="checkbox"
                  v-model="check_all_permission"
                  @change="toggleSelectAll($event)"
                />
              </h4>
              <p v-if="permissionLoading">Loading...</p>
              <ul class="list-disc list-inside">
                <li
                  v-for="(module_permission, module) in permissionList"
                  :key="module"
                  class="mb-2"
                >
                  <span class="capitalize font-medium text-secondary pr-2"
                    >Group ID: {{ module }}</span
                  >
                  <input
                    type="checkbox"
                    v-model="module_permission.check"
                    @change="toggleModuleSelectAll(module_permission)"
                  />
                  <ul class="ml-3">
                    <li v-for="permission in module_permission.permissions" :key="permission.id">
                      <label>
                        <input
                          type="checkbox"
                          :value="permission.name"
                          v-model="permission.check"
                          @change="toggleSelect()"
                        />
                        <span class="align-baseline ml-2 capitalize">{{ permission.name }}</span>
                      </label>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <div class="md:flex gap-2">
              <button type="submit" class="c-btn mb-2">Update <Spinner v-if="isUpdating" /></button>
              <button type="button" class="d-btn mb-2" @click="$router.go(-1)">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
