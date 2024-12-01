<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { EditOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";

// Balance Modal
import Cookies from "js-cookie";
import axios from "axios";
import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";

const balanceModal = ref(false);
const confirmModal = ref(false);
const balance = ref(0);
const receivedID = ref();
const received_amount = ref(0);

const showBalance = async (id) => {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${apiBase}/customers/${id}`, config);
    if (response?.status == 200) {
      balance.value = response?.data?.balance ? Number(response?.data?.balance).toFixed(2) : 0;

      balanceModal.value = true;
      receivedID.value = id;
    }
  } catch (err) {
    balance.value = 0;
    balanceModal.value = false;
  }
};
const updateBalance = async () => {
  const data = {
    received_amount: received_amount.value,
  };
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.post(
      `${apiBase}/customer-received/${receivedID.value}`,
      data,
      config
    );
    if (response?.status == 201) {
      showNotification("success", response?.data?.message);
      balanceModal.value = false;
      confirmModal.value = false;
      received_amount.value = 0;
      await getData();
    }
  } catch (err) {
    balanceModal.value = false;
    confirmModal.value = false;
    received_amount.value = 0;
  }
};
// New
const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
const search = ref("");
const pageNo = ref(1);
const total = ref(0);
const pageSize = ref(10);
const allData = ref([]);
const isLoading = ref(false);

const getData = async (page = 1, search = "") => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${apiBase}/all-customers-paginated?page=${page}&search=${search}`,
      config
    );
    isLoading.value = false;
    if (res?.status == 200) {
      allData.value = res?.data?.data;
      total.value = res?.data?.total;
      pageNo.value = res?.data?.current_page;
    }
  } catch (err) {
    isLoading.value = false;
    allData.value = [];
    total.value = 0;
    pageNo.value = 1;
  }
};
onMounted(async () => await getData());
</script>

<template>
  <MainLayout>
    <div class="flex justify-between items-start mb-4 gap-2">
      <input
        type="text"
        placeholder="Search Customer..."
        class="w-full md:w-auto px-4 py-2 border rounded"
        v-model="search"
        @input="getData('', search)"
      />
      <router-link :to="{ name: 'customer-create' }">
        <button
          class="flex items-center px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2" />
          New Customer
        </button>
      </router-link>
    </div>
    <h1 class="title">All Customers ({{ total }})</h1>
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>Actions</th>
            <th class="text-left">Name</th>
            <th class="text-left">Account No</th>
            <th class="text-left">Company Name</th>
            <th class="text-left">Contact</th>
            <th class="text-right">Balance</th>
            <th class="text-left">MRR</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="9" class="text-red-600">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !allData?.length">
            <td colspan="9" class="text-red-600">No Customer Found . . .</td>
          </tr>
          <tr v-for="(item, index) in allData" :key="index">
            <td class="lg:text-center text-left lg:w-24 whitespace-nowrap">
              <button
                @click="
                  $router.push({
                    name: 'customer-edit',
                    params: { id: item?.id },
                  })
                "
                class="px-2 py-1 bg-[#000180] text-white rounded hover:bg-indigo-600 mr-2"
              >
                <EditOutlined class="align-middle" />
              </button>
            </td>
            <td class="capitalize text-left">
              <span class="md:hidden mr-1 font-semibold">Name: </span>

              {{ item?.first_name || "-" }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Account No: </span>
              {{ item?.account_no || "-" }}
            </td>
            <td class="capitalize text-left">
              <span class="md:hidden mr-1 font-semibold">Company Name: </span>
              {{ item?.company_name }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Contact: </span>
              {{ item?.contact || "-" }}
            </td>
            <td class="lg:text-right">
              <button
                type="button"
                class="outline-none w-full block lg:text-right text-left text-indigo-600 font-medium"
                @click="showBalance(item?.id)"
              >
                <span class="md:hidden mr-1 font-semibold">Balance: </span>
                {{ item?.balance ? Number(item?.balance)?.toFixed(2) : "-" }}
              </button>
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">MRP: </span>
              {{ item?.mrr_info?.name || "-" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <a-pagination
      v-if="total > allData?.length"
      class="mt-3"
      v-model:current="pageNo"
      v-model:page-size="pageSize"
      :total="total"
      :show-total="(total) => `Total ${total} items`"
      :showSizeChanger="false"
      showQuickJumper
      @change="(page) => getData(page)"
    />
    <!-- Balance Modal -->
    <a-modal v-model:open="balanceModal" title="Received from Customer">
      <form>
        <div class="mb-2">
          <label class="block">Balance</label>
          <input type="number" class="input-text" v-model="balance" readonly />
        </div>
        <div class="mb-2">
          <label class="block">Received Amount</label>
          <input
            type="number"
            class="input-text"
            v-model="received_amount"
            @input="
              () => {
                if (received_amount < 0) received_amount = 0;
                else if (received_amount > balance) received_amount = balance;
              }
            "
          />
        </div>
      </form>
      <template #footer>
        <button type="button" class="cancel-btn mr-2" @click="balanceModal = false">Cancel</button>
        <a-popconfirm title="Are you sure?" v-model:open="confirmModal">
          <button type="button" class="submit-btn">Received</button>
          <template #cancelButton>
            <button
              type="button"
              class="border px-2 bg-gray-600 text-white rounded-md"
              @click="confirmModal = false"
            >
              Cancel
            </button>
          </template>
          <template #okButton>
            <button
              type="button"
              class="border px-2 bg-indigo-600 text-white rounded-md"
              @click="updateBalance()"
            >
              Confirm
            </button>
          </template>
        </a-popconfirm>
      </template>
    </a-modal>
  </MainLayout>
</template>
