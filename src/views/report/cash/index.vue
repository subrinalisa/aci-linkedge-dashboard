<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { useDataStore } from "@/stores/data";
import reportSalesApi from "@/stores/report_sales_api.js";
import {
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons-vue";
import moment from "moment";
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";

const dataStore = useDataStore();
const { getCashReport } = dataStore;
const saleReport = ref(null);
const fromDate = ref("");
const toDate = ref("");
const genereate = ref(true);
const excel = ref(false);
const dateRange = ref(6);

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

const totalSubtotal = ref(0);
const totalSum = ref(0);
const handleFilter = async () => {
  saleReport.value = await getCashReport(fromDate.value, toDate.value);
};

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(saleReport.value?.cash_balance);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
  XLSX.writeFile(workbook, "Report.xlsx");
};
const denomination = ref([
  { name: "1000" },
  { name: "500" },
  { name: "200" },
  { name: "100" },
  { name: "50" },
  { name: "20" },
  { name: "10" },
  { name: "5" },
  { name: "2" },
  { name: "1" },
]);
</script>

<template>
  <MainLayout>
    <!-- Filter -->
    <div class="flex items-end mb-3">
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
      <div class="mr-3" v-if="excel">
        <button
          type="button"
          class="px-4 py-2 bg-green-700 text-white rounded-lg"
          @click="exportToExcel"
        >
          Excel Export
        </button>
      </div>
    </div>
    <h6 class="title">Cash Report</h6>
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>Date</th>
            <th
              class="text-center"
              v-for="(taka, index) in denomination"
              :key="index"
            >
              ৳. {{ taka?.name }}
            </th>
            <th class="text-center">Balance</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody
          class="table-body"
          v-for="(data, index) in saleReport?.cash_balance"
          :key="index"
        >
          <tr :class="data?.type == 1 ? 'bg-green-100' : 'bg-red-100'">
            <td>
              <span class="md:hidden mr-1 font-bold">Date:</span>
              {{ moment(data?.created_at).format("lll") }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">1000 Taka:</span>
              {{ data?.count_1000 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">500 Taka:</span>
              {{ data?.count_500 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">200 Taka:</span>
              {{ data?.count_200 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">100 Taka:</span>

              {{ data?.count_100 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">50 Taka:</span>

              {{ data?.count_50 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">20 Taka:</span>

              {{ data?.count_20 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">10 Taka:</span>

              {{ data?.count_10 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">5 Taka:</span>
              {{ data?.count_5 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">2 Taka:</span>
              {{ data?.count_2 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">1 Taka:</span>

              {{ data?.count_1 || 0 }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Balance:</span>
              {{
                data?.type == 1
                  ? data?.cash_opening_amount
                  : data?.cash_closing_amount
              }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Type:</span>
              {{ data?.type == 1 ? "Opening" : "Closing" }}
            </td>
          </tr>
        </tbody>
        <tbody v-if="!saleReport?.cash_balance?.length">
          <tr>
            <td colspan="13">No Data...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </MainLayout>
</template>
