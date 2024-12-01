<script setup>
import MainLayout from "@/components/MainLayout.vue";
import expense from "@/stores/expense_api.js";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons-vue";

import { onMounted, ref } from "vue";
const isLoading = ref(false);
const expenseData = ref([]);
const allItems = ref([]);
let page = ref(1);
let paginate = ref(10);

const deleteItem = (index) => {};

onMounted(() => getAllExpenses());

const getAllExpenses = async () => {
  const response = await expense.fetchExpenseList(page.value, paginate.value);
  allItems.value = response.data;
  expenseData.value = response.data.data;
  console.log(allItems.value.length);
};

const expenseSearch = async (input) => {
  if (input) {
    const response = await expense.searchExpenseList(input);
    allItems.value = response.data;
    expenseData.value = response.data.data;
  } else {
    getAllExpenses();
  }
};
const handlePagination = (pageNo) => {
  page.value = pageNo;
  getAllExpenses();
};
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-4">
      <input
        type="text"
        placeholder="Search expenses..."
        class="px-4 py-2 border rounded"
        @input="expenseSearch($event?.target?.value)"
      />
      <router-link :to="{ name: 'expenses-create' }">
        <button
          class="flex items-center mt-2 px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2" />
          New Expenses
        </button>
      </router-link>
    </div>
    <h6 class="font-medium">All Expenses ({{ allItems?.total || 0 }})</h6>
    <table class="purchase-table">
      <thead class="table-header">
        <tr>
          <th>Actions</th>
          <th class="text-left">ID</th>
          <th class="text-left">Type</th>
          <th class="text-left">Description</th>
          <th class="text-left">Category</th>
          <th class="text-left">Date</th>
          <th class="text-center">Amount</th>
          <th class="text-center">Payment Type</th>
          <th class="text-center">Tax</th>
          <th class="text-center">Receipient Name</th>
          <th class="text-center">Approved By</th>
        </tr>
      </thead>
      <tbody class="table-body">
        <tr v-if="isLoading">
          <td colspan="9" class="text-red-600">Loading . . .</td>
        </tr>
        <tr v-if="!isLoading && !expenseData?.length">
          <td colspan="9" class="text-red-600">No Expense Found . . .</td>
        </tr>
        <tr v-for="(item, index) in expenseData" :key="index">
          <td class="lg:text-center text-left">
            <button
              @click="
                $router.push({
                  name: 'expenses-edit',
                  params: { id: item?.id },
                })
              "
              class="px-2 py-1 bg-[#000180] text-white rounded hover:bg-indigo-600 mr-2"
            >
              <EditOutlined class="align-middle" />
            </button>
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Id:</span>
            {{ item.id }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Type:</span>
            {{ item.type }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Description:</span>
            {{ item.description }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Category:</span>
            {{ item.category }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Date:</span>
            {{ item.date }}
          </td>
          <td class="lg:text-right text-left">
            <span class="md:hidden mr-1 font-semibold">Amount:</span>
            {{ item.amount && Number(item.amount)?.toFixed(2) }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Payment Type:</span>
            {{ item.type }}
          </td>
          <td class="lg:text-right text-left">
            <span class="md:hidden mr-1 font-semibold">Tax:</span>
            {{ item.tax && Number(item.tax)?.toFixed(2) }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Receipient Name:</span>
            {{ item.recipient?.name }}
          </td>
          <td class="text-left">
            <span class="md:hidden mr-1 font-semibold">Approved By:</span>
            {{ item.approved?.name }}
          </td>
        </tr>
      </tbody>
    </table>
    <a-pagination
      v-model:current="page"
      v-model:page-size="paginate"
      :total="allItems?.total"
      :show-total="(total) => `Total ${total} items`"
      :showSizeChanger="false"
      @change="handlePagination(page)"
    />
  </MainLayout>
</template>
