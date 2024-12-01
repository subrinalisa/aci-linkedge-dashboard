<template>
  <MainLayout>
    <h6 class="title">Pending Purchase Return List</h6>
    <div class="overflow-x-auto">
      <table class="purchase-table mb-3">
        <thead class="table-header">
          <tr>
            <th class="text-center">Suspend</th>
            <th class="text-center">Receipt</th>
            <th class="text-center">Delete</th>
            <th>ID</th>
            <th>Date</th>
            <th class="text-right">total Price</th>
            <th class="text-right">gatis %</th>
            <th class="text-right">gatis (৳)</th>
            <th class="text-right">total paid</th>
            <th class="text-right">Due</th>
            <th>payment</th>
            <th>supplier</th>
            <th>mrr</th>
            <th>branch</th>
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
            <td class="text-center w-16">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'verify-return-purchases-suspend',
                    params: { id: item?.id },
                  })
                "
              >
                Unsuspend
              </button>
            </td>
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
            <td class="text-center w-16">
              <a-popconfirm
                :title="`Are you sure you want to accept ${item?.suspend_request_user?.name} suspend request?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="purchaseReturnSuspended(item?.id)"
              >
                <button
                  class="edit_btn"
                  type="button"
                  :style="
                    item?.suspend_request != 1 ? 'background-color: #cccccc; color: #666666;' : ''
                  "
                  :disabled="item?.suspend_request != 1"
                >
                  Delete
                </button>
              </a-popconfirm>
            </td>
            <td class="w-10">{{ item?.id }}</td>
            <td>
              {{ item?.purchase_return_date && moment(item?.purchase_return_date).format("ll") }}
            </td>
            <td class="text-right">{{ Number(item?.total)?.toFixed(2) }}</td>
            <td class="text-right">
              {{ Number(item?.getis_percent) }}
            </td>
            <td class="text-right">{{ Number(item?.amount)?.toFixed(2) }}</td>
            <td class="text-right">
              {{ Number(item?.paid_amount)?.toFixed(2) }}
            </td>
            <td class="text-right">
              {{ Number(item?.amount_due)?.toFixed(2) }}
            </td>
            <td>{{ item?.payment_method?.name?.split(" ")[0] || "-" }}</td>
            <td>{{ item?.supplier?.company_name || "-" }}</td>
            <td>{{ item?.mrr?.name || "-" }}</td>
            <td>{{ item.branch?.organization_name }} - {{ item.branch?.branch }}</td>
            <td>{{ item?.note || "-" }}</td>
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
const { getPurchaseReturnVerify, getPurchaseReturnSuspended } = verifyStore;
const { isLoading } = storeToRefs(verifyStore);

const allData = ref(null);
const backupData = ref(null);
const page = ref(1);
const paginate = ref(10);

onMounted(async () => {
  backupData.value = await getPurchaseReturnVerify(page.value);
  allData.value = backupData.value?.data;
});
const handlePagination = async (pageNo) => {
  page.value = pageNo;
  const newData = await getPurchaseReturnVerify(page.value);
  allData.value = newData?.data;
};

const purchaseReturnSuspended = async (id) => {
  const result = await getPurchaseReturnSuspended(id);
  if (result.success) {
    await handlePagination(1);
  }
};
</script>
