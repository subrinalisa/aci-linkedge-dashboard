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
const allExpenseCategory = ref([]);
let page = ref(1);
let paginate = ref(10);

onMounted(() => getAllExpenseCategory());

const getAllExpenseCategory = async () => {
  const response = await apiClient.get(
    `/all-expense-category-paginated?page=${page.value}`
  );
  allExpenseCategory.value = response.data;
};
const expenseCategorySearch = async (input) => {
  if (input) {
    const response = await apiClient.get(
      `/all-expense-category-paginated?search=${input}`
    );
    allExpenseCategory.value = response.data;
  } else {
    getAllExpenseCategory();
  }
};
const handlePagination = (pageNo) => {
  page.value = pageNo;
  getAllExpenseCategory();
};
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-4">
      <input
        type="text"
        placeholder="Search Expense Category..."
        class="px-4 py-2 border rounded"
        @input="expenseCategorySearch($event?.target?.value)"
      />
      <router-link :to="{ name: 'expense-category-create' }">
        <button
          class="flex items-center px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600 mt-1"
        >
          <PlusOutlined class="mr-2" />
          New Expense Category
        </button>
      </router-link>
    </div>
    <h6 class="font-medium">
      Expense Category ({{ allExpenseCategory?.total || 0 }})
    </h6>
    <div class="overflow-x-auto">
      <table
        class="table border-collapse border border-slate-400 w-full bg-white my-4"
      >
        <thead class="table-header">
          <tr>
            <th class="text-left font-bold">SL.</th>
            <th class="text-left">Name</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="3" class="text-red-600">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !allExpenseCategory?.data?.length">
            <td colspan="3" class="text-red-600">
              No Expense Category Found . . .
            </td>
          </tr>
          <tr
            v-for="(item, index) in allExpenseCategory?.data"
            :key="index"
            class="hover:bg-gray-100 transition-colors duration-200"
          >
            <td class="font-bold">
              <span class="md:hidden mr-1 font-bold">Serial No:</span>
              {{ allExpenseCategory?.from + index }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Name:</span>
              {{ item.name }}
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
      :total="allExpenseCategory?.total"
      :show-total="(total) => `Total ${total} items`"
      @change="handlePagination(page)"
      :showSizeChanger="false"
    />
  </MainLayout>
</template>
