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
  purchase_date_from: null,
  purchase_date_to: null,
  supplier_id: null,
});
const suppliers = ref([]);
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

const handleGenerate = async () => {
  loading.value = true;
  generateData.value = true;
  result.value = [];

  try {
    const response = await axios.get(
      `${apiBase}/report/store-account-activity-summary-report`,
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <!-- Purchase From Date Field -->
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
        </div>

        <!-- Purchase To Date Field -->
        <div>
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
              <span class="text-gray-500"
                >Type to search Select Supplier...</span
              >
            </template>
          </v-select>
        </div>
        <!-- Generate Button -->
        <div class="mt-6 flex justify-end">
          <button
            @click="handleGenerate"
            :disabled="loading"
            class="bg-blue-300 hover:bg-blue-400 text-blue-800 font-bold py-2 px-4 rounded inline-flex items-center"
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
              class="max-w-sm h-full rounded overflow-hidden shadow-lg bg-teal-400"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{ parseFloat(result?.total_debits || 0).toFixed(2) }}
                </div>
                <p class="text-gray-700 text-base">Debits</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden shadow-lg bg-teal-400"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{ parseFloat(result?.total_credits || 0).toFixed(2) }}
                </div>
                <p class="text-gray-700 text-base">Credits</p>
              </div>
            </div>
          </div>
          <div>
            <div
              class="max-w-sm h-full rounded overflow-hidden shadow-lg bg-teal-400"
            >
              <div class="px-6 py-4 h-full flex flex-col justify-center">
                <div class="font-bold text-xl mb-2">
                  {{
                    parseFloat(
                      result?.total_balance_of_all_store_accounts || 0
                    ).toFixed(2)
                  }}
                </div>
                <p class="text-gray-700 text-base">
                  Total Balance Of All Store Accounts
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Table for displaying report data -->

        <div class="mt-6 overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 border border-gray-200"
          >
            <thead class="bg-indigo-500">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border border-gray-200"
                >
                  Customer
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border border-gray-200 text-right"
                >
                  Debits
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border border-gray-200 text-right"
                >
                  Credits
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
                  class="px-4 py-2 whitespace-nowrap text-xs text-gray-500 border border-gray-200 text-left"
                >
                  <span class="md:hidden mr-1 font-bold">Customer:</span>
                  {{ item.company_name }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs text-gray-500 border border-gray-200 lg:text-right text-left"
                >
                  <span class="md:hidden mr-1 font-bold">Debits:</span>
                  {{ item.debits }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-xs text-gray-500 border border-gray-200 lg:text-right text-left"
                >
                  <span class="md:hidden mr-1 font-bold">Credits:</span>

                  -{{ item.credits }}
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
