<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { showNotification } from "@/utilities/notification";
import { onMounted, ref } from "vue";
import { apiBase } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";

// Balance Modal
const balanceModal = ref(false);
const confirmModal = ref(false);
const balance = ref(0);
const receivedID = ref();
const received_amount = ref(0);

const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const showBalance = async (id) => {
  try {
    const response = await axios.get(`${apiBase}/mrr/${id}`, config);
    if (response?.status == 200) {
      balance.value = response?.data?.balance
        ? Number(response?.data?.balance).toFixed(2)
        : 0;
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
      `${apiBase}/mrr-received/${receivedID.value}`,
      data,
      config
    );
    if (response?.status == 201) {
      showNotification("success", response?.data?.message);
      balanceModal.value = false;
      confirmModal.value = false;
      received_amount.value = 0;
      getData();
    }
  } catch (err) {
    balanceModal.value = false;
    confirmModal.value = false;
    received_amount.value = 0;
  }
};
// New

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
      `${apiBase}/all-mrr-paginated?page=${page}&search=${search}`,
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
        placeholder="Search MRR..."
        class="w-full md:w-auto px-4 py-2 border rounded"
        v-model="search"
        @input="getData('', search)"
      />
      <router-link :to="{ name: 'mrr-create' }">
        <button
          class="flex mt-2 items-center px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2" />
          New Mrr
        </button>
      </router-link>
    </div>
    <h6 class="title">Mrr ({{ total }})</h6>
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th class="text-left font-bold w-12">SL.</th>
            <th class="text-left">Code</th>
            <th class="text-left">Name</th>
            <th class="text-left">Supplier</th>
            <th class="text-right">Balance</th>
            <th class="text-right">Status</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="6" class="text-red-600">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !allData?.length">
            <td colspan="6" class="text-red-600">No Mrr Found . . .</td>
          </tr>
          <tr
            v-for="(item, index) in allData"
            :key="index"
            class="hover:bg-gray-100 transition-colors duration-200"
          >
            <td class="font-bold text-left">
              <span class="md:hidden mr-1">Serial No.</span>
              {{ index + 1 }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Code:</span>
              {{ item?.mrr_code }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Name:</span>
              {{ item?.name }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1">Supplier:</span>
              {{ item?.supplier?.company_name }}
            </td>
            <td class="lg:text-right text-left">
              <button
                type="button"
                class="outline-none w-full block md:text-right text-left text-indigo-600 font-medium"
                @click="showBalance(item?.id)"
              >
                <span class="md:hidden mr-1 font-bold">Balance:</span>
                {{ Number(item?.balance || 0)?.toFixed(2) }}
              </button>
            </td>
            <td class="lg:text-right text-left">
              <p class="text-green-600 font-bold" v-if="item?.status == 1">
                Active
              </p>
              <p class="text-red-600 font-bold" v-else>Inactive</p>
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
    <a-modal v-model:open="balanceModal" title="Received from MRR">
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
        <button
          type="button"
          class="cancel-btn mr-2"
          @click="balanceModal = false"
        >
          Cancel
        </button>
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
