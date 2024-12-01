<template>
  <MainLayout>
    <div class="text-right mb-3">
      <a-popover v-if="!isLoading" v-model:open="visible" title="Add Mobile Number" trigger="click">
        <template #content>
          <form @submit.prevent="handleSMS(mobile)">
            <input
              type="tel"
              placeholder="Enter mobile number"
              class="outline-none border px-2 py-1 w-full block"
              v-model="mobile"
            />
            <button class="sms-btn" type="submit">Send</button>
          </form>
        </template>
        <button
          type="button"
          class="border border-indigo-600 outline-none px-5 py-2 text-white min-w-fit mt-4 rounded-md bg-indigo-600 hover:bg-transparent hover:text-indigo-600 disabled:bg-gray-400 mr-2"
        >
          <i class="bi bi-chat-left-dots"></i>
        </button>
      </a-popover>

      <a-popover
        v-if="!isLoading"
        v-model:open="visibleWa"
        title="Add Mobile Number"
        trigger="click"
      >
        <template #content>
          <form @submit.prevent="handleWhatsapp(mobile)">
            <input
              type="tel"
              placeholder="Enter mobile number"
              class="outline-none border px-2 py-1 w-full block"
              v-model="mobile"
            />
            <button class="sms-btn" type="submit">Send</button>
          </form>
        </template>
        <button
          type="button"
          class="border border-[#25D366] outline-none px-5 py-2 text-white min-w-fit mt-4 rounded-md bg-[#25D366] hover:bg-transparent hover:text-[#25D366] disabled:bg-gray-400 mr-2"
        >
          <i class="bi bi-whatsapp"></i>
        </button>
      </a-popover>

      <button type="button" class="submit-btn mr-2" @click="handlePrint" v-if="!isLoading">
        Print
      </button>
      <button type="button" class="cancel-btn" @click="$router.go(-1)">Back</button>
    </div>
    <a-skeleton active v-if="isLoading" />
    <div class="bg-white p-5 rounded" ref="printSection" v-else>
      <div class="text-center mb-5">
        <p class="capitalize">Sales Receipt</p>
        <p>
          <strong>{{ moment(allData?.created_at).format("DD-MM-YYYY hh:mm A") }}</strong>
        </p>
        <p>Sale ID: {{ allData?.sale_code }}</p>
        <p class="capitalize">
          Employee: {{ allData?.customer_name }} / {{ allData?.sold_user?.name }} ({{
            allData?.sold_user?.roles?.at(0)?.name
          }})
        </p>
      </div>
      <div class="flex justify-between gap-3">
        <div class="mb-5">
          <h6 class="font-bold text-lg capitalize">
            {{ allData?.branch?.organization_name }} ({{ allData?.branch?.branch }})
          </h6>
          <p class="capitalize max-w-[180px]">{{ allData?.branch?.address }}</p>
          <p>{{ allData?.branch?.mobile }}</p>
        </div>
      </div>
      <div class="grid grid-cols-4">
        <h6 class="font-bold">Item Name</h6>
        <h6 class="font-bold text-right">Price</h6>
        <h6 class="font-bold text-right">Qty.</h6>
        <h6 class="font-bold text-right">Total</h6>
        <hr class="col-span-4 border-t border-dashed" />
        <template v-for="(product, index) in allData?.sale_products" :key="index">
          <p>
            {{ String(index + 1).padStart(2, "0") }}.
            {{ product?.product_name }}
          </p>
          <p class="text-right">{{ Number(product?.price)?.toFixed(2) }}</p>
          <p class="text-right">{{ Number(product?.quantity)?.toFixed(2) }}</p>
          <p class="text-right">
            {{ Number(Number(product?.price) * Number(product?.quantity))?.toFixed(2) }}
          </p>
          <hr class="col-span-4 border-t border-dashed" />
        </template>
        <h6 class="font-bold col-span-3 text-right">Total Payable</h6>
        <p class="text-right" v-html="calculateTotalPayable(allData?.sale_products)"></p>
        <h6 class="font-bold col-span-3 text-right">Less return / adjustment</h6>

        <p
          class="text-right"
          v-html="calculateAdvancePayment(allData?.sale_products, allData?.discount_entire_sale)"
        ></p>
        <h6 class="font-bold col-span-3 text-right">Sub Total</h6>
        <p class="text-right">{{ Number(allData?.total)?.toFixed(2) }}</p>
        <hr class="col-span-4 border-t border-dashed" />
      </div>
      <div class="text-center mt-10 col-span-4" v-if="user_permission.includes('qr-code')">
        <span class="text-center text-sm">Change return policy</span>
        <svg ref="barcodes" class="mx-auto" width="80" height="80"></svg>
      </div>
      <div class="text-center mt-10 col-span-4 mb-5" v-if="user_permission.includes('qr-code')">
        <svg ref="barcode" class="mx-auto" width="80" height="80"></svg>
      </div>
      <h6 class="font-bold text-center text-xl">
        Total:
        <span class="text-right text-xl">
          {{ Number(allData?.total)?.toFixed(2) }}
        </span>
      </h6>
      <h6 class="font-bold text-center text-xl">
        Due:
        <span class="text-right text-xl">
          {{ Number(allData?.amount_due || 0)?.toFixed(2) }}
        </span>
      </h6>
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
import axios from "axios";
import { apiBase } from "@/config";
import Cookies from "js-cookie";
import { showNotification } from "@/utilities/notification";

