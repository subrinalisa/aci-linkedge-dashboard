<template>
  <section class="py-3">
    <Header />
    <div
      class="ml-20 mr-3 border-4 border-double border-blue-600 my-3 p-5 rounded-md"
    >
      <a-skeleton v-if="isLoading" />
      <div v-else>
        <p class="text-red-600 font-medium mb-3">
          Please enter an opening amount to get in the sales register
        </p>
        <div class="grid grid-cols-2 gap-4">
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
                    type="number"
                    class="w-full p-3 rounded-md text-right outline-none border mt-3"
                    v-model="item.model"
                  />
                </td>
              </tr>
            </table>
          </div>
          <!-- right -->
          <div>
            <table class="w-full text-left table mt-9">
              <tr>
                <td>Previous Closing Amount</td>
                <td class="text-right">
                  <input
                    type="number"
                    class="w-full bg-transparent p-2 rounded-md text-right outline-none"
                    v-model="previous_balance"
                    readonly
                  />
                </td>
              </tr>

              <tr>
                <td class="text-lg font-bold text-blue-600">
                  Cash Opening Amount
                </td>
                <td class="text-right">
                  <input
                    type="text"
                    class="w-full bg-transparent p-2 rounded-md text-right outline-none text-lg font-bold text-blue-600"
                    readonly
                    v-model="total"
                  />
                </td>
              </tr>
            </table>

            <button class="submit-btn" @click="cashSubmit($router)">
              Save & Move Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Header from "../components/Header.vue";
import { ref, watchEffect, onMounted } from "vue";
import Cookies from "js-cookie";
import { useOpeningStore } from "@/stores/opening.js";
import { storeToRefs } from "pinia";

const openingStore = useOpeningStore();

const { setOpeningBalance, previousCashBalance } = openingStore;
const { isLoading } = storeToRefs(openingStore);

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

const opening_balance = ref("");
const previous_balance = ref("");
const total = ref("");

watchEffect(async () => {
  const totals = denomination.value.reduce((sum, item) => {
    return sum + Number(item.name) * item.model;
  }, 0);
  total.value = new Intl.NumberFormat("en-IN").format(totals);
  opening_balance.value = totals;
});
const cashSubmit = async (router) => {
  const cashes = denomination.value.reduce((acc, curr) => {
    acc[`count_${curr.name}`] = curr.model;
    return acc;
  }, {});
  const data = {
    ...cashes,
    cash_opening_amount: opening_balance.value,
    cash_sales: "",
    cash_purchased: "",
    cash_total_additions: "",
    cash_total_subtraction_and_expense: "",
    have_register_balance: "",
    cash_closing_amount: "",
    note: "",
    type: 1,
  };
  const result = await setOpeningBalance(data);
  if (result) {
    Cookies.set("isOpening", 0);
    router.push({ name: "home" });
  }
};

onMounted(async () => {
  const result = await previousCashBalance();
  if (result) {
    denomination.value.forEach((item) => {
      const key = `count_${item.name}`;
      if (result[key] !== undefined) {
        item.model = result[key];
      }
    });
    previous_balance.value = result?.cash_closing_amount;
    total.value = result?.cash_closing_amount;
  }
});
</script>
