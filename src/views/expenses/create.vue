<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center">
        <div class="mb-3"><h6 class="title">Create New Expense</h6></div>
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
        <div class="lg:grid grid-cols-3 gap-3 items-start">
          <div>
            <label class="mb-1">Date</label>
            <input
              type="date"
              placeholder="Enter here . . ."
              v-model="form.date"
              class="input-text"
              :class="{ 'border-red-500': formErrors.date }"
              readonly
            />
          </div>
          <div>
            <label class="mb-1">Amount</label>
            <input
              type="text"
              placeholder="Enter here . . ."
              @input="validateNumberInput()"
              v-model="form.amount"
              class="input-text"
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
          </div>

          <div>
            <label class="mb-1">Payment Type</label>
            <select v-model="form.payment_method_id" class="input-text" required>
              <option v-for="(item, index) in paymentMethodData" :key="index" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1">Tax</label>
            <input
              type="text"
              placeholder="Enter here . . ."
              v-model="form.tax"
              class="input-text"
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
              @input="
                () => {
                  if (form.amount < form.tax) {
                    form.tax = form.amount;
                  }
                }
              "
            />
          </div>

          <div>
            <label class="mb-1">Description</label>
            <input
              type="text"
              placeholder="Enter here . . ."
              v-model="form.description"
              class="input-text"
            />
          </div>

          <div>
            <label class="mb-1">Type</label>
            <input
              type="text"
              placeholder="Enter here . . ."
              v-model="form.type"
              class="input-text"
            />
          </div>

          <div>
            <label class="mb-1">Reason</label>
            <textarea
              type="text"
              placeholder="Enter here . . ."
              v-model="form.reason"
              class="input-text"
              rows="1"
            ></textarea>
          </div>
          <div>
            <label class="mb-1">Category</label>
            <select v-model="form.category" class="input-text" required>
              <option v-for="(item, index) in expenseCategoryList" :key="index" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1">Recipient Name</label>
            <select v-model="form.recipient_id" class="input-text" required>
              <option v-for="(item, index) in userListData" :key="index" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1">Approved By</label>
            <select v-model="form.approved_by" class="input-text" required>
              <option v-for="(item, index) in userListData" :key="index" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1">Remove Cash From Register</label>
            <select v-model="form.remove_cash_from_register" class="input-text" required>
              <option v-for="(item, index) in paymentMethodData" :key="index" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1">Attachment</label>
            <input
              class="input-text"
              placeholder="Enter here . . ."
              type="file"
              @change="onFileChange($event)"
            />
          </div>
          <div>
            <label class="mb-1">Expense Note</label>
            <textarea
              type="text"
              class="input-text"
              placeholder="Enter here . . ."
              rows="1"
              v-model="form.expenses_note"
            ></textarea>
          </div>
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
import { useRouter } from "vue-router";
import moment from "moment";

const paymentMethodData = ref([]);
const userListData = ref([]);
const expenseCategoryList = ref([]);
const loading = ref(false);

onMounted(() => {
  getAllPaymentMethod();
  getAllUsers();
  getAllExpenseCategory();
  const formattedDate = moment().format("YYYY-MM-DD");
  form.value.date = formattedDate;
});
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
  file: null,
});
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
      const response = await expense.insertExpense(form.value);
      console.log(response.status);
      if (response?.status === 201) {
        showNotification("success", response?.data?.message || "Successfully inserted");
        router.push({ name: "expenses" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  } else {
    console.log("Form contains errors:", formErrors.value);
  }
};
const onFileChange = (event) => {
  form.value.file = event.target.files[0];
};
</script>
