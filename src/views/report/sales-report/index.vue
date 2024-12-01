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
const { getSaleReport } = dataStore;

const saleReport = ref(null);
const summaryReport = ref(null);
const fromDate = ref("");
const toDate = ref("");
const showProducts = ref(null);

const genereate = ref(true);
const summery = ref(false);
const graphical = ref(false);
const excel = ref(false);
const chartOptions = ref({
  xaxis: {
    type: "category",
    group: {
      style: {
        fontSize: "10px",
        fontWeight: 700,
      },
      groups: [
        { title: "2019", cols: 4 },
        { title: "2020", cols: 4 },
      ],
    },
  },
  title: {
    text: "Monthly Sales",
  },
  tooltip: {},
});

const data = ref([]);

const series = ref([
  {
    name: "sales",
    data: data,
  },
]);
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
  handleviewGenereate();
  saleReport.value = await getSaleReport(fromDate.value, toDate.value);
  totalSubtotal.value = saleReport.value.sales.reduce((acc, sale) => {
    return acc + parseFloat(sale.sub_total);
  }, 0);
  totalSum.value = saleReport.value.sales.reduce((acc, sale) => {
    return acc + parseFloat(sale.total);
  }, 0);
};
const handleSummery = async () => {
  handleviewSummery();
  const response = await reportSalesApi.fetchSummeryData(
    fromDate.value,
    toDate.value
  );

  summaryReport.value = response.data.sales;
  totalSubtotal.value = summaryReport.value.reduce((acc, sale) => {
    return acc + parseFloat(sale.sub_total);
  }, 0);
  totalSum.value = summaryReport.value.reduce((acc, sale) => {
    return acc + parseFloat(sale.total_sales);
  }, 0);
};
const handleGraphical = async () => {
  handleviewGraphical();
  const response = await reportSalesApi.fetchGraphicalData(
    fromDate.value,
    toDate.value
  );
  console.log(response.data.sales);
  data.value = response.data.sales;
};

const handleviewGraphical = async () => {
  genereate.value = false;
  graphical.value = true;
  summery.value = false;
  excel.value = false;
};
const handleviewSummery = async () => {
  genereate.value = false;
  graphical.value = false;
  summery.value = true;
  excel.value = false;
};

const handleviewGenereate = async () => {
  genereate.value = true;
  graphical.value = false;
  summery.value = false;
  excel.value = true;
};

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(saleReport.value.sales);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  // Export the file
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
      <div class="mr-3" v-if="excel">
        <button
          type="button"
          class="px-4 py-2 bg-green-700 text-white rounded-lg"
          @click="exportToExcel"
        >
          Excel Export
        </button>
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-[#49a5f0fb] text-white rounded-lg"
          @click="handleSummery"
        >
          Sales Summary
        </button>
      </div>
      <div class="mr-3">
        <button
          type="button"
          class="px-4 py-2 bg-amber-600 text-white rounded-lg"
          @click="handleGraphical"
        >
          Sales Graphical
        </button>
      </div>
    </div>

    <h6 class="title">Sales Report</h6>
    <div v-if="genereate">
      <div class="overflow-x-auto">
        <table class="purchase-table">
          <thead class="table-header">
            <tr>
              <th>Actions</th>
              <th>Sale Id</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Items Purchased</th>
              <th>Sold By</th>
              <th>Sold To</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Total</th>
              <th>Payment Type</th>
              <th>Comments</th>
              <th>Discount Reason</th>
              <th>Tier Name</th>
            </tr>
          </thead>
          <tbody
            class="table-body"
            v-for="(data, index) in saleReport?.sales"
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
                      name: 'sales-receipt',
                      params: { id: data?.id },
                    })
                  "
                >
                  <EyeOutlined class="align-middle" />
                </button>
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Sale ID:</span>
                {{ data?.id }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Date:</span>

                {{ moment(data?.sale_date).format("ll") }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Payment:</span>
                {{ data?.payment_method?.name || "-" }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Items Purchased:</span>

                {{ data?.sale_products?.length }}
              </td>
              <td class="capitalize">
                <span class="md:hidden mr-1 font-bold">Sold By:</span>

                {{ data?.sold_user?.name }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Sold To:</span>

                {{ data?.customer?.first_name || "-" }}
              </td>
              <td class="text-right">
                <span class="md:hidden mr-1 font-bold">Subtotal:</span>

                {{ data?.sub_total }}
              </td>
              <td class="text-right">
                <span class="md:hidden mr-1 font-bold">Total:</span>

                {{ data?.total }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Payment Type:</span>

                {{ data?.payment_method?.name || "-" }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Comments:</span>

                {{ data?.comment_on_receipt }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Discount Reason:</span>

                {{ data?.note || "-" }}
              </td>
              <td>
                <span class="md:hidden mr-1 font-bold">Tier Name:</span>

                {{ data?.item_tiers || "-" }}
              </td>
            </tr>
            <template v-if="showProducts == data?.id">
              <tr class="text-left whitespace-nowrap">
                <th>Product ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Supplier</th>
                <th>Manufacture</th>
                <th>Description</th>
                <th class="text-right">Selling Price</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">Total</th>
                <th colspan="2">Discount</th>
              </tr>
              <tr v-if="!data?.sale_products?.length">
                <td colspan="13">No Product</td>
              </tr>
              <tr v-for="product in data?.sale_products" :key="data?.id">
                <td>{{ product?.product_id }}</td>
                <td>{{ product?.product_name }}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td class="text-right">{{ product?.price }}</td>
                <td class="text-right">{{ product?.quantity }}</td>
                <td class="text-right">{{ product?.price }}</td>
                <td class="text-right">{{ product?.price }}</td>
                <td colspan="2">{{ product?.discount_percent || "-" }}</td>
              </tr></template
            >
          </tbody>
          <tbody v-if="!saleReport?.sales?.length">
            <tr>
              <td colspan="13">No Data...</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="7" class="font-semibold text-lg text-right">
                TOTAL
              </td>
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
    </div>

    <div v-if="summery">
      <div class="overflow-x-auto">
        <table class="purchase-table">
          <thead class="table-header">
            <tr>
              <th>Date</th>
              <th class="text-right">sub total</th>
              <th class="text-right">Total Sales</th>

              <th class="text-right">Per Time period</th>
            </tr>
          </thead>
          <tbody
            class="table-body"
            v-for="(data, index) in summaryReport"
            :key="index"
          >
            <tr>
              <td>{{ moment(data?.sale_date).format("ll") }}</td>
              <td class="text-right">
                {{ data?.sub_total ? Number(data?.sub_total)?.toFixed(2) : "" }}
              </td>
              <td class="text-right">
                {{
                  data?.total_sales ? Number(data?.total_sales)?.toFixed(2) : ""
                }}
              </td>

              <td class="text-right">
                {{
                  data?.sales_per_time_period
                    ? Number(data?.sales_per_time_period)?.toFixed(2)
                    : ""
                }}
              </td>
            </tr>
          </tbody>
          <tbody v-if="!summaryReport?.length">
            <tr>
              <td colspan="13">No Data...</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="font-semibold text-lg text-right">TOTAL</td>
              <td class="font-semibold text-lg text-right">
                {{ Number(totalSubtotal).toFixed(2) }}
              </td>
              <td class="font-semibold text-lg text-right">
                {{ Number(totalSum).toFixed(2) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div v-if="graphical">
      <div class="bg-white mt-3 p-3 rounded">
        <apexchart
          type="line"
          height="380"
          :options="chartOptions"
          :series="series"
        ></apexchart>
      </div>
    </div>
  </MainLayout>
</template>