const verifyStore = useVerifyStore();
const { getSalesDetails } = verifyStore;
const { isLoading } = storeToRefs(verifyStore);
const user_permission = JSON.parse(localStorage.getItem("permissions"));

const route = useRoute();
const { id } = route?.params;
const allData = ref(null);
const barcode = ref(null);
const barcodes = ref(null);
const visible = ref(false);
const visibleWa = ref(false);
const mobile = ref();
const generateBarcode = (code) => {
  JsBarcode(barcode.value, code);
  JsBarcode(barcodes.value, code);
};

onMounted(async () => {
  allData.value = await getSalesDetails(id);
  // generateBarcode(allData?.value?.sale_code);
  mobile.value = allData.value?.customer?.contact?.replace(/\s+/g, "");
});

const printSection = ref(null);

const handlePrint = () => {
  const printContent = printSection.value.innerHTML;
  const originalContent = document.body.innerHTML;

  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
};
const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
const handleWhatsapp = async (mobile) => {
  const productList = allData.value?.sale_products
    ?.map(
      (product, index) =>
        `${index + 1}. *${product.product_name}*\nQuantity: ${product.quantity}\nTotal: ${
          product.total
        } ৳,`
    )
    .join("\n\n");
  const message = `Pharma POS,\n\nHere are your products:\n\n${productList}\n\nTotal Price: ${allData.value?.total}`;
  let contactNo = mobile?.replace(/\s+/g, "");
  // if (!contactNo?.startsWith("+880")) contactNo = `+880${contactNo}`;

  const data = {
    to: contactNo,
    message: message,
  };

  try {
    const res = await axios.post(`${apiBase}/send-whatsapp-message`, data, config);
    showNotification("success", "Message sent successfully");
    visibleWa.value = false;
  } catch (err) {
    showNotification("error", err?.message);
  }
};
const handleSMS = async (mobile) => {
  const productList = allData.value?.sale_products
    ?.map(
      (product, index) =>
        `${index + 1}. *${product.product_name}*\nQuantity: ${product.quantity}\nTotal: ${
          product.total
        } ৳,`
    )
    .join("\n\n");
  const message = `Pharma POS,\n\nHere are your products:\n\n${productList}\n\nTotal Price: ${allData.value?.total}`;
  let contactNo = mobile?.replace(/\s+/g, "");
  // if (!contactNo?.startsWith("+88")) contactNo = `+88${contactNo}`;

  const data = {
    to: contactNo,
    message: message,
  };

  try {
    const res = await axios.post(`${apiBase}/send-sms-message`, data, config);
    showNotification("success", "Message sent successfully");
    visible.value = false;

    await axios.get(res?.data?.url);
  } catch (err) {}
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
const calculateTotalPayable = (sale_products) => {
  if (sale_products) {
    const totalPayable = sale_products?.reduce((total, product) => {
      return Number(total) + Number(product.price) * Number(product.quantity);
    }, 0);

    return Number(totalPayable).toFixed(2);
  }
};
const calculateAdvancePayment = (sale_products, discount_entire_sale) => {
  if (sale_products) {
    const advancePayment = sale_products?.reduce((total, product) => {
      return (
        Number(total) + (Number(product.price) * Number(product.quantity) - Number(product.total))
      );
    }, 0);

    return Number(Number(advancePayment) + Number(discount_entire_sale)).toFixed(2);
  }
};
</script>
<style scoped>
@media print {
  * {
    font-size: 8px !important;
  }
}
</style>
