<template>
  <MainLayout>
    <h6 class="title">All Sales Return</h6>
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
            <th class="text-right">Sub total</th>
            <th class="text-right">discount per item %</th>
            <th class="text-right">discount (৳)</th>
            <th class="text-right">total</th>
            <th class="text-right">total paid</th>
            <th class="text-right">Due</th>
            <th class="text-left">payment</th>
            <th class="text-left">customer</th>
            <th class="text-left">Seller</th>
            <th class="text-left">branch</th>
            <th class="text-center">Status</th>
            <th>note</th>
          </tr>
        </thead>

        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="17">Loading . . .</td>
          </tr>

          <tr v-if="!isLoading && !backupData?.total">
            <td colspan="17">No Data Found</td>
          </tr>

          <tr v-for="(item, index) in allData?.data" :key="index">
            <td class="text-center">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'return-sales-receipt',
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
                  :disabled="
                    item?.verify_status != 0 || item?.suspend_request == 1
                  "
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
            <td>
              <span class="md:hidden mr-1 font-bold">ID:</span>
              {{ item?.id }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Date:</span>
              {{ moment(item?.sale_return_date).format("ll") }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Items:</span>
              <span
                class="capitalize"
                v-for="product in item?.sale_return_products"
                :key="product?.id"
                >{{ product?.product_name }} <br
              /></span>
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Sub Total:</span>
              {{ Number(item?.sub_total)?.toFixed(2) || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold"
                >Discount Per Item (%):</span
              >

              {{
                item?.discount_all_item_by_percent
                  ? Number(item?.discount_all_item_by_percent)
                  : "0"
              }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Discount (Taka):</span>
              {{
                item?.discount_entire_sale
                  ? Number(item?.discount_entire_sale)?.toFixed(2)
                  : "0.00"
              }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Total:</span>

              {{ Number(item?.total)?.toFixed(2) }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Total Paid:</span>
              {{ Number(item?.paid_amount)?.toFixed(2) }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Due:</span>
              {{ Number(item?.amount_due)?.toFixed(2) }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Payment:</span>

              {{ item.payment_method?.name?.split(" ")[0] }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Customer:</span>
              {{ item?.customer?.first_name }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Seller:</span>
              {{ item?.sale_return_user?.name }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Branch:</span>
              {{ item.branch?.organization_name }} -
              {{ item.branch?.branch }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Status:</span>
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
            <td>
              <span class="md:hidden mr-1 font-bold">Note:</span>

              {{ item.note || "-" }}
            </td>
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
const { getReturnSalesList } = psalesStore;

const allData = ref();
const backupData = ref();

const page = ref(1);
const limit = ref(10);

onMounted(() => fetchList(page.value, ""));

const fetchList = async (page) => {
  backupData.value = await getReturnSalesList(page, "");
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
      `${apiBase}/sale-return/request-to-suspend/${item.id}`,
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
