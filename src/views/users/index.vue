<script setup>
import Spinner from "@/components/Spinner.vue";
import MainLayout from "@/components/MainLayout.vue";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import axios from "axios";
import { apiBase, config } from "@/config";
import { showNotification } from "@/utilities/notification";

/* User List */
const usersList = ref(null);
const isLoading = ref(false);
const search = ref("");

const paginate = ref(10);
const total = ref(0);

const getUsers = async (page = "") => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${apiBase}/user_list?search=${search.value}&paginate=${paginate.value}&page=${page}`,
      config
    );
    isLoading.value = false;
    usersList.value = res?.data?.users?.data;
    total.value = res?.data?.users?.total;
  } catch (err) {
    usersList.value = [];
    isLoading.value = false;
  }
};
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
/* User Create */
const open = ref(false);
const userLoading = ref(false);
const registerEmail = ref();

const register = ref({
  name: "",
  email: "",
  user_id: "",
  password: "",
  roles: [],
});

const createUser = async (data) => {
  userLoading.value = true;
  try {
    const res = await axios.post(`${apiBase}/register`, data, config);
    userLoading.value = false;
    showNotification(res?.data?.status, res?.data?.message);
    if (res?.data?.status == "success") {
      open.value = false;
      clearRegister();
      await getUsers();
    } else {
      if (res?.data?.message?.email) {
        showNotification("error", res?.data?.message?.email?.at(0));
        registerEmail.value.focus();
      }
      showNotification(res?.data?.status, res?.data?.message);
    }
  } catch (err) {
    userLoading.value = false;

    showNotification("error", err?.message);
    open.value = false;
  }
};
const clearRegister = () => {
  register.value = {
    name: "",
    email: "",
    password: "",
    roles: [],
  };
};

/* User Delete */
const isDeleting = ref(false);
const deleteUser = async (id) => {
  isDeleting.value = true;
  try {
    const response = await axios.delete(`${apiBase}/user_delete/${id}`, config);
    isDeleting.value = false;
    showNotification(response?.data?.status, response?.data?.message);
    if (response?.data?.status === "success") {
      await getUsers();
    }
  } catch (error) {
    isDeleting.value = false;
    showNotification("error", error?.message);
  }
};
/* onMounted */
onMounted(async () => {
  await getUsers();
  await getRoles();
});
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between">
      <!-- Search -->
      <div class="grow mb-3">
        <input
          type="text"
          placeholder="Search User..."
          class="search"
          v-model="search"
          @input="getUsers()"
        />
      </div>
      <div class="mb-3">
        <button @click="open = true" class="c-btn flex items-center gap-x-2">
          <PlusOutlined />
          <span>Add New User</span>
        </button>
      </div>
    </div>
    <h2 class="title">All Users ({{ total }})</h2>
    <!-- Create User -->
    <a-modal v-model:open="open" title="Create New User" :footer="false" @cancel="clearRegister()">
      <form @submit.prevent="createUser(register)">
        <div class="mb-2">
          <label class="block mb-1">Name <span class="text-red-600">*</span></label>
          <input
            type="text"
            class="border w-full rounded px-3 py-1 outline-none"
            placeholder="Name"
            v-model="register.name"
            required
          />
        </div>
        <div class="mb-2">
          <label class="block mb-1">User ID <span class="text-red-600">*</span></label>
          <input
            type="text"
            class="border w-full rounded px-3 py-1 outline-none focus:border-red-600"
            placeholder="User ID"
            v-model="register.user_id"
            required
          />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Email Address</label>
          <input
            type="email"
            class="border w-full rounded px-3 py-1 outline-none focus:border-red-600"
            placeholder="Email Address"
            ref="registerEmail"
            v-model="register.email"
          />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Password <span class="text-red-600">*</span></label>
          <input
            type="password"
            class="border w-full rounded px-3 py-1 outline-none"
            placeholder="Password"
            v-model="register.password"
            required
          />
        </div>

        <button type="submit" class="c-btn mt-3">
          Create
          <Spinner v-if="userLoading" />
        </button>
      </form>
    </a-modal>
    <!-- User List -->
    <div class="overflow-x-auto mb-3">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th class="text-center">Actions</th>
            <th>Name</th>
            <th>User ID</th>
            <th>Email</th>
            <th>Permissions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="6">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !usersList?.length">
            <td colspan="6">No Data Found</td>
          </tr>
          <tr v-for="(item, index) in usersList" :key="index">
            <td class="lg:text-center text-left lg:w-16">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'user-edit',
                    params: { id: item?.id },
                  })
                "
              >
                <EditOutlined class="align-middle" />
              </button>
              <!-- Delete User -->
              <a-popconfirm
                title="Are you sure delete?"
                @confirm="deleteUser(item?.id)"
                :disabled="index == 0"
              >
                <button type="button" class="del_btn ml-2" :disabled="index == 0">
                  <DeleteOutlined class="align-middle" />
                </button>
              </a-popconfirm>
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Name:</span>
              {{ item?.name }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">User ID:</span>
              {{ item?.user_id }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Email:</span>
              {{ item?.email }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Permissions:</span>
              <span
                class="capitalize text-blue-500"
                v-for="(permission, index) in item?.permissions"
                :key="index"
              >
                <span>{{ permission?.name }}</span>
                <span class="mr-1" v-if="index < item?.permissions?.length - 1">,</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination -->
    <a-pagination
      v-if="total > paginate"
      size="small"
      :total="total"
      :show-total="(total) => `Total ${total} items`"
      :show-size-changer="false"
      show-quick-jumper
      @change="(page) => getUsers(page)"
    />
  </MainLayout>
</template>
