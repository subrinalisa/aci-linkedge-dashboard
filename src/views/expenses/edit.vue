<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center">
        <div class="mb-3"><h6 class="font-medium">Update Expense</h6></div>
        <div class="mb-3">
          <button
            type="button"
            class="px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
            @click="$router.go(-1)"
          >
            Back
          </button>
        </div>
      </div>
      <hr />

      <form @submit.prevent="submitForm()">
        <div class="lg:grid grid-cols-3 gap-4 items-center">
          <label>Date</label>
          <input
            type="date"
            placeholder="Enter here . . ."
            v-model="form.date"
            class="input-text col-span-2"
            :class="{ 'border-red-500': formErrors.date }"
            readonly
          />
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            placeholder="Enter here . . ."
            @input="validateNumberInput()"
            v-model="form.amount"
            class="input-text col-span-2"
            @keydown="
              (event) => {
                if (
                  event.key == '.' ||
                  event.key == '+' ||
                  event.key == '-' ||
                  event.key == 'e'
                ) {
                  event.preventDefault();
                }
              }
            "
          />

          <label>Payment Type</label>
          <select
            v-model="form.payment_method_id"
            class="input-text col-span-2"
            required
          >
            <option
              v-for="(item, index) in paymentMethodData"
              :key="index"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
          <label>Tax</label>
          <input
            type="number"
            placeholder="Enter here . . ."
            @input="
              () => {
                if (form.amount < form.tax) {
                  form.tax = form.amount;
                }
              }
            "
            v-model="form.tax"
            class="input-text col-span-2"
            @keydown="
              (event) => {
                if (
                  event.key == '.' ||
                  event.key == '+' ||
                  event.key == '-' ||
                  event.key == 'e'
                ) {
                  event.preventDefault();
                }
              }
            "
          />

          <label>Description</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.description"
            class="input-text col-span-2"
          />

          <label>Type</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.type"
            class="input-text col-span-2"
          />

          <label>Reason</label>
          <textarea
            type="text"
            placeholder="Enter here . . ."
            v-model="form.reason"
            class="input-text col-span-2"
          ></textarea>
          <label class="">Category</label>
          <select
            v-model="form.category"
            class="input-text col-span-2"
            required
          >
            <option
              v-for="(item, index) in expenseCategoryList"
              :key="index"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
          <label class="">Recipient Name</label>
          <select
            v-model="form.recipient_id"
            class="input-text col-span-2"
            required
          >
            <option
              v-for="(item, index) in userListData"
              :key="index"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
          <label class="">Approved By</label>
          <select
            v-model="form.approved_by"
            class="input-text col-span-2"
            required
          >
            <option
              v-for="(item, index) in userListData"
              :key="index"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
          <label>Expense Note</label>
          <textarea
            class="input-text col-span-2"
            placeholder="Enter here . . ."
            v-model="form.expenses_note"
          ></textarea>
          <label class="">Remove Cash From Register</label>
          <select
            v-model="form.remove_cash_from_register"
            class="input-text col-span-2"
            required
          >
            <option
              v-for="(item, index) in paymentMethodData"
              :key="index"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
        <button
          type="submit"
          class="px-4 py-2 min-w-32 inline-block bg-[#000180] text-white rounded-lg mt-3"
        >
          Submit
        </button>
      </form>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import expense from "@/stores/expense_api.js";
import { showNotification } from "@/utilities/notification";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";

const paymentMethodData = ref([]);
const userListData = ref([]);
const expenseCategoryList = ref([]);
const loading = ref(false);
const route = useRoute();

const form = ref({
  date: null,
  amount: "",
  payment_method_id: null,
  tax: "",
  description: null,
  type: null,
  reason: null,
  category: null,
  recipient_id: null,
  approved_by: null,
  expenses_note: null,
  remove_cash_from_register: null,
});

onMounted(() => {
  fetchExpense();
  getAllPaymentMethod();
  getAllUsers();
  getAllExpenseCategory();
  const formattedDate = moment().format("YYYY-MM-DD");
  form.value.date = formattedDate;
});

const fetchExpense = async () => {
  try {
    const response = await expense.fetchExpense(route.params.id);

    const data = response.data;
    console.log(data);
    form.value.date = data?.date;
    form.value.amount = data?.amount;
    form.value.payment_method_id = data?.payment_method_id;
    form.value.tax = data?.tax;
    form.value.description = data?.description;
    form.value.type = data?.type;
    form.value.reason = data?.reason;
    form.value.category = data?.category;
    form.value.recipient_id = data?.recipient_id;
    form.value.approved_by = data?.approved_by;
    form.value.expenses_note = data?.expenses_note;
    form.value.remove_cash_from_register = data?.remove_cash_from_register;
  } catch (error) {
    console.error(error);
  } finally {
  }
};

const getAllPaymentMethod = async () => {
  const response = await expense.fetchPaymentMethodList();
  paymentMethodData.value = response.data;
  console.log(response.data);
};
const getAllUsers = async () => {
  const response = await expense.fetchUserList();
  userListData.value = response.data.users;
  console.log(response.data);
};
const getAllExpenseCategory = async () => {
  const response = await expense.fetchExpenseCategoryList();
  expenseCategoryList.value = response.data.expense_category;
  console.log(response.data);
};

// Define reactive form error state
const formErrors = ref({});

const validateNumberInput = () => {
  form.value.amount = form.value.amount.replace(/\D/g, "");
  form.value.tax = form.value.tax.replace(/\D/g, ""); // Remove non-numeric characters
};
// Basic validation function
function validateForm() {
  const errors = {};

  if (!form.value.date) errors.date = "Date is required";
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

const router = useRouter();

const submitForm = async () => {
  if (validateForm()) {
    loading.value = true;
    console.log(form.value);
    try {
      const response = await expense.updateExpense(route.params.id, form.value);
      console.log(response.status);
      if (response?.status === 201) {
        showNotification(
          "success",
          response?.data?.message || "Successfully inserted"
        );
        router.push({ name: "expenses" });
      }
    } catch (error) {
      console.error(error);
      showNotification("error", error?.message);
    } finally {
      loading.value = false;
    }
  } else {
    console.log("Form contains errors:", formErrors.value);
  }
};
</script>
