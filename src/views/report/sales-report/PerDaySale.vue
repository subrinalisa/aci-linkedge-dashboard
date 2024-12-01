<script setup>
import MainLayout from "@/components/MainLayout.vue";
import axios from "axios";
import moment from "moment";
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";
import Cookies from "js-cookie";
import { apiBase } from "@/config";

const fromDate = ref("");
const toDate = ref("");

const dateRange = ref(6);

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
const isLoading = ref(false);
const allData = ref([]);
const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
const getReport = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${apiBase}/report/per-day-sale?date_from=${fromDate.value}&date_to=${toDate.value}`,
      config
    );
    if (res?.status == 200) {
      allData.value = res?.data;
    }
    console.log(res);
    isLoading.value = false;
  } catch (err) {
    isLoading.value = false;
    allData.value = [];
  }
};
onMounted(async () => {
  const currDate = moment(new Date()).format("YYYY-MM-DD");
  fromDate.value = currDate;
  toDate.value = currDate;
  await getReport();
});
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(allData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Backup Report");
  XLSX.writeFile(wb, "report.xlsx");
};
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
          @click="getReport"
        >
          Generate Report
        </button>
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-green-700 text-white rounded-lg"
          @click="exportToExcel"
          v-if="allData?.length"
        >
          Excel Export
        </button>
      </div>
    </div>
    <h6 class="title">Report</h6>
    <!-- table -->
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>date</th>
            <th>branch</th>
            <th class="text-right">discount percent</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="6">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !allData?.length">
            <td colspan="6">No Data Found</td>
          </tr>

          <tr v-for="(item, index) in allData" :key="index">
            <td>
              <span class="md:hidden mr-1 font-bold">Date:</span>
              {{
                `${item?.sale_date ? moment(item?.sale_date).format("LL") : ""}`
              }}
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Branch:</span>
              {{ item?.branch }}
            </td>
            <td class="text-right">
              <span class="md:hidden mr-1 font-bold">Discount Percent:</span>

              {{ Number(item?.discount_percent).toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </MainLayout>
</template>
