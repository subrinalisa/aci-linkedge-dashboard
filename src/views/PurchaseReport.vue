<script setup>
import MainLayout from "@/components/MainLayout.vue";
import moment from "moment";
import { ref } from "vue";
import { useDataStore } from "@/stores/data";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons-vue";

const dataStore = useDataStore();
const { getPurchaseReport } = dataStore;

const purchaseReport = ref(null);
const fromDate = ref(null);
const toDate = ref(null);
const showProducts = ref(null);

const handleFilter = async () => {
  purchaseReport.value = await getPurchaseReport(fromDate.value, toDate.value);
};
</script>

<template>
  <MainLayout>
    <h6 class="font-medium mb-3">Reports</h6>
    <!-- Filter -->
    <div class="flex items-end">
      <div class="mr-3">
        <label class="block mb-1">From Date</label>
        <input
          type="date"
          placeholder="Search"
          class="px-4 py-2 border rounded"
          v-model="fromDate"
        />
      </div>
      <div class="mr-3">
        <label class="block mb-1">To Date</label>
        <input
          type="date"
          placeholder="Search"
          class="px-4 py-2 border rounded"
          v-model="toDate"
        />
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-[#000180] text-white rounded-lg"
          @click="handleFilter"
        >
          Submit
        </button>
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-[#000180] text-white rounded-lg"
        >
          Print
        </button>
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-[#000180] text-white rounded-lg"
        >
          Excel Export
        </button>
      </div>
    </div>
    <!-- table -->
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>Actions</th>
            <th>ID</th>
            <th>Date</th>
            <th>Items Ordered</th>
            <th>Quantity</th>
            <th class="text-left">Supplied by</th>
            <th>Subtotal</th>
            <th>Payment Type</th>
            <th>Discount</th>
            <th>Getis</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody
          class="table-body"
          v-for="(data, index) in purchaseReport?.purchases"
          :key="index"
        >
          <tr class="text-center">
            <td>
              <button
                class="px-2 py-1 bg-green-600 text-white rounded hover:bg-indigo-600 mr-2"
              >
                <EditOutlined class="align-middle" />
              </button>
              <button
                class="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-600 mr-2"
                title="Show Products"
                @click="showProducts = data?.id"
              >
                <PlusOutlined class="align-middle" />
              </button>
              <button
                class="px-2 py-1 bg-[#000180] text-white rounded hover:bg-indigo-600 mr-2"
                title="Show Receipt"
              >
                <EyeOutlined class="align-middle" />
              </button>
            </td>
            <td>{{ data?.id }}</td>
            <td>{{ moment(data?.purchase_date).format("YYYY-MM-DD") }}</td>
            <td>{{ data?.purchase_products?.length }}</td>
            <td>{{ data?.sale_products?.length }}</td>
            <td class="text-left">{{ data?.supplier?.company_name }}</td>
            <td class="text-right">{{ data?.sub_total }}</td>
            <td>{{ data?.payment_method_id }}</td>
            <td>{{ "-" }}</td>
            <td>{{ data?.getis_percent }}% ({{ data?.amount }} TK)</td>
            <td>{{ data?.note }}</td>
          </tr>
          <template v-if="data?.id == showProducts">
            <tr class="text-left whitespace-nowrap">
              <th>Product ID</th>
              <th colspan="3">Name</th>
              <th colspan="3">Description</th>
              <th class="text-right">Selling Price</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Total</th>
            </tr>
            <tr v-if="!data?.purchase_products?.length">
              <td colspan="13">No Product</td>
            </tr>
            <tr v-for="product in data?.purchase_products" :key="data?.id">
              <td>{{ product?.product_id }}</td>
              <td colspan="3">{{ product?.product_name }}</td>

              <td colspan="3">{{ product?.generic_name }}</td>
              <td class="text-right">{{ product?.cost_price_preview }}</td>
              <td class="text-right">{{ product?.quantity }}</td>
              <td class="text-right">{{ product?.tp }}</td>
              <td class="text-right">{{ product?.tp }}</td>
            </tr></template
          >
        </tbody>
        <tbody v-if="!purchaseReport?.purchases?.length">
          <tr>
            <td colspan="11">No Data...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </MainLayout>
</template>
