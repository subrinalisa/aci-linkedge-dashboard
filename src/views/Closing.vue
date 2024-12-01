<template>
  <MainLayout>
    <p class="text-red-600 font-medium mb-3">
      When you get out of the sales register, You must enter a closeout amount
    </p>
    <a-skeleton v-if="isLoading" />
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4" v-else>
      <!-- left -->
      <div>
        <table class="w-full text-left">
          <tr>
            <th>Denomination</th>
            <th class="text-right">Count/Pice</th>
          </tr>
          <tr v-for="(item, index) in denomination" :key="index">
            <td>{{ item?.name }} 's</td>
            <td class="relative">
              <input
                type="text"
                class="w-full p-3 rounded-md text-right outline-none border mt-3"
                v-model="item.model"
                @input="validateNumberInput(item, $event.target.value)"
              />
            </td>
          </tr>
        </table>
      </div>
      <!-- right -->
      <div>
        <table class="w-full text-left table mt-9">
          <tr>
            <td>Cash Open Amount</td>
            <td class="text-right">
              <input
                type="number"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none"
                v-model="cash_opening_amount"
                readonly
              />
            </td>
          </tr>
          <tr>
            <td>Cash Sales</td>
            <td class="text-right">
              <input
                type="number"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none"
                v-model="cash_sales"
                readonly
              />
            </td>
          </tr>
          <tr>
            <td>Cash Purchased</td>
            <td class="text-right">
              <input
                type="number"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none"
                v-model="cash_purchased"
                readonly
              />
            </td>
          </tr>
          <tr>
            <td>Cash Total Additions</td>
            <td class="text-right">
              <input
                type="number"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none"
                v-model="cash_total_additions"
                readonly
              />
            </td>
          </tr>
          <tr>
            <td>Cash Total Subtractions & Expenses</td>
            <td class="text-right">
              <input
                type="number"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none"
                v-model="cash_total_subtraction_and_expense"
                readonly
              />
            </td>
          </tr>
          <tr>
            <td class="text-lg font-bold text-green-600">
              You should have in this register
            </td>
            <td class="text-right">
              <input
                type="number"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none text-lg font-bold text-green-600"
                v-model="have_register_balance"
                readonly
              />
            </td>
          </tr>

          <tr>
            <td class="text-lg font-bold text-blue-600">Cash Closing Amount</td>
            <td class="text-right">
              <input
                type="text"
                class="w-full bg-transparent p-2 rounded-md text-right outline-none text-lg font-bold text-blue-600"
                readonly
                v-model="total"
              />
            </td>
          </tr>
          <tr>
            <td>Notes</td>
            <td class="text-right">
              <textarea
                type="text"
                class="w-full bg-transparent p-2 rounded-md outline-none"
                v-model="note"
              ></textarea>
            </td>
          </tr>
        </table>
        <button class="submit-btn" @click="cashSubmit($router)">Save</button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref, watchEffect, onMounted } from "vue";
import Cookies from "js-cookie";
import { useOpeningStore } from "@/stores/opening.js";
import { useDataStore } from "@/stores/data";
import { storeToRefs } from "pinia";
import { showNotification } from "@/utilities/notification";

const dataStore = useDataStore();
const openingStore = useOpeningStore();
const { isLoading } = storeToRefs(openingStore);
const { setOpeningBalance, todayCashBalance } = openingStore;

const denomination = ref([
  { name: "1000", model: "" },
  { name: "500", model: "" },
  { name: "200", model: "" },
  { name: "100", model: "" },
  { name: "50", model: "" },
  { name: "20", model: "" },
  { name: "10", model: "" },
  { name: "5", model: "" },
  { name: "2", model: "" },
  { name: "1", model: "" },
]);

const cash_opening_amount = ref("");
const cash_sales = ref("");
const cash_purchased = ref("");
const cash_total_additions = ref("");
const cash_total_subtraction_and_expense = ref("");
const have_register_balance = ref("");
const note = ref("");

const closing_balance = ref("");
const total = ref("");

watchEffect(async () => {
  const totals = denomination.value.reduce((sum, item) => {
    return sum + Number(item.name) * item.model;
  }, 0);
  if (totals > 0) {
    total.value = Math.round(totals).toFixed(2);
    const totalRegister = Math.round(
      Number(cash_opening_amount.value) +
        Number(cash_sales.value) -
        Number(cash_purchased.value) -
        Number(cash_total_additions.value) -
        Number(cash_total_subtraction_and_expense.value)
    ).toFixed(2);
    have_register_balance.value = totalRegister;
    closing_balance.value = totals;
  }
});

const handleLogout = (router) => {
  Cookies.set("token", "");
  Cookies.set("isOpening", 0);
  localStorage.clear();
  dataStore.$reset();
  router.push({ name: "login" });
};

const cashSubmit = async (router) => {
  const cashes = denomination.value.reduce((acc, curr) => {
    acc[`count_${curr.name}`] = curr.model;
    return acc;
  }, {});
  if (have_register_balance.value != closing_balance.value) {
    showNotification(
      "warning",
      "Closing amount should be equal to Register amount"
    );
    return 0;
  }
  const data = {
    ...cashes,
    cash_opening_amount: cash_opening_amount.value,
    cash_sales: cash_sales.value,
    cash_purchased: cash_purchased.value,
    cash_total_additions: cash_total_additions.value,
    cash_total_subtraction_and_expense:
      cash_total_subtraction_and_expense.value,
    have_register_balance: have_register_balance.value,
    cash_closing_amount: closing_balance.value,
    note: note.value,
    type: 0,
  };
  const result = await setOpeningBalance(data);
  if (result) handleLogout(router);
};

onMounted(async () => {
  const result = await todayCashBalance();
  cash_opening_amount.value = result?.cash_opening_amount;
  cash_sales.value = result?.cash_sales;
  cash_purchased.value = result?.cash_purchased;
  cash_total_additions.value = result?.cash_total_additions;
  cash_total_subtraction_and_expense.value =
    result?.cash_total_subtraction_and_expense;

  note.value = result?.note;

  const totalRegister = Math.round(
    Number(result?.cash_opening_amount) +
      Number(result?.cash_sales) -
      Number(result?.cash_purchased) -
      Number(result?.cash_total_additions) -
      Number(result?.cash_total_subtraction_and_expense)
  ).toFixed(2);
  have_register_balance.value = totalRegister;
  // closing_balance.value = totalRegister;
  // total.value = totalRegister;
});

const validateNumberInput = (item, value) => {
  const regex = /^[0-9]*$/;

  if (!regex.test(value)) {
    value = value.replace(/[^0-9]/g, "");
  }
  item.model = value;
};
</script>
