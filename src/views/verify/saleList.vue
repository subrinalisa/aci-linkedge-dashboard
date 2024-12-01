<template>
  <MainLayout>
    <h6 class="title">Pending Sale List</h6>
    <div class="overflow-x-auto">
      <table class="purchase-table mb-3">
        <thead class="table-header">
          <tr>
            <th class="text-center">Suspend</th>
            <th class="text-center">Receipt</th>
            <th class="text-center">Delete</th>
            <th>ID</th>
            <th>Date</th>
            <th class="text-right">Sub total</th>
            <th class="text-right">discount per<br />item %</th>
            <th class="text-right">discount (৳)</th>
            <th class="text-right">total</th>
            <th class="text-right">total paid</th>
            <th class="text-right">Due</th>
            <th class="text-left">payment</th>
            <th class="text-left">customer</th>
            <th class="text-left">Seller</th>
            <th>note</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="15">Loading . . .</td>
          </tr>

          <tr v-if="!isLoading && !backupData?.total">
            <td colspan="15">No Data Found</td>
          </tr>
          <tr
            v-for="(item, index) in allData"
            :key="index"
            :style="item.suspend_request == 1 ? 'background:orange;' : ''"
          >
            <td class="text-center lg:w-16">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'verify-sales-suspend',
                    params: { id: item?.id },
                  })
                "
              >
                Unsuspend
              </button>
            </td>
            <td class="text-center lg:w-16">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'sales-receipt',
                    params: { id: item?.id },
                  })
                "
              >
                Receipt
              </button>
            </td>
            <td class="text-center lg:w-16">
              <a-popconfirm
                :title="`Are you sure you want to accept ${item?.suspend_request_user?.name} suspend request?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="saleSuspended(item?.id)"
              >
                <button
                  class="edit_btn"
                  type="button"
                  :style="
                    item?.suspend_request != 1
                      ? 'background-color: #cccccc; color: #666666;'
                      : ''
                  "
                  :disabled="item?.suspend_request != 1"
                >
                  Delete
                </button>
              </a-popconfirm>
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">ID:</span>
              {{ item?.id }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Date:</span>
              {{ item?.sale_date && moment(item?.sale_date).format("ll") }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Sub Total:</span>
              {{ Number(item?.sub_total)?.toFixed(2) }}
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
              <span class="md:hidden mr-1 font-bold">customer:</span>

              {{ item?.customer?.first_name || "-" }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Seller:</span>
              {{ item?.sold_user?.name || "-" }}
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
      v-if="backupData?.last_page > 1"
      v-model:current="page"
      v-model:page-size="paginate"
      :total="backupData?.total"
      :show-total="(total) => `Total ${total} items`"
      :showSizeChanger="false"
      @change="handlePagination(page)"
    />
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { useVerifyStore } from "@/stores/verify.js";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import moment from "moment";

const verifyStore = useVerifyStore();
const { getSalesVerify, getSaleSuspended } = verifyStore;
const { isLoading } = storeToRefs(verifyStore);

const allData = ref(null);
const backupData = ref(null);
const page = ref(1);
const paginate = ref(10);

onMounted(async () => {
  backupData.value = await getSalesVerify(page.value);
  allData.value = backupData.value?.data;
});
const handlePagination = async (pageNo) => {
  page.value = pageNo;
  const newData = await getSalesVerify(page.value);
  allData.value = newData?.data;
};

const saleSuspended = async (id) => {
  const result = await getSaleSuspended(id);
  if (result.success) {
    await handlePagination(1);
  }
};
</script>
