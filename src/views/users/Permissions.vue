<script setup>
import { apiBase, config } from "@/config";
import { onMounted, ref } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import axios from "axios";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { showNotification } from "@/utilities/notification";

const searchQuery = ref("");
const isLoading = ref(false);
const allData = ref([]);

// Pagination
const search = ref("");
const paginate = ref(10);
const total = ref(0);

const getData = async (page = "") => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${apiBase}/permission_list_with_paginate?search=${search.value}&paginate=${paginate.value}&page=${page}`,
      config
    );

    isLoading.value = false;
    if (res?.data?.status == "success") {
      allData.value = res?.data?.permissions?.data;
      total.value = res?.data?.permissions?.total;
    }
  } catch (err) {
    isLoading.value = false;
  }
};
const isDeleting = ref(false);

const deleteData = async (id) => {
  isDeleting.value = true;
  try {
    const res = await axios.delete(`${apiBase}/permissions/${id}`, config);

    isDeleting.value = false;
    showNotification(res?.data?.status, res?.data?.message);
    if (res?.data?.status == "success") await getData();
  } catch (err) {
    isDeleting.value = false;
  }
};
onMounted(async () => {
  await getData();
});
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-3">
      <!-- Search -->
      <div class="grow">
        <input
          type="text"
          placeholder="Search..."
          class="search"
          v-model="search"
          @input="getData()"
        />
      </div>

      <div>
        <button
          @click="$router.push({ name: 'permission-create' })"
          class="c-btn flex items-center gap-x-2"
        >
          <PlusOutlined />
          <span>Add New</span>
        </button>
      </div>
    </div>
    <h2 class="title">Manage Dashboards ({{ total }})</h2>
    <table class="purchase-table mb-3">
      <thead class="table-header">
        <tr>
          <th class="w-16">Actions</th>
          <th>Type</th>
          <th>Title</th>
          <th>Description</th>
          <th>Url</th>
          <th>Group ID</th>
          <th>Report ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!allData?.length && !isLoading">
          <td colspan="8">No Data</td>
        </tr>
        <tr v-if="isLoading">
          <td colspan="8">Loading...</td>
        </tr>

        <tr v-for="item in allData" :key="item?.id">
          <td>
            <div class="flex gap-x-2">
              <button
                type="button"
                class="edit_btn"
                @click="$router.push({ name: 'permission-edit', params: { id: item?.id } })"
              >
                <EditOutlined class="align-middle" />
              </button>

              <a-popconfirm title="Are you sure delete?" @confirm="deleteData(item?.id)">
                <button type="button" class="del_btn">
                  <DeleteOutlined class="align-middle" />
                </button>
              </a-popconfirm>
            </div>
          </td>
          <td>{{ item?.report_type || "-" }}</td>
          <td>{{ item?.name || "-" }}</td>
          <td>{{ item?.description || "-" }}</td>
          <td>{{ item?.url || "-" }}</td>
          <td>{{ item?.module || "-" }}</td>
          <td>{{ item?.report_id || "-" }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <a-pagination
      v-if="total > paginate"
      size="small"
      :total="total"
      :show-total="(total) => `Total ${total} items`"
      :show-size-changer="false"
      show-quick-jumper
      @change="(page) => getData(page)"
    />
  </MainLayout>
</template>
