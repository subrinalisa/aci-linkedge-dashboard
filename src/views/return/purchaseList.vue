<template>
  <MainLayout>
    <h6 class="title">All Purchases Return</h6>
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th class="text-center">Receipt</th>
            <th class="text-center">Delete Request</th>
            <th class="text-left">ID</th>
            <th class="text-left">date</th>
            <th class="text-left">items</th>
            <th class="text-right">total Price</th>
            <th class="text-right">gatis %</th>
            <th class="text-right">gatis (৳)</th>
            <th class="text-right">total paid</th>
            <th class="text-right">DUE</th>
            <th class="text-left">payment</th>
            <th class="text-left">supplier</th>
            <th class="text-left">mrr</th>
            <th class="text-left">branch</th>
            <th class="text-center">status</th>
            <th>note</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="16">Loading . . .</td>
          </tr>

          <tr v-if="!isLoading && !backupData?.total">
            <td colspan="16">No Data Found</td>
          </tr>

          <tr v-for="(item, index) in allData?.data" :key="index">
            <td class="text-center w-16">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'return-purchases-receipt',
                    params: {
                      id: item?.id,
                    },
                  })
                "
              >
                Receipt
              </button>
            </td>
            <td class="text-center">
              <a-popconfirm
                title="Are you sure you want to make a suspend request?"
                ok-text="Yes"
                cancel-text="No"
                @confirm="suspendRequest(item)"
              >
                <button
                  type="button"
                  class="edit_btn"
                  :disabled="item?.verify_status != 0 || item?.suspend_request == 1"
                  :style="
                    item?.verify_status != 0
                      ? 'background-color: #cccccc; color: #666666;'
                      : item?.suspend_request == 1
                      ? 'background: blueviolet;'
                      : ''
                  "
                >
                  Delete Request
                </button>
              </a-popconfirm>
            </td>
            <td>{{ item.id }}</td>
            <td>{{ moment(item.purchase_return_date).format("ll") }}</td>
            <td>
              <span
                class="capitalize"
                v-for="product in item?.purchase_return_products"
                :key="product?.id"
                >{{ product?.product_name }} <br
              /></span>
            </td>
            <td class="text-right">{{ Number(item.total).toFixed(2) }}</td>
            <td class="text-right">{{ Number(item.getis_percent) }}</td>
            <td class="text-right">{{ Number(item.amount).toFixed(2) }}</td>
            <td class="text-right">
              {{ Number(item.paid_amount).toFixed(2) }}
            </td>
            <td class="text-right">{{ Number(item.amount_due).toFixed(2) }}</td>
            <td>{{ item.payment_method?.name?.split(" ")[0] }}</td>
            <td>
              {{ item.supplier?.company_name }}
            </td>
            <td>{{ item.mrr?.name }}</td>
            <td>
              {{ item.branch?.organization_name }} -
              {{ item.branch?.branch }}
            </td>
            <td>
              <span
                class="font-medium"
                :class="
                  item?.verify_status == 2
                    ? 'text-red-600'
                    : item?.verify_status == 1
                    ? 'text-green-600'
                    : 'text-orange-500'
                "
              >
                {{ statusCheck(item?.verify_status) }}</span
              >
            </td>
            <td>{{ item.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <a-pagination
      v-if="allData?.last_page > 1"
      class="mt-3"
      v-model:current="page"
      v-model:page-size="limit"
      :total="allData?.total"
      :show-total="(total) => `Total ${total} items`"
      @change="handlePagination(page)"
      :showSizeChanger="false"
    />
  </MainLayout>
</template>

<script setup>
import { apiBase } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import MainLayout from "@/components/MainLayout.vue";
import { usePsalesStore } from "@/stores/psales.js";
import moment from "moment";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { showNotification } from "@/utilities/notification";
const psalesStore = usePsalesStore();
const { isLoading } = storeToRefs(psalesStore);
const { getReturnPurchaseList } = psalesStore;

const allData = ref();
const backupData = ref();

const page = ref(1);
const limit = ref(10);

onMounted(() => fetchList(page.value, ""));

const fetchList = async (page) => {
  backupData.value = await getReturnPurchaseList(page, "");
  allData.value = backupData.value;
};
const handlePagination = (pageNo) => {
  page.value = pageNo;
  fetchList(page.value);
};
const statusCheck = (number) => {
  switch (Number(number)) {
    case 1:
      return "Verified";
    case 2:
      return "Suspend";
    default:
      return "Pending";
  }
};
const suspendRequest = async (item) => {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.post(
      `${apiBase}/purchase-return/request-to-suspend/${item.id}`,
      null,
      config
    );
    if (response?.data?.success == true) {
      item.suspend_request = 1;

      showNotification("success", response?.data?.message);
    }
  } catch (err) {}
};
</script>
