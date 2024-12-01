<script setup>
import Spinner from "../../components/Spinner.vue";
import { ref } from "vue";
import axios from "axios";
import MainLayout from "@/components/MainLayout.vue";
import { apiBase, config } from "@/config";
import { showNotification } from "@/utilities/notification";

const form = ref({
  report_type: "",
  name: "",
  description: "",
  url: "",
  module: "",
  report_id: "",
  secondary_url: "",
});
const isLoading = ref(false);

const createNew = async (data) => {
  isLoading.value = true;
  try {
    const res = await axios.post(`${apiBase}/permissions`, data, config);
    isLoading.value = false;

    if (res?.data?.status == "success") {
      console.log(res);
      showNotification(res?.data?.status, res?.data?.message);
      resetForm();
    }
  } catch (err) {
    isLoading.value = false;
    console.log(err);
  }
};
const resetForm = () => {
  form.value = {
    report_type: "",
    name: "",
    description: "",
    url: "",
    module: "",
    report_id: "",
    secondary_url: "",
  };
};
</script>

<template>
  <MainLayout>
    <h6 class="title">Create Dashboard</h6>
    <form @submit.prevent="createNew(form)" class="space-y-3">
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2">Report Type</label>
        <select class="w-full input-text" v-model="form.report_type">
          <option value=""></option>
          <option value="PowerBI Report">PowerBI Report</option>
          <option value="PowerBI Dashboard">PowerBI Dashboard</option>
          <option value="PowerBI Tile">PowerBI Tile</option>
          <option value="PowerBI URL">PowerBI URL</option>
          <option value="Non Power BI">Non Power BI</option>
        </select>
      </div>
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2"
          >Title <span class="text-red-600">*</span></label
        >
        <input
          id="name"
          type="text"
          placeholder="Title"
          class="w-full input-text"
          required
          v-model="form.name"
        />
      </div>
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2">Description</label>
        <input
          id="name"
          type="text"
          placeholder="Description"
          class="w-full input-text"
          v-model="form.description"
        />
      </div>
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2">Url</label>
        <input
          id="name"
          type="text"
          placeholder="Url"
          class="w-full input-text"
          v-model="form.url"
        />
      </div>
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2"
          >GroupID <span class="text-red-600">*</span></label
        >
        <input
          id="name"
          type="text"
          placeholder="GroupID"
          class="w-full input-text"
          required
          v-model="form.module"
        />
      </div>
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2">ReportID</label>
        <input
          id="name"
          type="text"
          placeholder="ReportID"
          class="w-full input-text"
          v-model="form.report_id"
        />
      </div>
      <div class="md:flex justify-between items-center">
        <label for="name" class="text-sm w-44 mb-2">Secondary Url:</label>
        <input
          id="name"
          type="text"
          placeholder="Secondary Url:"
          class="w-full input-text"
          v-model="form.secondary_url"
        />
      </div>

      <div class="flex gap-x-3 mt-5">
        <button type="submit" class="c-btn">Save <Spinner v-if="isLoading" /></button>
        <button type="button" @click="$router.go(-1)" class="d-btn">Cancel</button>
      </div>
    </form>
  </MainLayout>
</template>

<style scoped>
.scrollable-content {
  overflow-y: auto;
}
</style>
