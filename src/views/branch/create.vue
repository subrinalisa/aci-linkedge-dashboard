<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center">
        <div class="mb-3">
          <h6 class="font-medium">Create New Branch</h6>
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
          <label for="organization_name">Organization Name <span class="text-red-600">*</span></label>
          <input id="organization_name" type="text" placeholder="Enter here . . ." v-model="form.organization_name"
            :class="{ 'border-red-500': formErrors.organization_name }" class="input-text col-span-2" />
          <label for="branch">Branch <span class="text-red-600">*</span></label>
          <input id="branch" type="text" placeholder="Enter here . . ." v-model="form.branch"
            :class="{ 'border-red-500': formErrors.branch }" class="input-text col-span-2" />
          <label for="address">Address</label>
          <textarea id="address" placeholder="Enter here . . ." v-model="form.address"
            :class="{ 'border-red-500': formErrors.address }" class="input-text col-span-2 resize-none"
            rows="3"></textarea>
          <!-- Empty cell for spacing -->
          <div class="col-span-3"></div>
          <!-- Submit Button in a full-width cell -->
          <div class="col-span-3 flex justify-end mt-3">
            <button type="submit" class="px-4 py-2 min-w-32 bg-[#000180] text-white rounded-lg">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/components/MainLayout.vue";
import branch from "@/stores/branch_api.js";
import { showNotification } from "@/utilities/notification";
import { ref } from "vue";
import { useRouter } from "vue-router";
const loading = ref(false);

const form = ref({
  branch: "",
  address: "",
  organization_name: ""
});

// Define reactive form error state
const formErrors = ref({});

// Basic validation function
function validateForm() {
  const errors = {};

  if (!form.value.organization_name) errors.organization_name = "Organization Name is required";
  if (!form.value.branch) errors.branch = "Branch is required";
  // if (!form.value.address) errors.address = "Address is required";

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

const router = useRouter();
const submitForm = async () => {
  if (validateForm()) {
    loading.value = true;

    try {
      form.value.taxable = form.value.taxable ? 1 : 0;
      form.value.mrr = form.value.mrr ? 1 : 0;

      const response = await branch.insertBranch(form.value);

      if (response?.status === 201) {
        console.log(response.data?.message);
        showNotification(
          "success",
          response?.data?.message || "Successfully inserted"
        );
        router.push({ name: "branch" });
      }

    } catch (error) {
      if (error.response) {
        const status = error.response.status;

        if (status === 422) {
          const errors = error.response.data.errors;
          // console.log(errors);
          // showNotification("error", "Validation failed");

          for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
              const errorMessages = errors[key];
              if (key == 'branch') {
                formErrors.value.branch = "Branch is required";
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
    // try {
    //   form.value.taxable = form.value.taxable ? 1 : 0;
    //   form.value.mrr = form.value.mrr ? 1 : 0;
    //   const response = await branch.insertBranch(form.value);
    //   console.log(response.status);
    //   if (response?.status === 201) {
    //     console.log(response.data?.message);
    //     showNotification(
    //       "success",
    //       response?.data?.message || "Successfully inserted"
    //     );
    //     router.push({ name: "branch" });
    //   }

    //   // if (response?.status === 422) {
    //   //   console.log(response.data?.message);
    //   //   showNotification("error", response?.data?.error);
    //   // }
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   loading.value = false;
    // }
  } else {
    loading.value = false;
    // console.log("Form contains errors:", formErrors.value);
  }
};
</script>
