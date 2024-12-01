<script setup>
// created By Fuad
import MainLayout from "@/components/MainLayout.vue";
import Cookies from "js-cookie";
import axios from "axios";
import { ref } from "vue";
import { apiBase } from "@/config";
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";
import moment from "moment";

const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const field = ref({
  purchase_date_from: null,
  purchase_date_to: null,
  supplier_id: null,
  category_id: null,
  product_id: null,
});
const suppliers = ref([]);
const categories = ref([]);
const products = ref([]);
const loading = ref(false);
const generateData = ref(false);
const result = ref([]);

// seleted by DateRange
const fromDate = ref("");
const toDate = ref("");
const dateRange = ref(6);

const handleDateRange = (choice) => {
  const numericChoice = Number(choice);
  const currDate = moment(new Date()).format("YYYY-MM-DD");

  switch (numericChoice) {
    case 0:
      field.value.purchase_date_from = moment(currDate)
        .subtract(1, "year")
        .format("YYYY-MM-DD");
      field.value.purchase_date_to = currDate;
      break;
    case 1:
      field.value.purchase_date_from = moment(currDate)
        .subtract(1, "week")
        .format("YYYY-MM-DD");
      field.value.purchase_date_to = currDate;
      break;
    case 2:
      field.value.purchase_date_from = moment(currDate)
        .subtract(1, "month")
        .format("YYYY-MM-DD");
      field.value.purchase_date_to = currDate;
      break;
    case 3:
      field.value.purchase_date_from = moment(currDate)
        .subtract(14, "days")
        .format("YYYY-MM-DD");
      field.value.purchase_date_to = currDate;
      break;
    case 4:
      field.value.purchase_date_from = moment(currDate)
        .startOf("month")
        .format("YYYY-MM-DD");
      field.value.purchase_date_to = currDate;
      break;
    case 5:
      field.value.purchase_date_from = moment(currDate)
        .subtract(1, "day")
        .format("YYYY-MM-DD");
      field.value.purchase_date_to = moment(currDate)
        .subtract(1, "day")
        .format("YYYY-MM-DD");
      break;
    case 6:
      field.value.purchase_date_from = currDate;
      field.value.purchase_date_to = currDate;
      break;

    default:
      field.value.purchase_date_from = "";
      field.value.purchase_date_to = "";
  }
};

const onSearchSupplier = async (query, loading) => {
  if (query.length < 1) return;
  loading(true);

  try {
    const response = await axios.get(
      `${apiBase}/supplier/search?term=${query}`,
      config
    );
    suppliers.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading(false);
  }
};

const onSearchCategory = async (query, loading) => {
  if (query.length < 1) return;
  loading(true);
  try {
    const response = await axios.get(
      `${apiBase}/category/search?term=${query}`,
      config
    );
    categories.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading(false);
  }
};

const onSearchProduct = async (query, loading) => {
  if (query.length < 1) return;
  loading(true);

  try {
    const response = await axios.get(
      `${apiBase}/only-products/search?term=${query}`,
      config
    );
    products.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading(false);
  }
};

