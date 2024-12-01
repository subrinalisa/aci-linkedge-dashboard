<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { apiBase } from "@/config";
import Cookies from "js-cookie";
import axios from "axios";
import { onMounted, ref } from "vue";
import * as XLSX from "xlsx";

const minimumStockLevelReport = ref([]);
const backupReport = ref([]);
const isLoading = ref(false);

const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const getReport = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(`${apiBase}/report/minimum-stock-level`, config);
    isLoading.value = false;

    if (res?.status == 200) {
      minimumStockLevelReport.value = res?.data?.slice(0, 10);
      backupReport.value = res?.data;
      total.value = res?.data?.length;
    }
  } catch (err) {
    console.log(err);
    isLoading.value = false;
  }
};

const handlePagination = (pageNo) => {
  let pages = pageNo == 1 ? 0 : pageNo * 10;
  if (pageNo * 10 > backupReport.value?.length) {
    pages = backupReport.value?.length - 10;
  }
  console.log(Number(pages), Number(pages + 10));
  return (minimumStockLevelReport.value = backupReport.value?.slice(
    Number(pages),
    Number(pages + 10)
  ));
};
onMounted(async () => {
  await getReport();
});
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(backupReport.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Backup Report");
  XLSX.writeFile(wb, "report.xlsx");
};
</script>

<template>
  <MainLayout>
    <a-skeleton v-if="isLoading" />
    <div v-else>
      <ul class="space-y-2">
        <li>
          <h6 class="font-bold text-gray-700 text-lg">Formula:</h6>
        </li>
        <li class="pl-4 border-l-4 border-blue-500">
          <h2 class="font-semibold text-gray-800 text-xl">
            Fifteen Days Sales = (Last One Year Sales / 365) × 15 Days
          </h2>
        </li>
        <li class="pl-4 border-l-4 border-green-500">
          <h2 class="font-semibold text-gray-800 text-xl mb-4">
            Minimum Stock Level = Fifteen Days Sales - Current Stock
          </h2>
        </li>
      </ul>

      <button
        type="button"
        class="bg-green-600 px-3 py-2 rounded-md text-white mb-3 hover:bg-green-700"
        @click="exportToExcel()"
        v-if="!isLoading && backupReport?.length"
      >
        Excel Export
      </button>
      <div class="overflow-x-auto mb-3">
        <table class="purchase-table">
          <thead class="table-header">
            <tr>
              <th
                v-if="minimumStockLevelReport?.length > 0"
                v-for="(header, index) in Object.keys(minimumStockLevelReport[0] || {})"
                :key="index"
              >
                {{
                  header
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                }}
              </th>
            </tr>
          </thead>
          <tbody
            class="table-body"
            v-if="minimumStockLevelReport.length"
            v-for="(data, index) in minimumStockLevelReport"
            :key="index"
          >
            <tr>
              <td
                v-for="(value, key, idx) in data"
                :key="idx"
                :class="idx == 0 || idx == 1 ? 'text-left' : 'text-right'"
              >
                {{ value ? value : "Not Set" }}
              </td>
            </tr>
          </tbody>
          <tbody v-if="!minimumStockLevelReport?.length">
            <tr>
              <td colspan="11" class="text-center p-2">No Data...</td>
            </tr>
          </tbody>
        </table>
      </div>
      <a-pagination
        v-model:current="page"
        v-model:page-size="pageSize"
        :total="total"
        :show-total="(total) => `Total ${total} items`"
        show-quick-jumper
        :showSizeChanger="false"
        @change="handlePagination(page)"
      />
    </div>
  </MainLayout>
</template>
