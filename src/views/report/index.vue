<template>
  <MainLayout>
    <div class="flex gap-3">
      <!-- Left Menu -->
      <div class="">
        <ul class="whitespace-nowrap">
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Favourites',
              }"
              @click="setActiveMenu('Favourites')"
            >
              Favourites
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Categories',
              }"
              @click="setActiveMenu('Categories')"
            >
              Categories
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{ 'bg-indigo-600 text-white': activeMenu === 'Closeout' }"
              @click="setActiveMenu('Closeout')"
            >
              Closeout
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Custom Reports',
              }"
              @click="setActiveMenu('Custom Reports')"
            >
              Custom Reports
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Commission',
              }"
              @click="setActiveMenu('Commission')"
            >
              Commission
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Customers',
              }"
              @click="setActiveMenu('Customers')"
            >
              Customers
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Deleted Sales',
              }"
              @click="setActiveMenu('Deleted Sales')"
            >
              Deleted Sales
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Deliveries',
              }"
              @click="setActiveMenu('Deliveries')"
            >
              Deliveries
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Discounts',
              }"
              @click="setActiveMenu('Discounts')"
            >
              Discounts
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Employees',
              }"
              @click="setActiveMenu('Employees')"
            >
              Employees
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Expenses',
              }"
              @click="setActiveMenu('Expenses')"
            >
              Expenses
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Inventory Reports',
              }"
              @click="setActiveMenu('Inventory Reports')"
            >
              Inventory Reports
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Items',
              }"
              @click="setActiveMenu('Items')"
            >
              Items
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Payments',
              }"
              @click="setActiveMenu('Payments')"
            >
              Payments
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Price Rules',
              }"
              @click="setActiveMenu('Price Rules')"
            >
              Price Rules
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Receiving',
              }"
              @click="setActiveMenu('Receiving')"
            >
              Receiving
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Register Logs',
              }"
              @click="setActiveMenu('Register Logs')"
            >
              Register Logs
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Registers',
              }"
              @click="setActiveMenu('Registers')"
            >
              Registers
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Sales',
              }"
              @click="setActiveMenu('Sales')"
            >
              Sales
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Store Accounts',
              }"
              @click="setActiveMenu('Store Accounts')"
            >
              Store Accounts
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Suppliers',
              }"
              @click="setActiveMenu('Suppliers')"
            >
              Suppliers
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Suspended Sales',
              }"
              @click="setActiveMenu('Suspended Sales')"
            >
              Suspended Sales
            </button>
          </li>
          <li>
            <button
              class="w-full text-left border border-indigo-400 rounded px-3 py-1 mb-2"
              :class="{
                'bg-indigo-600 text-white': activeMenu === 'Tiers',
              }"
              @click="setActiveMenu('Tiers')"
            >
              Tiers
            </button>
          </li>
        </ul>
      </div>

      <!-- Right Menu -->
      <div class="grow" ref="resultContainer">
        <div class="bg-white rounded p-3">
          <p class="text-lg font-semibold text-indigo-600" v-if="!activeMenu">Make a selection</p>
          <h2 class="text-lg font-semibold text-indigo-600" v-if="activeMenu">
            {{ activeMenu }}
          </h2>
          <hr class="my-2 bg-indigo-600 h-[2px]" />
          <!-- Static rendering for each menu option -->
          <ul v-if="activeMenu === 'Favourites'">
            You do not have any favorited reports.
          </ul>
          <ul v-else-if="activeMenu === 'Categories'">
            <li class="pb-1 border-b"><router-link to="/">Graphical Reports</router-link></li>
            <li class=""><router-link to="/">Summary Reports</router-link></li>
          </ul>
          <ul v-else-if="activeMenu === 'Closeout'">
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Closing Summary Report</li>
            <li class="pb-1 border-b">Condensed Summary Report</li>
          </ul>
          <ul v-else-if="activeMenu === 'Custom Reports'">
            <li class="pb-1 border-b">Detailed Search Report</li>
          </ul>
          <ul v-else-if="activeMenu === 'Commission'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Customers'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Detailed Reports</li>
            <li class="pb-1 border-b">Customer Series Report</li>
            <li class="pb-1 border-b">New Customers</li>
            <li class="pb-1 border-b">Zip Code Report</li>
            <li class="pb-1 border-b">Graphical Zip Code Report</li>
          </ul>
          <ul v-else-if="activeMenu === 'Deleted Sales'">
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Deliveries'">
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Discounts'">
            <li class="pb-1 border-b">Summary Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Employees'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Expenses'">
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Inventory Reports'">
            <li class="pb-1 border-b">Low Inventory</li>
            <li class="pb-1 border-b">Inventory Summary</li>
            <li class="pb-1 border-b">Inventory Summary at Past Date</li>
            <li class="pb-1 border-b">Detailed Reports</li>
            <li class="pb-1 border-b">Summary Count Report</li>
            <li class="pb-1 border-b">Detailed Count Report</li>
            <li class="pb-1 border-b">Expiring Items Report</li>
            <li class="pb-1 border-b">Damaged Items Report</li>
          </ul>
          <ul v-else-if="activeMenu === 'Items'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Top Selling Items</li>
            <li class="pb-1 border-b">Worse Selling Items</li>
            <li class="pb-1 border-b">Items Not Sold</li>
            <li class="pb-1 border-b">Price Variance Report</li>
            <li class="pb-1 border-b">Pricing History</li>
            <li class="pb-1 border-b">Serial Numbers Sold</li>
          </ul>
          <ul v-else-if="activeMenu === 'Payments'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Summary Payments Registers</li>
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Price Rules'">
            <li class="pb-1 border-b">Summary Reports</li>
          </ul>
          <!-- Static rendering for "Receiving" with 3 ul sections -->
          <div v-else-if="activeMenu === 'Receiving'">
            <!-- Section 1 -->
            <ul class="mb-4">
              <li class="pb-1 border-b">Summary Categories</li>
              <li class="pb-1 border-b">Detailed Reports</li>
              <li class="pb-1 border-b">Suspended Receivings</li>
              <li class="pb-1 border-b">Deleted Receivings Report</li>
              <li class="pb-1 border-b">Summary taxes report</li>
              <li class="pb-1 border-b">Graphical summary taxes report</li>
            </ul>
            <!-- Section 2 -->

            <h2 class="text-lg font-bold mb-4">Items</h2>
            <ul class="mb-4">
              <li class="pb-1 border-b">Deleted Receivings Report</li>
              <li class="pb-1 border-b">Summary Taxes Report</li>
            </ul>
            <!-- Section 3 -->
            <h2 class="text-lg font-bold mb-4">Payments</h2>
            <ul class="mb-4">
              <li class="pb-1 border-b">Graphical Summary Taxes Report</li>
            </ul>
          </div>
          <ul v-else-if="activeMenu === 'Register Logs'">
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Registers'">
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Graphical Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Sales'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Detailed Reports</li>
            <li class="pb-1 border-b">Listing Sales</li>
            <li class="pb-1 border-b">Day of Week Report</li>
            <li class="pb-1 border-b">Summary Sales by Time Reports</li>
            <li class="pb-1 border-b">Graphical Summary Sales by Time Reports</li>
            <li class="pb-1 border-b">E-Commerce</li>
            <li class="pb-1 border-b">Last 4 of Credit Card</li>
          </ul>
          <div v-else-if="activeMenu === 'Store Accounts'">
            <!-- Section 1 -->
            <ul class="mb-4">
              <li class="pb-1 border-b">Store Account Statements</li>
              <li class="pb-1 border-b">Summary Reports</li>
              <li class="pb-1 border-b">Detailed Reports</li>
              <li class="pb-1 border-b">Activity Reports</li>
              <li class="pb-1 border-b">Activity Summary Report</li>
              <li class="pb-1 border-b">Outstanding Sales</li>
            </ul>
            <!-- Section 2 -->

            <h2 class="text-lg font-bold mb-4">Suppliers</h2>
            <ul class="mb-4">
              <li class="pb-1 border-b">Store Account Statements</li>
              <li class="pb-1 border-b">Summary Reports</li>
              <li class="pb-1 border-b">Detailed Reports</li>
              <li class="pb-1 border-b">Activity Reports</li>
              <li class="pb-1 border-b">Activity Summary Report</li>
              <li class="pb-1 border-b">Outstanding Receivings</li>
            </ul>
          </div>
          <ul v-else-if="activeMenu === 'Suppliers'">
            <li class="pb-1 border-b">Graphical Reports</li>
            <li class="pb-1 border-b">Summary Reports</li>
            <li class="pb-1 border-b">Detailed Reports</li>
            <li class="pb-1 border-b">Summary Items</li>
            <li class="pb-1 border-b">Graphical Receivings Reports</li>
            <li class="pb-1 border-b">Summary Receivings Reports</li>
            <li class="pb-1 border-b">Detailed Receivings Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Suspended Sales'">
            <li class="pb-1 border-b">Detailed Reports</li>
          </ul>
          <ul v-else-if="activeMenu === 'Tiers'">
            <li class="pb-1 border-b">Summary Reports</li>
          </ul>

          <!-- Fallback message if no submenu items are defined -->
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<!-- <script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref } from "vue";

// Reactive variable for the active menu
const activeMenu = ref(null);

// Function to update the active menu
const setActiveMenu = (menuKey) => {
  activeMenu.value = menuKey;
};
</script> -->

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref } from "vue";

const activeMenu = ref(null);

const resultContainer = ref(null);

const setActiveMenu = (menuKey) => {
  activeMenu.value = menuKey;

  if (resultContainer.value) {
    resultContainer.value.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
</script>
