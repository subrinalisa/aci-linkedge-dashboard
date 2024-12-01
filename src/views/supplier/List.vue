<template>
  <MainLayout>
    <div class="flex justify-between items-start mb-4 gap-2">
      <input
        type="text"
        placeholder="Search Supplier..."
        class="w-full md:w-auto px-4 py-2 border rounded"
        v-model="search"
        @input="getData('', search)"
      />
      <router-link :to="{ name: 'supplier-create' }">
        <button class="bg-[#000180] px-5 py-3 mt-2 text-white" type="button">
          <i class="bi bi-plus"></i> <span>New Supplier</span>
        </button>
      </router-link>
    </div>
    <h1 class="title">All Supplier ({{ total || 0 }})</h1>
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th class="text-center w-12">Actions</th>
            <th class="text-left w-12">SL No</th>
            <th class="text-left">Name</th>
            <th class="text-left">Company Name</th>
            <th class="text-left">Address</th>
            <th class="text-left">Contact</th>
            <th class="text-right">Balance</th>
          </tr>
        </thead>

        <tbody class="table-body">
          <tr>
            <td colspan="7" v-if="isLoading">Loading . . .</td>
          </tr>
          <tr>
            <td colspan="7" v-if="!isLoading && !allData?.length">No Data Found</td>
          </tr>
          <tr v-for="(item, index) in allData" :key="index">
            <td class="lg:text-center text-left">
              <button
                @click="
                  $router.push({
                    name: 'supplier-edit',
                    params: { id: item?.id },
                  })
                "
                class="px-2 py-1 bg-[#000180] text-white rounded hover:bg-indigo-600 mr-2"
              >
                <EditOutlined class="align-middle" />
              </button>
            </td>
            <td class="lg:text-right text-left">
              <span class="md:hidden mr-1 font-semibold">Serial No.</span>
              {{ index + 1 }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Name: </span>
              {{ item?.first_name || "-" }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Company Name:</span>
              {{ item?.company_name || "-" }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Address:</span>

              {{ item?.address_1 || "-" }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-semibold">Contact:</span>
              {{ item?.contact || "-" }}
            </td>
            <td class="text-right">
              <button
                type="button"
                class="outline-none w-full block lg:text-right text-left text-indigo-600 font-medium"
                @click="showBalance(item?.id)"
              >
                <span class="md:hidden mr-1 font-semibold">Balance:</span>
                {{ Number(item?.balance || 0)?.toFixed(2) }}
              </button>
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
    <a-modal v-model:open="balanceModal" title="Supplier Pay">
      <form>
        <div class="mb-2">
          <label class="block">Balance</label>
          <input type="number" class="input-text" v-model="balance" readonly />
        </div>
        <div class="mb-2">
          <label class="block">Pay Amount</label>
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
          <button type="button" class="submit-btn">Paid</button>
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

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { EditOutlined } from "@ant-design/icons-vue";
import { showNotification } from "@/utilities/notification";
import { onMounted, ref } from "vue";
import { apiBase } from "@/config";
import Cookies from "js-cookie";
import axios from "axios";

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
      `${apiBase}/all-suppliers-paginated?page=${page}&search=${search}`,
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
// Balance
const balanceModal = ref(false);
const confirmModal = ref(false);
const balance = ref(0);
const receivedID = ref();
const received_amount = ref(0);

const showBalance = async (id) => {
  try {
    const response = await axios.get(`${apiBase}/suppliers/${id}`, config);
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
    pay_amount: received_amount.value,
  };

  try {
    const response = await axios.post(`${apiBase}/supplier-paid/${receivedID.value}`, data, config);
    if (response?.status == 201) {
      showNotification("success", response?.data?.message);
      balanceModal.value = false;
      confirmModal.value = false;
      received_amount.value = 0;
      fetchData(page.value, "");
    }
  } catch (err) {
    balanceModal.value = false;
    confirmModal.value = false;
    received_amount.value = 0;
  }
};
</script>
