<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { useDataStore } from "@/stores/data";
import {
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons-vue";
import moment from "moment";
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";

const dataStore = useDataStore();
const { getPurchaseReport } = dataStore;

const purchaseReport = ref(null);
const fromDate = ref(null);
const toDate = ref(null);
const showProducts = ref(null);

const handleFilter = async () => {
  purchaseReport.value = await getPurchaseReport(fromDate.value, toDate.value);
  totalSubtotal.value = purchaseReport.value.purchases.reduce((acc, sale) => {
    return acc + parseFloat(sale.sub_total);
  }, 0);
  totalSum.value = purchaseReport.value.purchases.reduce((acc, sale) => {
    return acc + parseFloat(sale.total);
  }, 0);
};
const dateRange = ref(6);
const totalSubtotal = ref(0);
const totalSum = ref(0);
onMounted(() => {
  const currDate = moment(new Date()).format("YYYY-MM-DD");
  fromDate.value = currDate;
  toDate.value = currDate;
  handleFilter();
});
const handleDateRange = (choice) => {
  const numericChoice = Number(choice);
  const currDate = moment(new Date()).format("YYYY-MM-DD");

  switch (numericChoice) {
    case 0:
      fromDate.value = moment(currDate)
        .subtract(1, "year")
        .format("YYYY-MM-DD");
      toDate.value = currDate;
      break;
    case 1:
      fromDate.value = moment(currDate)
        .subtract(1, "week")
        .format("YYYY-MM-DD");
      toDate.value = currDate;
      break;
    case 2:
      fromDate.value = moment(currDate)
        .subtract(1, "month")
        .format("YYYY-MM-DD");
      toDate.value = currDate;
      break;
    case 3:
      fromDate.value = moment(currDate)
        .subtract(14, "days")
        .format("YYYY-MM-DD");
      toDate.value = currDate;
      break;
    case 4:
      fromDate.value = moment(currDate).startOf("month").format("YYYY-MM-DD");
      toDate.value = currDate;
      break;
    case 5:
      fromDate.value = moment(currDate).subtract(1, "day").format("YYYY-MM-DD");
      toDate.value = moment(currDate).subtract(1, "day").format("YYYY-MM-DD");
      break;
    case 6:
      fromDate.value = currDate;
      toDate.value = currDate;
      break;

    default:
      fromDate.value = "";
      toDate.value = "";
  }
};
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(purchaseReport.value?.purchases);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
  XLSX.writeFile(workbook, "Report.xlsx");
};
</script>

<template>
  <MainLayout>
    <!-- Filter -->
    <div class="md:flex space-y-1 items-end mb-3">
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
      <div class="mr-3" v-if="dateRange == 7">
        <label class="block mb-1">From Date</label>
        <input
          type="date"
          placeholder="Search"
          class="px-4 py-2 border rounded"
          v-model="fromDate"
        />
      </div>
      <div class="mr-3" v-if="dateRange == 7">
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
          Generate Report
        </button>
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-green-700 text-white rounded-lg"
          @click="exportToExcel"
        >
          Excel Export
        </button>
      </div>
    </div>
    <h6 class="title">Purchases Report</h6>
    <!-- table -->
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>Actions</th>
            <th>ID</th>
            <th>Date</th>
            <th>Items Ordered</th>
            <th>Supplied by</th>
            <th class="text-right">Subtotal</th>
            <th class="text-right">total</th>
            <th>Payment Type</th>
            <th>Getis</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody
          class="table-body"
          v-for="(data, index) in purchaseReport?.purchases"
          :key="index"
        >
          <tr>
            <td>
              <button
                class="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-600 mr-2"
                title="Show Products"
                @click="showProducts = data?.id"
                v-if="showProducts != data?.id"
              >
                <PlusOutlined class="align-middle" />
              </button>
              <button
                class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-600 mr-2"
                title="Show Products"
                v-if="showProducts == data?.id"
                @click="showProducts = null"
              >
                <MinusOutlined class="align-middle" />
              </button>
              <button
                class="px-2 py-1 bg-[#000180] text-white rounded hover:bg-indigo-600 mr-2"
                title="Show Receipt"
                @click="
                  $router.push({
                    name: 'purchases-receipt',
                    params: { id: data?.id },
                  })
                "
              >
                <EyeOutlined class="align-middle" />
              </button>
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">ID:</span>

              {{ data?.id }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Date:</span>
              {{ moment(data?.purchase_date).format("ll") }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Items Ordered:</span>

              {{ data?.purchase_products?.length }}
            </td>

            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Supplied By:</span>

              {{ data?.supplier?.company_name }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Subtotal:</span>
              {{ Number(data?.sub_total).toFixed(2) }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Total:</span>

              {{ Number(data?.total).toFixed(2) }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Payment Type:</span>
              {{ data?.payment_method?.name }}
            </td>

            <td>
              <span class="md:hidden mr-1 font-bold">Getis:</span>
              {{ Number(data?.getis_percent).toFixed(2) }}% ({{
                Number(data?.amount).toFixed(2)
              }}
              TK)
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Comments:</span>
              {{ data?.note }}
            </td>
          </tr>
          <template v-if="data?.id == showProducts">
            <tr class="text-left whitespace-nowrap">
              <th>Product ID</th>
              <th colspan="4">Name</th>
              <th class="text-right">Selling Price</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Total</th>
            </tr>
            <tr v-if="!data?.purchase_products?.length">
              <td colspan="14">No Product</td>
            </tr>
            <tr v-for="product in data?.purchase_products" :key="data?.id">
              <td>{{ product?.product_id }}</td>
              <td colspan="5">{{ product?.product_name }}</td>

              <td class="text-right">{{ product?.cost_price_preview }}</td>
              <td class="text-right">{{ product?.quantity }}</td>
              <td class="text-right">{{ product?.tp }}</td>
              <td class="text-right">{{ product?.tp }}</td>
            </tr></template
          >
        </tbody>
        <tbody v-if="!purchaseReport?.purchases?.length">
          <tr>
            <td colspan="12">No Data...</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="font-semibold text-lg text-right">TOTAL</td>
            <td class="font-semibold text-lg text-right">
              {{ Number(totalSubtotal).toFixed(2) }}
            </td>
            <td class="font-semibold text-lg text-right">
              {{ Number(totalSum).toFixed(2) }}
            </td>
            <td colspan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </MainLayout>
</template>
