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
const allManufacturer = ref([]);
let search = ref("");
let page = ref(1);
let paginate = ref(10);

onMounted(() => getAllManufacturer());

const getAllManufacturer = async () => {
  const response = await apiClient.get(
    `/all-manufacturer-paginated?search=${search.value}&page=${page.value}&per_page=${paginate.value}`
  );
  allManufacturer.value = response.data;
};
const manufacturerSearch = async (input) => {
  if (input) {
    const response = await apiClient.get(
      `/all-manufacturer-paginated?search=${input}`
    );
    search.value = input;
    page.value = 1;
    allManufacturer.value = response.data;
  } else {
    getAllManufacturer();
  }
};

const handlePagination = (pageNo, perPage) => {
  page.value = pageNo;
  paginate.value = perPage;
  getAllManufacturer();
};
</script>

<template>
  <MainLayout>
    <div class="flex justify-between mb-4">
      <input
        type="text"
        placeholder="Search Manufacturer..."
        v-model="search"
        class="px-4 py-2 border rounded"
        @input="manufacturerSearch($event?.target?.value)"
      />
      <router-link :to="{ name: 'manufacturer-create' }">
        <button
          class="flex items-center px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2" />
          New Manufacturer
        </button>
      </router-link>
    </div>
    <h6 class="font-medium">
      Manufacturer ({{ allManufacturer?.total || 0 }})
    </h6>
    <div class="overflow-x-auto">
      <table
        class="table border-collapse border border-slate-400 w-full bg-white my-4"
      >
        <thead class="table-header">
          <tr>
            <th class="text-left font-bold">SL.</th>
            <th class="text-left">Company Name</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="3" class="text-red-600">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !allManufacturer?.data?.length">
            <td colspan="3" class="text-red-600">
              No Manufacturer Found . . .
            </td>
          </tr>
          <tr
            v-for="(item, index) in allManufacturer?.data"
            :key="index"
            class="hover:bg-gray-100 transition-colors duration-200"
          >
            <td class="font-bold">
              <span class="md:hidden mr-1 font-bold">Serial No:</span>

              {{ allManufacturer?.from + index }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Company Name:</span>
              {{ item.company_name }}
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
      :total="allManufacturer?.total"
      :show-total="(total) => `Total ${total} items`"
      @change="handlePagination(page, paginate)"
      :showSizeChanger="false"
    />
  </MainLayout>
</template>
