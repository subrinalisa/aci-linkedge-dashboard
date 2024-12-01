<template>
  <MainLayout>
    <div class="bg-white p-3 rounded-md">
      <div class="flex justify-between items-center mb-3">
        <h6 class="font-medium">Edit Branch</h6>
        <button
          type="button"
          class="px-4 py-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
          @click="$router.go(-1)"
        >
          Back
        </button>
      </div>
      <hr />
      <form @submit.prevent="submitForm">
        <div class="lg:grid grid-cols-3 gap-4 items-center mt-3">
          <label for="organization_name">Organization Name</label>
          <input
            id="organization_name"
            type="text"
            placeholder="Enter here . . ."
            v-model="form.organization_name"
            :class="{ 'border-red-500': formErrors.organization_name }"
            class="input-text col-span-2"
          />
          <label for="branch">Branch</label>
          <input
            id="branch"
            type="text"
            placeholder="Enter here . . ."
            v-model="form.branch"
            :class="{ 'border-red-500': formErrors.branch }"
            class="input-text col-span-2"
          />
          <label for="address">Address</label>
          <textarea
            id="address"
            placeholder="Enter here . . ."
            v-model="form.address"
            :class="{ 'border-red-500': formErrors.address }"
            class="input-text col-span-2 resize-none"
            rows="3"
          ></textarea>
          <!-- Empty cell for spacing -->
          <div class="col-span-3"></div>
          <!-- Submit Button in a full-width cell -->
          <div class="col-span-3 flex justify-end mt-3">
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 min-w-32 bg-[#000180] text-white rounded-lg hover:bg-indigo-600"
            >
              Update
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
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const loading = ref(false);

const form = ref({
  organization_name: "",
  branch: "",
  address: ""
});

const formErrors = ref({});

const router = useRouter();
const route = useRoute();

const validateForm = () => {
  const errors = {};

  if (!form.value.organization_name) {
    errors.organization_name = "Organization Name is required";
  }
  if (!form.value.branch) {
    errors.branch = "Branch is required";
  }
  if (!form.value.address) {
    errors.address = "Address is required";
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const fetchBranchDetails = async () => {
  try {
    const id = route.params.id;
    const response = await branch.showBranch(id);
    form.value = response.data;
  } catch (error) {
    console.error("Failed to fetch branch details:", error);
  }
};

const submitForm = async () => {
  if (validateForm()) {
    loading.value = true;
    try {
      const id = route.params.id;
      const response = await branch.updateBranch(form.value, id);
      console.log("Form Data:", form.value);
      console.log("Branch ID:", id);
      console.log("API Response:", response);
      if (response?.status === 200) {
        showNotification(
          "success",
          response?.data?.message || "Updated successfully"
        );
        router.push({ name: "branch" });
      }
    } catch (error) {
      console.error("Failed to submit branch:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to submit branch"
      );
    } finally {
      loading.value = false;
    }
  } else {
    console.log("Form contains errors:", formErrors.value);
  }
};

onMounted(() => {
  if (route.params.id) {
    fetchBranchDetails();
  }
});
</script>
