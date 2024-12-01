<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { useVerifyStore } from "@/stores/verify.js";
import { usePsalesStore } from "@/stores/psales";

import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const verifyStore = useVerifyStore();
const { getSalesReturnDetails, getSaleReturnSuspended, getSaleReturnVerified } =
  verifyStore;
const { isLoading, isSubmitting } = storeToRefs(verifyStore);
const psalesStore = usePsalesStore();
const { paymentList } = storeToRefs(psalesStore);
const { getPayment } = psalesStore;

const route = useRoute();
const { id } = route?.params;
const allData = ref(null);

const verifyData = ref({
  payment_method_id: "",
  paid_amount: "",
  amount_due: "",
  note: "",
});

onMounted(async () => {
  allData.value = await getSalesReturnDetails(id);
  await getPayment();
  verifyData.value.payment_method_id = 2;
  verifyData.value.note = allData.value?.note;
  verifyData.value.paid_amount = allData.value?.paid_amount;
  verifyData.value.amount_due = allData.value?.amount_due || 0;
});
</script>

<template>
  <MainLayout>
    <a-skeleton active v-if="isLoading" />
    <div class="grid grid-cols-3 gap-4" v-else>
      <div class="col-span-2">
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="purchase-table">
            <thead class="table-header">
              <tr>
                <th>SL</th>
                <th class="text-left">Item Name</th>
                <th class="text-right">Price</th>
                <th class="text-right">Qty.</th>
                <th class="text-right">Disc %</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr
                v-for="(product, index) in allData?.sale_return_products"
                :key="index"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ product?.product_name }}</td>
                <td class="text-right">
                  {{ Number(product?.price).toFixed(2) }}
                </td>
                <td class="text-right">
                  {{ Number(product?.quantity).toFixed(2) }}
                </td>
                <td class="text-right">
                  {{ Number(product?.discount_percent).toFixed(2) }}
                </td>
                <td class="text-right">
                  {{ Number(product?.total).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="right-side">
        <div class="border border-slate-300 px-3 py-2 mb-2">
          <div class="flex items-center">
            <p class="w-32 mb-2">Branch</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2"
              :value="allData?.branch?.organization_name"
              readonly
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Customer</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2"
              :value="allData?.customer_name"
              readonly
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Sub Total</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2 text-right"
              :value="allData?.sub_total"
              readonly
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Total</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2 text-right"
              :value="allData?.total"
              readonly
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Amount Due</p>
            <input
              type="number"
              class="w-full px-3 py-1 border mb-2 text-right"
              v-model="verifyData.amount_due"
              readonly
            />
          </div>
        </div>
        <!-- Total -->
        <div class="border border-slate-300 px-3 py-2 mb-2">
          <div class="flex items-center">
            <p class="w-32 mb-2">Total Paid</p>
            <input
              type="number"
              class="w-full bg-blue-100 outline-none px-3 py-2 border mb-2 text-right"
              v-model="verifyData.paid_amount"
              @input="
                verifyData.amount_due = Number(
                  allData?.total - verifyData.paid_amount
                ).toFixed(2)
              "
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Payment Method</p>

            <select
              class="w-full px-3 py-1 border mb-2 bg-blue-100 outline-none"
              v-model="verifyData.payment_method_id"
            >
              <template v-for="item in paymentList">
                <option :value="item?.id">{{ item?.name }}</option>
              </template>
            </select>
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Notes</p>
            <textarea
              type="text"
              class="w-full px-3 py-1 border mb-2 bg-blue-100 outline-none"
              rows="3"
              v-model="verifyData.note"
            ></textarea>
          </div>
        </div>
        <a-popconfirm
          :title="`Are you sure you want to accept ${allData?.suspend_request_user?.name} suspend request?`"
          ok-text="Yes"
          cancel-text="No"
          @confirm="getSaleReturnSuspended(id, $router)"
        >
          <button
            class="submit-btn mr-2"
            type="button"
            :style="
              allData?.suspend_request != 1
                ? 'background-color: #cccccc; color: #666666;'
                : ''
            "
            :disabled="allData?.suspend_request != 1"
          >
            Suspend
          </button>
        </a-popconfirm>
        <!-- <button class="submit-btn mr-2" type="button" @click="getSaleReturnSuspended(id, $router)">
          Suspend
        </button> -->
        <button
          class="cancel-btn mr-2"
          type="button"
          @click="getSaleReturnVerified(id, $router, verifyData)"
        >
          Verified
        </button>
        <button class="cancel-btn mr-2" type="button" @click="$router.go(-1)">
          Back
        </button>
        <a-spin v-if="isSubmitting" />
      </div>
    </div>
  </MainLayout>
</template>
