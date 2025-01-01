<script setup>
import { apiBase } from "@/config";
import Cookies from "js-cookie";

import { onMounted, ref } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import axios from "axios";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { showNotification } from "@/utilities/notification";
import Spinner from "@/components/Spinner.vue";

const config = {
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
};
const isLoading = ref(false);
const allData = ref([]);
const backupData = ref([]);

// Pagination
const search = ref("");
const paginate = ref(10);
const total = ref(0);

const getData = async (page = "", sort = "") => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${apiBase}/permission_list_with_paginate?search=${search.value}&paginate=${paginate.value}&page=${page}&orderBy=${sort}&orderDir=${sort_type.value}`,
      config
    );

    isLoading.value = false;
    if (res?.data?.status == "success") {
      backupData.value = res?.data?.permissions?.data;
      allData.value = res?.data?.permissions?.data;
      total.value = res?.data?.permissions?.total;
    }
  } catch (err) {
    isLoading.value = false;
  }
};
const isDeleting = ref(false);

const deleteData = async (id, router) => {
  isDeleting.value = true;
  try {
    const res = await axios.delete(`${apiBase}/permissions/${id}`, config);

    isDeleting.value = false;
    showNotification(res?.data?.status, res?.data?.message);
    if (res?.data?.status == "success") await getData();
    localStorage.setItem(
      "all_permissions",
      JSON.stringify(res?.data?.auth_user_permission?.all_permissions)
    );
    window.location.reload();
  } catch (err) {
    isDeleting.value = false;
  }
};
/* Create */
const open = ref(false);
const form = ref({
  report_type: "",
  name: "",
  description: "",
  url: "",
  module: "",
  report_id: "",
  secondary_url: "",
});
const resetForm = () => {
  form.value = {
    report_type: "",
    name: "",
    description: "",
    url: "",
    module: "",
    report_id: "",
    secondary_url: "",
  };
};
const isInserting = ref(false);

const createNew = async (data) => {
  isInserting.value = true;
  try {
    const res = await axios.post(`${apiBase}/permissions`, data, config);
    isInserting.value = false;
    showNotification(res?.data?.status, res?.data?.message);
    if (res?.data?.status == "success") {
      resetForm();
      await getData();
      open.value = false;
    }
  } catch (err) {
    showNotification("error", err?.response?.data?.message);
    isInserting.value = false;
    console.log(err);
  }
};
/* onMounted */
onMounted(async () => {
  await getData();
});
const sort_type = ref("asc");
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-3">
      <!-- Search -->
      <div class="grow mb-3">
        <input
          type="text"
          placeholder="Search..."
          class="search"
          v-model="search"
          @input="getData()"
        />
      </div>
      <div class="mb-3">
        <button @click="open = true" class="c-btn flex items-center gap-x-2">
          <PlusOutlined />
          <span>Add New</span>
        </button>
      </div>
    </div>
    <h2 class="title">Manage Dashboards ({{ total }})</h2>
    <table class="purchase-table mb-3">
      <thead class="table-header">
        <tr>
          <th class="w-16">Actions</th>
          <th>
            <div class="flex items-center">
              Type<button
                type="button"
                @click="
                  sort_type == 'asc' ? (sort_type = 'desc') : (sort_type = 'asc');
                  getData('', 'report_type');
                "
              >
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div>
          </th>
          <th>
            <div class="flex items-center">
              Title
              <button
                type="button"
                @click="
                  sort_type == 'asc' ? (sort_type = 'desc') : (sort_type = 'asc');
                  getData('', 'name');
                "
              >
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div>
          </th>
          <th>
            <div class="flex items-center">
              Description
              <button
                type="button"
                @click="
                  sort_type == 'asc' ? (sort_type = 'desc') : (sort_type = 'asc');
                  getData('', 'description');
                "
              >
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div>
          </th>
          <th>
            <div class="flex items-center">
              Url
              <button
                type="button"
                @click="
                  sort_type == 'asc' ? (sort_type = 'desc') : (sort_type = 'asc');
                  getData('', 'url');
                "
              >
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div>
          </th>
          <th>
            <div class="flex items-center">
              Group ID
              <button
                type="button"
                @click="
                  sort_type == 'asc' ? (sort_type = 'desc') : (sort_type = 'asc');
                  getData('', 'module');
                "
              >
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div>
          </th>
          <th>
            <div class="flex items-center">
              Report ID
              <button
                type="button"
                @click="
                  sort_type == 'asc' ? (sort_type = 'desc') : (sort_type = 'asc');
                  getData('', 'report_id');
                "
              >
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!allData?.length && !isLoading">
          <td colspan="8">No Data</td>
        </tr>
        <tr v-if="isLoading">
          <td colspan="8">Loading...</td>
        </tr>

        <tr v-for="item in allData" :key="item?.id">
          <td>
            <div class="flex gap-x-2">
              <button
                type="button"
                class="edit_btn"
                @click="$router.push({ name: 'permission-edit', params: { id: item?.id } })"
              >
                <EditOutlined class="align-middle" />
              </button>

              <a-popconfirm title="Are you sure delete?" @confirm="deleteData(item?.id, $router)">
                <button type="button" class="del_btn">
                  <DeleteOutlined class="align-middle" />
                </button>
              </a-popconfirm>
            </div>
          </td>
          <td>
            <span class="md:hidden mr-1 font-semibold">Type:</span>
            {{ item?.report_type || "-" }}
          </td>
          <td>
            <span class="md:hidden mr-1 font-semibold">Title:</span>
            {{ item?.name || "-" }}
          </td>
          <td>
            <span class="md:hidden mr-1 font-semibold">Description:</span>
            {{ item?.description || "-" }}
          </td>
          <td>
            <span class="md:hidden mr-1 font-semibold">Url:</span>
            <a
              :href="item?.url"
              target="_blank"
              class="text-secondary"
              :class="{ 'text-gray-300': !item?.url }"
              >Open</a
            >
          </td>
          <td>
            <span class="md:hidden mr-1 font-semibold">Group ID:</span>
            {{ item?.module || "-" }}
          </td>
          <td>
            <span class="md:hidden mr-1 font-semibold">Report ID:</span>
            {{ item?.report_id || "-" }}
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <a-pagination
      v-if="total > paginate"
      size="small"
      :total="total"
      :show-total="(total) => `Total ${total} items`"
      :show-size-changer="false"
      show-quick-jumper
      @change="(page) => getData(page)"
    />
    <!-- Create New -->
    <a-modal v-model:open="open" title="Create New Dashboard" :footer="false" @cancel="resetForm()">
      <form @submit.prevent="createNew(form)" class="space-y-3">
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2">Report Type</label>
          <select class="border w-full rounded px-3 py-1 outline-none" v-model="form.report_type">
            <option value=""></option>
            <option value="PowerBI Report">PowerBI Report</option>
            <option value="PowerBI Dashboard">PowerBI Dashboard</option>
            <option value="PowerBI Tile">PowerBI Tile</option>
            <option value="PowerBI URL">PowerBI URL</option>
            <option value="Non Power BI">Non Power BI</option>
          </select>
        </div>
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2"
            >Title <span class="text-red-600">*</span></label
          >
          <input
            id="name"
            type="text"
            placeholder="Title"
            class="border w-full rounded px-3 py-1 outline-none"
            required
            v-model="form.name"
          />
        </div>
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2">Description</label>
          <input
            id="name"
            type="text"
            placeholder="Description"
            class="border w-full rounded px-3 py-1 outline-none"
            v-model="form.description"
          />
        </div>
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2">Url</label>
          <input
            id="name"
            type="text"
            placeholder="Url"
            class="border w-full rounded px-3 py-1 outline-none"
            v-model="form.url"
          />
        </div>
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2">GroupID </label>
          <input
            id="name"
            type="text"
            placeholder="GroupID"
            class="border w-full rounded px-3 py-1 outline-none"
            v-model="form.module"
          />
        </div>
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2">ReportID</label>
          <input
            id="name"
            type="text"
            placeholder="ReportID"
            class="border w-full rounded px-3 py-1 outline-none"
            v-model="form.report_id"
          />
        </div>
        <div class="md:flex justify-between items-center">
          <label for="name" class="text-sm w-44 mb-2">Secondary Url:</label>
          <input
            id="name"
            type="text"
            placeholder="Secondary Url:"
            class="border w-full rounded px-3 py-1 outline-none"
            v-model="form.secondary_url"
          />
        </div>

        <button type="submit" class="c-btn">Save <Spinner v-if="isInserting" /></button>
      </form>
    </a-modal>
  </MainLayout>
</template>
