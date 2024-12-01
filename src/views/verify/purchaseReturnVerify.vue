<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { useVerifyStore } from "@/stores/verify.js";
import { usePsalesStore } from "@/stores/psales";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const verifyStore = useVerifyStore();
const {
  getPurchaseReturnDetails,
  getPurchaseReturnSuspended,
  getPurchaseReturnVerified,
} = verifyStore;
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
  allData.value = await getPurchaseReturnDetails(id);
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
                <th class="text-center">SL</th>
                <th class="text-left">Item Name</th>
                <th class="text-left">Pack Size</th>
                <th class="text-right">TP</th>
                <th class="text-right">VAT</th>
                <th class="text-right">Cost</th>
                <th class="text-right">Qty.</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr
                v-for="(product, index) in allData?.purchase_return_products"
                :key="index"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td class="w-full">
                  <p>{{ product?.product_name }}</p>
                  <div class="mt-3">
                    <p>
                      <span class="font-semibold">Size:</span>
                      {{ product?.size }}
                    </p>
                    <p>
                      <span class="font-semibold">Generic Name:</span>
                      {{ product?.generic_name || "Empty" }}
                    </p>
                    <p>
                      <span class="font-semibold">Serial:</span>
                      {{ product?.serial || "Empty" }}
                    </p>
                    <p>
                      <span class="font-semibold">Stock:</span>
                      {{ product?.stock || "Empty" }}
                    </p>
                    <p>
                      <span class="font-semibold">Cost Price Preview:</span>
                      {{ Number(product?.cost)?.toFixed(2) }}
                    </p>
                    <p>
                      <span class="font-semibold">Item Id:</span>
                      {{ product?.id || "-" }}
                    </p>
                    <p>
                      <span class="font-semibold">Expire Date:</span>
                      {{ product?.expiry_date || "Empty" }}
                    </p>
                  </div>
                </td>
                <td>{{ product?.pack_size?.name }}</td>
                <td class="text-right">
                  {{ Number(product?.tp).toFixed(2) }}
                </td>
                <td class="text-right">
                  {{ Number(product?.vat).toFixed(2) }}
                </td>
                <td class="text-right">
                  {{ Number(product?.cost).toFixed(2) }}
                </td>
                <td class="text-right min-w-20">
                  {{ Number(product?.quantity).toFixed(2) }}
                </td>
                <td class="text-right">{{ product?.total }}</td>
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
            <p class="w-32 mb-2">MRR</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2"
              :value="allData?.mrr?.name"
              readonly
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Supplier</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2"
              :value="allData?.supplier?.company_name"
              readonly
            />
          </div>
        </div>
        <!-- Total -->
        <div class="border border-slate-300 px-3 py-2 mb-2">
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
            <p class="w-32 mb-2">Gatis %</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2 text-right"
              :value="allData?.getis_percent"
              readonly
            />
          </div>
          <div class="flex items-center">
            <p class="w-32 mb-2">Gatis (৳)</p>
            <input
              type="text"
              class="w-full px-3 py-1 border mb-2 text-right"
              :value="allData?.amount"
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

        <div class="border border-slate-300 px-3 py-2 mb-2">
          <div class="flex items-center">
            <p class="w-32 mb-2">Payment Method</p>
            <select
              class="w-full px-3 py-1 border mb-2 bg-blue-100 outline-none"
              v-model="verifyData.payment_method_id"
              @change="
                () => {
                  if (verifyData.payment_method_id == 6) {
                    verifyData.amount_due = allData?.total;
                    verifyData.paid_amount = 0;
                  } else {
                    verifyData.paid_amount = allData?.total;
                    verifyData.amount_due = Number(
                      allData?.total - verifyData.paid_amount
                    ).toFixed(2);
                  }
                }
              "
            >
              <template v-for="item in paymentList">
                <option :value="item?.id">{{ item?.name }}</option>
              </template>
            </select>
          </div>
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
          @confirm="getPurchaseReturnSuspended(id, $router)"
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
        <!-- <button class="submit-btn mr-2" type="button" @click="getPurchaseReturnSuspended(id, $router)">
          Suspend
        </button> -->
        <button
          class="cancel-btn mr-2"
          type="button"
          @click="getPurchaseReturnVerified(id, $router, verifyData)"
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
