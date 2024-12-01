<script setup>
// created By Fuad
import MainLayout from "@/components/MainLayout.vue";
import Cookies from "js-cookie";
import axios from "axios";
import { ref } from "vue";
import { apiBase } from "@/config";
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";

const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const field = ref({
  supplier_id: null,
  category_id: null,
  inventory: null,
  product_id: null,
});
const suppliers = ref([]);
const categories = ref([]);
const products = ref([]);
const loading = ref(false);
const generateData = ref(false);

const result = ref([]);

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
    const response = await axios.get(
      `${apiBase}/report/inventory-summary-report`,
      {
        params: field.value,
        ...config,
      }
    );
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <!-- Supplier Field -->
        <div>
          <label for="supplier_id" class="block text-sm font-medium"
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

        <!-- Inventory Field -->
        <div>
          <label for="inventory" class="block text-sm font-medium text-gray-700"
            >Inventory</label
          >
          <v-select
            id="inventory"
            v-model="field.inventory"
            :options="[
              { label: 'In Stock', value: 'in_stock' },
              { label: 'Out Of Stock', value: 'out_of_stock' },
            ]"
            label="label"
            :reduce="(option) => option.value"
            placeholder="Select Inventory..."
            class="mt-1 block w-full v-select-custom"
          />
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
        <div class="mt-6 flex justify-end">
          <button
            @click="handleGenerate"
            :disabled="loading"
            class="min-w-32 text-white inline-block bg-[#000180] rounded-lg"
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
              class="max-w-sm h-full rounded overflow-hidden shadow-lg text-white bg-[#6366f1]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{
                    parseFloat(result?.total_items_in_inventory || 0).toFixed(2)
                  }}
                </div>
                <p class="text-base">Total items in inventory</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden shadow-lg text-white bg-[#9333EA]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{
                    parseFloat(result?.total_inventory_value || 0).toFixed(2)
                  }}
                </div>
                <p class="text-base">Total Inventory Value</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden shadow-lg text-white bg-[#0D9488]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{
                    parseFloat(
                      result?.total_inventory_value_by_unit_price || 0
                    ).toFixed(2)
                  }}
                </div>
                <p class="text-base">Total Inventory Value By Unit Price</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden shadow-lg text-white bg-[#1E3A8A]"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{
                    parseFloat(
                      result?.weighted_average_cost_price || 0
                    ).toFixed(2)
                  }}
                </div>
                <p class="text-base">Weighted Average Cost Price</p>
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
                  Item ID
                </th>
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
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Supplier
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Item Number
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Product ID
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Description
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Size
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Location
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Cost Price
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Selling Price
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Count/Pice
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Total Inventory Value
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Total Inventory Value By Unit Price
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Pending Inventory (Suspended)
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Reorder Level
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Replenish Level
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider border border-gray-200"
                >
                  Order Amount
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
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 font-medium"
                >
                  <span class="md:hidden mr-1 font-bold">Item ID:</span>
                  {{ item.item_id }}
                </td>
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
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Supplier:</span>
                  {{ item.supplier }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Item Number:</span>
                  {{ item.item_number }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Product ID:</span>
                  {{ item.product_id }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Description:</span>
                  {{ item.description }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Size:</span>
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Location:</span>
                  {{ item.location }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold">Cost Price:</span>
                  {{ parseFloat(item.cost_price || 0).toFixed(2) }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold">Selling Price:</span>
                  {{ parseFloat(item.selling_price || 0).toFixed(2) }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold"
                    >Total Inventory Value:</span
                  >
                  {{ item.count_piece }}
                </td>

                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold"
                    >Total Inventory Value By Unit Price:</span
                  >
                  {{ parseFloat(item.total_inventory_value || 0).toFixed(2) }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200 text-right"
                >
                  <span class="md:hidden mr-1 font-bold"
                    >Pending Inventory (Suspended):</span
                  >
                  {{
                    parseFloat(
                      item.total_inventory_value_by_unit_price || 0
                    ).toFixed(2)
                  }}
                </td>

                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Reorder Level:</span>
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Reorder Level:</span>
                  {{ item.reorder_level }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Replenish Level:</span>
                  {{ item.replenish_level }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs border border-gray-200"
                >
                  <span class="md:hidden mr-1 font-bold">Order Amount:</span>
                </td>
              </tr>
              <tr v-else>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900"
                  colspan="18"
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
