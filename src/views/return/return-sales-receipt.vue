<template>
  <MainLayout>
    <div class="text-right mb-3">
      <button
        type="button"
        class="submit-btn mr-2"
        @click="handlePrint"
        v-if="!isLoading"
      >
        Print
      </button>
      <button type="button" class="cancel-btn" @click="$router.go(-1)">
        Back
      </button>
    </div>
    <a-skeleton active v-if="isLoading" />
    <div class="bg-white p-5 rounded" ref="printSection" v-else>
      <div class="text-center mb-5">
        <p>
          <strong>{{ moment(allData?.created_at).format("LLL") }}</strong>
        </p>
        <p>Receiving ID: {{ allData?.sale_code }}</p>
        <p class="capitalize">Employee: {{ allData?.sold_user?.name }}</p>
        <p class="capitalize">{{ statusCheck(allData?.verify_status) }}</p>
      </div>
      <div class="flex justify-between gap-3">
        <div class="mb-5">
          <h6 class="font-bold text-lg capitalize">Pharma POS</h6>
          <p>M.M ISLAM PLAZA</p>
          <p>PLOT#13, BLOCK:B</p>
          <p>Tejgaon, DHAKA-1216</p>
          <p>01701010101</p>
        </div>
        <div class="mb-5">
          <p><b>Branch:</b> {{ allData?.branch?.organization_name }}</p>
          <p>
            <b>Customer:</b>
            {{ allData?.customer?.first_name }}
          </p>
          <p><b>Payment Method:</b> {{ allData?.payment_method?.name }}</p>
        </div>
      </div>

      <div class="grid grid-cols-5">
        <h6 class="font-bold">Item Name</h6>
        <h6 class="font-bold text-right">Price</h6>
        <h6 class="font-bold text-right">Qty.</h6>
        <h6 class="font-bold text-right">Disc %</h6>
        <h6 class="font-bold text-right">Total</h6>
        <hr class="col-span-5 border-t border-dashed" />
        <template
          v-for="(product, index) in allData?.sale_return_products"
          :key="index"
        >
          <p>
            {{ String(index + 1).padStart(2, "0") }}.
            {{ product?.product_name }}
          </p>
          <p class="text-right">{{ Number(product?.price)?.toFixed(2) }}</p>
          <p class="text-right">{{ Number(product?.quantity)?.toFixed(2) }}</p>
          <p class="text-right">
            {{ Number(product?.discount_percent)?.toFixed(2) }}
          </p>
          <p class="text-right">
            {{ Number(product?.total)?.toFixed(2) }}
          </p>
          <hr class="col-span-5 border-t border-dashed" />
        </template>
        <h6 class="font-bold col-span-4 text-right">Subtotal</h6>
        <p class="text-right">{{ Number(allData?.sub_total)?.toFixed(2) }}</p>
        <h6 class="font-bold col-span-4 text-right">Entire Discount</h6>
        <p class="text-right">
          (-)
          {{
            allData?.discount_entire_sale
              ? Number(allData?.discount_entire_sale)?.toFixed(2)
              : 0
          }}
        </p>
        <hr class="col-span-5 border-t border-dashed" />
        <h6 class="font-bold col-span-4 text-right text-xl">Total</h6>
        <p class="text-right text-xl">
          {{ Number(allData?.total)?.toFixed(2) }}
        </p>
        <h6 class="font-bold col-span-4 text-right">Total Paid</h6>
        <p class="text-right">
          {{ Number(allData?.paid_amount)?.toFixed(2) }}
        </p>
        <h6 class="font-bold col-span-4 text-right text-red-600">Due</h6>
        <p class="text-right text-red-600">
          {{ Number(allData?.amount_due)?.toFixed(2) }}
        </p>
      </div>
      <div class="text-center mt-10">
        <svg ref="barcode" class="inline-block"></svg>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import moment from "moment";
import JsBarcode from "jsbarcode";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useVerifyStore } from "@/stores/verify.js";

const verifyStore = useVerifyStore();
const { getSalesReturnDetails } = verifyStore;
const { isLoading } = storeToRefs(verifyStore);

const route = useRoute();
const { id } = route?.params;
const allData = ref(null);
const barcode = ref(null);
const generateBarcode = (code) => JsBarcode(barcode.value, code);

onMounted(async () => {
  allData.value = await getSalesReturnDetails(id);
  generateBarcode(allData?.value?.sale_code);
});

const printSection = ref(null);

const handlePrint = () => {
  const printContent = printSection.value.innerHTML;
  const originalContent = document.body.innerHTML;

  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
};
const statusCheck = (number) => {
  switch (Number(number)) {
    case 1:
      return "Verified Sale";
    case 2:
      return "Suspend Sale";
    default:
      return "Pending Sale";
  }
};
</script>
