<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center">
        <div class="mb-3">
          <h6 class="font-medium">Create New Mrr</h6>
        </div>
        <div class="mb-3">
          <button type="button" class="px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
            @click="$router.go(-1)">
            Back
          </button>
        </div>
      </div>
      <hr />
      <form @submit.prevent="submitForm()">
        <div class="lg:grid grid-cols-3 gap-4 items-center">
          <label for="name">Name <span class="text-red-600">*</span></label>
          <input id="name" @input="validateName" type="text" placeholder="Enter here . . ." v-model="form.name"
            :class="{ 'border-red-500': formErrors.name }" class="input-text col-span-2" />
          <label for="supplier_id">Supplier <span class="text-red-600">*</span></label>
          <v-select id="supplier_id" v-model="form.supplier_id" @search="onSearchSupplier" :options="suppliers"
            label="company_name" :reduce="(supplier) => supplier.id" placeholder="Select Supplier..."
            class=" col-span-2" :style="formErrors.supplier_id ? 'border: 1px red solid; border-radius: 5px;' : ''">
            <template #no-options>
              <span class="text-gray-500">Type to search Select Supplier...</span>
            </template>
          </v-select>
          <label for="status">Status</label>
          <v-select id="status" v-model="form.status" :options="[
            { label: 'Active', value: 1 },
            { label: 'In Active', value: 0 },
          ]" label="label" :reduce="(opt) => opt.value" placeholder="Select Status..." class=" col-span-2"
            :style="formErrors.status ? 'border: 1px red solid; border-radius: 5px;' : ''">
            <template #no-options>
              <span class="text-gray-500">Type to search Select Status...</span>
            </template>
          </v-select>

          <div class="col-span-3 flex justify-end mt-3">
            <button type="submit" class="px-4 py-2 min-w-32 bg-[#000180] text-white rounded-lg" :disabled="loading">
              <a-spin v-if="loading" />
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
// import branch from "@/stores/branch_api.js";
import { showNotification } from "@/utilities/notification";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import vSelect from "vue-select";
import axios from "axios";
import { apiBase } from "@/config";
const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const apiClientMultiple = axios.create({
  baseURL: apiBase,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
});

const loading = ref(false);

const form = ref({
  supplier_id: "",
  name: "",
  status: 1,
});
const suppliers = ref([]);
const formErrors = ref({});

function validateForm() {
  const errors = {};

  if (!form.value.name) errors.name = "Name is required";
  if (!form.value.supplier_id) errors.supplier_id = "Supplier is required";
  if (!form.value.status) errors.status = "Status is required";

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

const onSearchSupplier = async (query, loading) => {
  if (query.length < 1) return;
  loading(true);

  try {
    const response = await axios.get(
      `${apiBase}/supplier/search?term=${query}`,
      config
    );
    suppliers.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading(false);
  }
};

const router = useRouter();
const submitForm = async () => {
  if (validateForm()) {
    loading.value = true;

    try {
      form.value.taxable = form.value.taxable ? 1 : 0;
      form.value.mrr = form.value.mrr ? 1 : 0;

      const response = await apiClientMultiple.post(`/mrr`, form.value);

      if (response?.status === 201) {
        // console.log(response.data?.message);
        showNotification(
          "success",
          response?.data?.message || "Successfully inserted"
        );
        router.push({ name: "mrr" });
      }

    } catch (error) {
      if (error.response) {
        const status = error.response.status;

        if (status === 422) {
          const errors = error.response.data.errors;


          for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
              const errorMessages = errors[key];
              if (key == 'name') {
                formErrors.value.name = "Name is required";
              }
              if (key == 'supplier_id') {
                formErrors.value.supplier_id = "Supplier is required";
              }

              if (key == 'status') {
                formErrors.value.status = "Status is required";
              }

              errorMessages.forEach((message) => {

                showNotification("error", message);
              });
            }
          }
        } else {
          showNotification("error", error.response.data?.message || "An error occurred");
        }
      } else {
        // console.error(error);
        showNotification("error", "An error occurred. Please try again.");
      }
    } finally {
      loading.value = false;
    }

  } else {
    loading.value = false;
  }
};
const validateName = () => {
  const regex = /^[A-Za-z\s]*$/;
  if (!regex.test(form.value.name)) {
    form.value.name = form.value.name.replace(/[^A-Za-z\s]/g, '');
  }
};
</script>
