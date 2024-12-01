<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { PlusOutlined } from "@ant-design/icons-vue";

import { onMounted, ref } from "vue";
import { apiBase } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";

const token = Cookies.get("token");

const apiClient = axios.create({
  baseURL: apiBase,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const isLoading = ref(false);
const allGeneric = ref([]);
let search = ref("");
let page = ref(1);
let paginate = ref(10);

onMounted(() => getAllGeneric());

const getAllGeneric = async () => {
  const response = await apiClient.get(
    `/all-generic-paginated?search=${search.value}&page=${page.value}&per_page=${paginate.value}`
  );
  allGeneric.value = response.data;
};
const genericSearch = async (input) => {
  if (input) {
    const response = await apiClient.get(
      `/all-generic-paginated?search=${input}`
    );
    search.value = input;
    page.value = 1;
    allGeneric.value = response.data;
  } else {
    getAllGeneric();
  }
};

const handlePagination = (pageNo, perPage) => {
  page.value = pageNo;
  paginate.value = perPage;
  getAllGeneric();
};
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-4">
      <input
        type="text"
        placeholder="Search Generic..."
        v-model="search"
        class="px-4 py-2 border rounded"
        @input="genericSearch($event?.target?.value)"
      />
      <router-link :to="{ name: 'generic-create' }">
        <button
          class="flex items-center px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2" />
          New Generic
        </button>
      </router-link>
    </div>
    <h6 class="font-medium">Generic ({{ allGeneric?.total || 0 }})</h6>
    <div class="overflow-x-auto">
      <table
        class="table border-collapse border border-slate-400 w-full bg-white my-4"
      >
        <thead class="table-header">
          <tr>
            <th class="text-left font-bold">SL.</th>
            <th class="text-left">Name</th>
            <th class="text-left">Category</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="4" class="text-red-600">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !allGeneric?.data?.length">
            <td colspan="4" class="text-red-600">No Generic Found . . .</td>
          </tr>
          <tr
            v-for="(item, index) in allGeneric?.data"
            :key="index"
            class="hover:bg-gray-100 transition-colors duration-200"
          >
            <td class="font-bold">
              <span class="md:hidden mr-1 font-bold">Serial No:</span>

              {{ allGeneric?.from + index }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Name:</span>
              {{ item.name }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Category:</span>
              {{ item.category }}
            </td>
            <td class="text-center">
              <div class="flex items-center">
                <span class="md:hidden mr-1 font-bold">Status:</span>
                <p class="text-green-600" v-if="item.status == 1">Active</p>
                <p class="text-red-600" v-else>Inactive</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <a-pagination
      v-model:current="page"
      v-model:page-size="paginate"
      :total="allGeneric?.total"
      :show-total="(total) => `Total ${total} items`"
      @change="handlePagination(page, paginate)"
      :showSizeChanger="false"
    />
  </MainLayout>
</template>