const handleGenerate = async () => {
  loading.value = true;
  generateData.value = true;
  result.value = [];

  try {
    const response = await axios.get(`${apiBase}/report/items-summary-report`, {
      params: field.value,
      ...config,
    });
    result.value = response.data;
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <MainLayout>
    <div class="p-6 bg-white rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <!-- Purchase From Date Field -->
        <!-- 
        <div>
          <label
            for="purchase_date_from"
            class="block text-sm font-medium text-gray-700"
            >Purchase From Date</label
          >
          <input
            type="date"
            v-model="field.purchase_date_from"
            id="purchase_date_from"
            class="mt-1 block w-full custom-field"
          />
        </div> -->

        <!-- Purchase To Date Field -->
        <!-- <div>
          <label
            for="purchase_date_to"
            class="block text-sm font-medium text-gray-700"
            >Purchase To Date</label
          >
          <input
            type="date"
            v-model="field.purchase_date_to"
            id="purchase_date_to"
            class="mt-1 block w-full custom-field"
          />
        </div> -->

        <!-- {{ fromDate }} --- {{ toDate }} -->

        <div class="mr-3">
          <label class="block mb-1">Date Range</label>
          <select
            class="px-4 py-2 border rounded"
            v-model="dateRange"
            @change="handleDateRange($event?.target?.value)"
          >
            <option value="">Select Date Range</option>
            <option value="0">Last Year</option>
            <option value="1">Last Week</option>
            <option value="2">Last Month</option>
            <option value="3">Last 14 Days</option>
            <option value="4">This Month</option>
            <option value="5">Yesterday</option>
            <option value="6">Today</option>
            <option value="7">Custom</option>
          </select>
        </div>

        <!-- Supplier Field -->
        <div>
          <label
            for="supplier_id"
            class="block text-sm font-medium text-gray-700"
            >Supplier</label
          >
          <v-select
            id="supplier_id"
            v-model="field.supplier_id"
            @search="onSearchSupplier"
            :options="suppliers"
            label="company_name"
            :reduce="(supplier) => supplier.id"
            placeholder="Select Supplier..."
            class="mt-1 block w-full v-select-custom"
          >
            <template #no-options>
              <span class="">Type to search Select Supplier...</span>
            </template>
          </v-select>
        </div>

        <!-- Category Field -->
        <div>
          <label
            for="category_id"
            class="block text-sm font-medium text-gray-700"
            >Category</label
          >
          <v-select
            id="category_id"
            v-model="field.category_id"
            @search="onSearchCategory"
            :options="categories"
            label="name"
            :reduce="(category) => category.id"
            placeholder="Select Category..."
            class="mt-1 block w-full v-select-custom"
          >
            <template #no-options>
              <span class="">Type to search Select Category...</span>
            </template>
          </v-select>
        </div>

        <!-- Product Field -->
        <div>
          <label
            for="product_id"
            class="block text-sm font-medium text-gray-700"
            >Product</label
          >
          <v-select
            id="product_id"
            v-model="field.product_id"
            @search="onSearchProduct"
            :options="products"
            label="name"
            :reduce="(product) => product.id"
            placeholder="Select Product..."
            class="mt-1 block w-full v-select-custom"
          >
            <template #no-options>
              <span class="">Type to search Select Product...</span>
            </template>
          </v-select>
        </div>

        <!-- Generate Button -->
        <div class="flex">
          <button
            @click="handleGenerate"
            :disabled="loading"
            class="text-white min-w-32 inline-block bg-[#000180] sm:p-2 rounded-lg mt-6 lg:ml-6"
          >
            <a-spin v-if="loading" />
            <span v-else class="ml-2">Generate</span>
          </button>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto" v-if="generateData">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden text-white shadow-lg bg-[#6366f1]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{ parseFloat(result?.sub_total || 0).toFixed(2) }}
                </div>
                <p class="text-base">Subtotal</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden text-white shadow-lg bg-[#9333EA]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{ parseFloat(result?.total || 0).toFixed(2) }}
                </div>
                <p class="text-base">Total</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden text-white shadow-lg bg-[#0D9488]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{ parseFloat(result?.total_vat || 0).toFixed(2) }}
                </div>
                <p class="text-base">Tax</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden text-white shadow-lg bg-[#1E3A8A]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{ parseFloat(result?.damaged_qty || 0).toFixed(2) }}
                </div>
                <p class="text-base">Damaged Qty</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Table for displaying report data -->

        <div class="mt-6 overflow-x-auto">
          <table class="purchase-table">
            <thead class="table-header">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Item Name
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Category
                </th>
                <th
                  class="px-4 py-2 text-xs font-medium uppercase tracking-wider border border-gray-200 text-right"
                >
                  Quantity
                </th>
                <th
                  class="px-4 py-2 text-xs font-medium uppercase tracking-wider border border-gray-200 text-right"
                >
                  Quantity Sold
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-if="result?.reportData?.length > 0"
                v-for="item in result?.reportData"
                :key="item.item_id"
                class="odd:bg-gray-100"
              >
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Item Name:</span>

                  {{ item.item_name }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Category:</span>
                  {{ item.category }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold">Quantity:</span>
                  {{ item.received_quantity }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold">Quantity Sold:</span>
                  {{ item.quantity_sold }}
                </td>
              </tr>
              <tr
                v-if="result?.reportData?.length > 0"
                class="bg-indigo-600 text-white"
              >
                <td
                  colspan="2"
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  Total
                </td>

                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  {{
                    parseFloat(result?.total_received_quantity || 0).toFixed(2)
                  }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  {{ parseFloat(result?.total_quantity_sold || 0).toFixed(2) }}
                </td>
              </tr>
              <tr v-else>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900"
                  colspan="4"
                >
                  No Data Found!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style>
@import "vue-select/dist/vue-select.css";

.custom-field {
  border: 1px solid #cdcdcd;
  border-radius: 5px;
  height: 40px !important;
  padding: 0.5rem !important;
}

.custom-field:focus {
  outline: none;
}

/* Ensure the dropdown menu appears above other elements */
.v-select-custom .vs__dropdown-menu {
  z-index: 9999 !important;
}

/* Fixed height for consistency */
.v-select-custom .vs__dropdown-toggle {
  height: 40px !important;
  padding: 0.5rem !important;
}

/* Ensure selected options text does not wrap and shows ellipsis if needed */
.v-select-custom .vs__selected {
  white-space: nowrap;
  /* Prevent text from wrapping */
  overflow: hidden;
  /* Hide overflow text */
  text-overflow: ellipsis;
  /* Show ellipsis (...) for overflow text */
  max-width: 200px;
}

/* Ensure table responsiveness */
@media (max-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    display: none;
  }

  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  td {
    text-align: right;
    position: relative;
    padding-left: 50%;
    padding-right: 10px;
    border-bottom: 1px solid #e5e7eb;
  }

  td::before {
    content: attr(data-label);
    position: absolute;
    left: 0;
    width: 45%;
    padding-left: 10px;
    font-weight: bold;
    color: #4b5563;
  }
}
</style>
