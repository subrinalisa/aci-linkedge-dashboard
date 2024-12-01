<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center">
        <div>
          <h6 class="title">Update Supplier</h6>
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
      <hr />
      <form @submit.prevent="submitForm()">
        <div class="lg:grid grid-cols-3 gap-4 items-center mt-4">
          <!-- Company Name -->
          <label for="company_name"
            >Company Name <span class="text-red-500">*</span></label
          >
          <input
            placeholder="Enter here . . ."
            type="text"
            id="company_name"
            v-model="form.company_name"
            :class="{ 'border-red-500': formErrors.company_name }"
            class="input-text col-span-2"
            @input="validateCompanyName"
            required
          />
          <!-- First Name -->
          <label for="first_name">First Name:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="firstName"
            v-model="form.first_name"
            :class="{ 'border-red-500': formErrors.first_name }"
            class="input-text col-span-2"
            @input="validateFirstName"
          />
          <!-- Last Name -->
          <label for="lastName">Last Name:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="lastName"
            v-model="form.last_name"
            class="input-text col-span-2"
            @input="validateLastName"
          />
          <!-- Email -->
          <label for="email">Email:</label>
          <input
            placeholder="Enter here . . ."
            type="email"
            id="email"
            v-model="form.email"
            class="input-text col-span-2"
            @input="validateEmail"
          />
          <!-- Contact -->
          <label for="contact">Contact:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="contact"
            v-model="form.contact"
            :class="{ 'border-red-500': formErrors.contact }"
            class="input-text col-span-2"
            @input="validateContact"
          />
          <!-- Select Image -->

          <label for="image_path">Select Image:</label>

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
              <img
                v-else
                :src="`${imgBase}${form.image_path}`"
                class="mt-4 rounded-lg shadow-md w-20 h-20"
              />
            </span>
          </div>

          <!-- Contact -->
          <label for="address_1">Address 1:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="address_1"
            v-model="form.address_1"
            class="input-text col-span-2"
          />
          <!-- Contact -->
          <label for="address_2">Address 2:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="address_2"
            v-model="form.address_2"
            class="input-text col-span-2"
          />
          <!-- Contact -->
          <label for="city">City:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="city"
            v-model="form.city"
            class="input-text col-span-2"
            @input="validateCity"
          />
          <!-- Contact -->
          <label for="state">State/Province:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="state_or_province"
            v-model="form.state_or_province"
            class="input-text col-span-2"
            @input="validateStateOrProvince"
          />
          <!-- Contact -->
          <label for="zip">Zip:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="zip"
            v-model="form.zip"
            class="input-text col-span-2"
            @input="validateZip"
          />
          <!-- Contact -->
          <label for="country">Country:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="country"
            v-model="form.country"
            class="input-text col-span-2"
            @input="validateCountry"
          />
          <!-- Contact -->
          <label for="comments">Comments:</label>
          <textarea
            placeholder="Enter here . . ."
            type="text"
            id="comments"
            v-model="form.comments"
            class="input-text col-span-2"
          />
          <label for="account_no">Account#:</label>
          <input
            placeholder="Enter here . . ."
            type="text"
            id="account_no"
            v-model="form.account_no"
            class="input-text col-span-2"
            @input="validateAccountNo"
          />
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
              class="mb-2 flex items-center col-span-1"
            >
              <input
                type="file"
                @change="handleFileUpload($event, index)"
                class="input-text"
                multiple
                accept="image/*"
              />
              <div v-if="file" class="p-4 bg-white rounded-lg shadow-md">
                <a
                  :href="`${imgBase}${file.path}`"
                  target="_blank"
                  class="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <i class="bi bi-file-earmark text-2xl mr-2"></i>
                  <span class="font-medium">{{ file.original_name }}</span>
                </a>
                <!-- <img :src="`${imgBase}${file.path}`" :alt="file.original_name" class="mt-4 rounded-lg shadow-md max-w-full h-auto" /> -->
              </div>
              <button
                type="button"
                @click="removeFileInput(index)"
                class="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <i class="bi bi-trash text-white text-lg"></i>
              </button>
            </div>
          </div>
          <!-- Submit Button -->
        </div>
        <div>
          <button
            type="submit"
            class="px-4 py-2 min-w-32 inline-block bg-[#000180] text-white rounded-lg mt-3"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
<script setup>
import MainLayout from "@/components/MainLayout.vue";
import supplier from "@/stores/supplier_api.js";
import { showNotification } from "@/utilities/notification";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { imgBase } from "@/config";
const route = useRoute();
const loading = ref(false);
const imageLocal = ref(false);
const form = ref({
  company_name: "",
  first_name: "",
  last_name: "",
  email: "",
  contact: "",
  image_path: null,
  address_1: "",
  address_2: "",
  city: "",
  state_or_province: "",
  zip: "",
  country: "",
  comments: "",
  account_no: "",
  store_account_balance: 0,
  files: [],
});

// Define reactive form error state
const formErrors = ref({});
const localImagePath = ref(null);
// Basic validation function
function validateForm() {
  const errors = {};
  if (!form.value.company_name)
    errors.company_name = "Company Name is required";
  // if (!form.value.first_name) errors.first_name = "First Name is required";
  // if (!form.value.email || !/\S+@\S+\.\S+/.test(form.value.email))
  // errors.email = "A valid Email is required";
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

const fetchData = async (id) => {
  try {
    const response = await supplier.fetchSupplier(id);
    console.log(response.data);
    const data = response.data;
    form.value.company_name = data?.company_name;
    form.value.first_name = data?.first_name;
    form.value.last_name = data?.last_name;
    form.value.email = data?.email;
    form.value.contact = data?.contact;
    form.value.image_path = data?.image_path;
    form.value.address_1 = data?.address_1;
    form.value.address_2 = data?.address_2;
    form.value.city = data?.city;
    form.value.state_or_province = data?.state_or_province;
    form.value.zip = data?.zip;
    form.value.country = data?.country;
    form.value.comments = data?.comments;
    form.value.files = data?.files;
  } catch (error) {
    console.error(error);
  } finally {
  }
};

onMounted(() => fetchData(route.params.id));

const submitForm = async () => {
  if (validateForm()) {
    loading.value = true;
    try {
      const response = await supplier.updateSupplier(
        route.params.id,
        form.value
      );
      console.log(response.status);
      if (response?.status === 201) {
        showNotification("success", "Successfully updated");
        router.push({ name: "supplier" });
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
const validateStateOrProvince = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.state_or_province)) {
    form.value.state_or_province = form.value.state_or_province.replace(
      /[^A-Za-z\s]/g,
      ""
    );
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
