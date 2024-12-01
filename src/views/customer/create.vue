<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center">
        <div>
          <h6 class="title">Create New Customer</h6>
        </div>
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

      <form @submit.prevent="submitForm()">
        <div class="lg:grid grid-cols-3 gap-4 items-center">
          <label>First Name</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.first_name"
            :class="{ 'border-red-500': formErrors.first_name }"
            class="input-text col-span-2"
            @input="validateFirstName"
            required
          />
          <label>Last Name</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.last_name"
            :class="{ 'border-red-500': formErrors.last_name }"
            class="input-text col-span-2"
            @input="validateLastName"
          />
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter here . . ."
            v-model="form.email"
            :class="{ 'border-red-500': formErrors.email }"
            class="input-text col-span-2"
          />
          <label>Contact</label>
          <input
            type="tel"
            placeholder="Enter here . . ."
            v-model="form.contact"
            :class="{ 'border-red-500': formErrors.contact }"
            class="input-text col-span-2"
            pattern="^(?:\+?88)?01[3-9]\d{8}$"
            @input="validateContact"
          />
          <label>Select Images</label>
          <div class="col-span-2">
            <input
              placeholder="Enter here . . ."
              type="file"
              id="image_path"
              @change="handleImageUpload($event)"
              class="input-text col-span-2"
              accept="image/*"
            />

            <span v-if="form.image_path" class="rounded-lg">
              <img
                v-if="imageLocal"
                :src="`${localImagePath}`"
                class="mt-4 rounded-lg shadow-md w-20 h-20"
              />
            </span>
          </div>
          <label>Address 1</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.address_1"
            class="input-text col-span-2"
          />
          <label>Address 2</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.address_2"
            class="input-text col-span-2"
          />
          <label>City</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.city"
            class="input-text col-span-2"
            @input="validateCity"
          />

          <label>Zip</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.zip"
            class="input-text col-span-2"
            @input="validateZip"
          />
          <label>Country</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.country"
            class="input-text col-span-2"
            @input="validateCountry"
          />
          <label>Comments</label>
          <textarea
            class="input-text col-span-2"
            placeholder="Enter here . . ."
            v-model="form.comments"
          ></textarea>
          <label>Notes</label>
          <textarea
            class="input-text col-span-2"
            placeholder="Enter here . . ."
            v-model="form.notes"
          ></textarea>
          <label>Credit Limit</label>
          <input
            type="number"
            class="input-text col-span-2 text-right"
            v-model="form.credit_limit"
            @keydown="
              (event) => {
                if (
                  event.key == '.' ||
                  event.key == '+' ||
                  event.key == '-' ||
                  event.key == 'E' ||
                  event.key == 'e'
                ) {
                  event.preventDefault();
                }
              }
            "
          />
          <label>Store Account Balance</label>
          <div class="col-span-2">
            <input
              type="number"
              class="input-text text-right"
              v-model="form.store_account_balance"
              @keydown="
                (event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
              "
              @input="
                (event) => {
                  if (form.store_account_balance > form.credit_limit) {
                    form.store_account_balance = form.credit_limit;
                  }
                }
              "
            />
          </div>

          <label>Company Name</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.company_name"
            class="input-text col-span-2"
            @input="validateCompanyName"
          />
          <label>Account #</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.account_no"
            class="input-text col-span-2"
            @keydown="
              (event) => {
                if (
                  event.key == '.' ||
                  event.key == '+' ||
                  event.key == '-' ||
                  event.key == 'E' ||
                  event.key == 'e'
                ) {
                  event.preventDefault();
                }
              }
            "
            @input="validateAccountNo"
          />

          <label class="col-span-3" for="override">
            <input type="checkbox" id="override" /><span class="pl-2"
              >Override Default Tax For Sale</span
            >
          </label>
          <label class="col-span-3" for="Taxable">
            <input type="checkbox" id="Taxable" v-model="form.taxable" /><span
              class="pl-2"
              >Taxable</span
            >
          </label>
          <label>Tier Type</label>
          <input
            type="text"
            placeholder="Enter here . . ."
            v-model="form.tier_type"
            class="input-text col-span-2"
          />
          <label class="col-span-3" for="MRR">
            <input type="checkbox" id="MRR" v-model="form.mrr" /><span
              class="pl-2"
              >MRR</span
            >
          </label>
          <label>MRR Supplier Name</label>
          <vselect
            v-model="form.mrr_id"
            id="mrr_id"
            @search="getMrr"
            :options="mrrList"
            label="name"
            :reduce="(mrr) => mrr.id"
            class="col-span-2"
            placeholder="Select mrr..."
            required
          ></vselect>
          <button
            type="button"
            @click="addFileInput()"
            class="px-4 py-2 bg-[#000180] text-white hover:bg-[#000180]-600"
          >
            Add Files
          </button>
          <div class="col-span-2">
            <label>Select Files:</label>
            <div
              v-for="(file, index) in form.files"
              :key="index"
              class="mb-2 flex items-center col-span-2"
            >
              <input
                type="file"
                @change="handleFileUpload($event, index)"
                class="input-text"
                multiple
              />
              <button
                type="button"
                @click="removeFileInput(index)"
                class="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <i class="bi bi-trash text-white text-lg"></i>
              </button>
            </div>
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
import { apiBase } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import MainLayout from "@/components/MainLayout.vue";
import customer from "@/stores/customer_api.js";
import { showNotification } from "@/utilities/notification";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import vselect from "vue-select";
const loading = ref(false);
const localImagePath = ref(null);
const imageLocal = ref(false);
const mrrList = ref([]);
const taxes = [
  { name: "salse Tax", percent: "10.22" },
  { name: "salse Tax 2", percent: "12.22" },
];

const form = ref({
  first_name: "",
  last_name: "",
  address_1: "",
  contact: "",
  email: "",
  image_path: null,
  address_2: "",
  city: "",
  state_or_province: "",
  zip: "",
  country: "",
  comments: "",
  internal_notes: "",
  store_account_balance: "",
  credit_limit: "",
  company_name: "",
  account_no: "",
  override_default_tax_for_sale: 1,
  tax_group: "",
  cumulative: "",
  taxable: "1",
  non_tax_certificate_number: "",
  tier_type: "",
  mrr: "",
  mrr_id: "",
  files: [],
  taxes: JSON.stringify(taxes),
});

const fetchMRRList = async (id) => {
  try {
    const response = await customer.searchMRRList();

    mrrList.value = response.data;
    console.log(mrrList.value);
  } catch (error) {
    console.error(error);
  } finally {
  }
};

onMounted(() => fetchMRRList());

// Define reactive form error state
const formErrors = ref({});

// Basic validation function
function validateForm() {
  const errors = {};

  // if (!form.value.company_name)
  //   errors.company_name = "Company Name is required";
  // if (!form.value.first_name) errors.first_name = "First Name is required";
  // if (!form.value.email || !/\S+@\S+\.\S+/.test(form.value.email))
  //   errors.email = "A valid Email is required";
  // Add more validations as needed

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

const handleImageUpload = (event) => {
  const img = event.target.files[0];
  form.value.image_path = img;

  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageLocal.value = true;
      localImagePath.value = e.target.result;
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  }
};
const handleFileUpload = (event, index) => {
  const file = event.target.files[0];
  form.value.files[index] = file;
  console.log(form.value.files); // Log the first file
};
const addFileInput = () => {
  form.value.files.push(null);
};
const removeFileInput = (index) => {
  form.value.files.splice(index, 1);
};

const router = useRouter();
const submitForm = async () => {
  if (validateForm()) {
    loading.value = true;
    try {
      form.value.taxable = form.value.taxable ? 1 : 0;
      form.value.mrr = form.value.mrr ? 1 : 0;
      const response = await customer.insertCustomer(form.value);
      console.log(response.status);
      if (response?.status === 201) {
        console.log(response.data?.message);
        showNotification(
          "success",
          response?.data?.message || "Successfully inserted"
        );
        router.push({ name: "customer" });
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

const getMrr = async (searchTerm, loading) => {
  loading(true);
  if (searchTerm.length >= 2) {
    const token = Cookies.get("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axios.get(
        `${apiBase}/mrr/search?term=${searchTerm}`,
        config
      );
      if (res.status === 200) {
        mrrList.value = res.data;
      }
    } catch (error) {
      console.error("Error fetching mrr data:", error);
    } finally {
      loading(false);
    }
  } else {
    loading(false);
  }
};
const validateCompanyName = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.company_name)) {
    form.value.company_name = form.value.company_name.replace(
      /[^A-Za-z\s]/g,
      ""
    );
  }
};
const validateFirstName = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.first_name)) {
    form.value.first_name = form.value.first_name.replace(/[^A-Za-z\s]/g, "");
  }
};
const validateLastName = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.last_name)) {
    form.value.last_name = form.value.last_name.replace(/[^A-Za-z\s]/g, "");
  }
};
const validateEmail = () => {
  const regex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  if (!regex.test(form.value.email)) {
  }
};
const validateContact = () => {
  const regex = /^\+?[0-9]*$/;
  if (!regex.test(form.value.contact)) {
    form.value.contact = form.value.contact
      .replace(/[^0-9]/g, "")
      .replace(/^/, form.value.contact.startsWith("+") ? "+" : "");
  }
};
const validateCity = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.city)) {
    form.value.city = form.value.city.replace(/[^A-Za-z\s]/g, "");
  }
};

const validateCountry = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.country)) {
    form.value.country = form.value.country.replace(/[^A-Za-z\s]/g, "");
  }
};
const validateZip = () => {
  const regex = /^[0-9]*$/;
  if (!regex.test(form.value.zip)) {
    form.value.zip = form.value.zip.replace(/[^0-9]/g, "");
  }
};
const validateAccountNo = () => {
  const regex = /^[0-9]*$/;
  if (!regex.test(form.value.account_no)) {
    form.value.account_no = form.value.account_no.replace(/[^0-9]/g, "");
  }
};
</script>
