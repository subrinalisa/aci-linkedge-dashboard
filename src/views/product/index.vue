<script setup>
import MainLayout from "@/components/MainLayout.vue";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

import { useDataStore } from "@/stores/data";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

const dataStore = useDataStore();
const { getProducts } = dataStore;
const { isLoading } = storeToRefs(dataStore);

const filteredItems = ref(null);
const allItems = ref(null);
let page = ref(1);
let search = ref("");
let paginate = ref(10);

const deleteItem = (index) => {};

onMounted(() => {
  getAllProducts();
});
const getAllProducts = async () => {
  allItems.value = await getProducts(search.value, page.value, paginate.value);
  filteredItems.value = allItems.value?.data;
};
const productSearch = async (input) => {
  // if (input) {
  search.value = input;
  page.value = 1;
  allItems.value = await getProducts(search.value, page.value, paginate.value);
  filteredItems.value = allItems.value?.data;
  // }
  // filteredItems.value = allItems.value?.data?.filter((product) =>
  //   product.name.toLowerCase().includes(input.toLowerCase())
  // );
  // else filteredItems.value = allItems.value?.data;
};
const handlePagination = (pageNo) => {
  page.value = pageNo;

  getAllProducts();
};
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-3">
      <input
        type="text"
        placeholder="Search..."
        class="px-4 py-2 border rounded"
        @input="productSearch($event?.target?.value)"
      />
      <router-link :to="{ name: 'item-create' }">
        <button
          class="flex items-center px-4 py-2 mt-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2" />
          New Item
        </button>
      </router-link>
    </div>
    <h1 class="title">All Products ({{ allItems?.total || 0 }})</h1>
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>Actions</th>
            <th class="text-left">Name</th>
            <th class="text-left">UPC/EAN/ISBN</th>
            <th class="text-left">Category</th>
            <th class="text-right">Price</th>
            <th class="text-right">Quantity</th>
            <th class="text-left">Supplier</th>
            <th class="text-left">Product ID</th>
            <th>Location Cost Price</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="!isLoading && !filteredItems?.length">
            <td colspan="9" class="text-red-600">No Product Found . . .</td>
          </tr>
          <tr v-for="(item, index) in filteredItems" :key="index">
            <td class="lg:text-center text-left lg:w-24 whitespace-nowrap">
              <button
                @click="
                  $router.push({ name: 'item-edit', params: { id: item?.id } })
                "
                class="px-2 py-1 bg-[#000180] text-white rounded hover:bg-indigo-600 mr-2"
              >
                <EditOutlined class="align-middle" />
              </button>
              <!-- <button
              @click="deleteItem(index)"
              class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <DeleteOutlined class="align-middle" />
            </button> -->
            </td>

            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Name:</span>
              {{ item.name }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">UPC/EAN/ISBN :</span>
              {{ item.upc_ean_isbn || "-" }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Category:</span>
              {{ item.category ? item.category.name : "N/A" }}
            </td>
            <td class="lg:text-right text-left">
              <span class="md:hidden mr-1 font-bold">Price:</span>

              {{
                item?.product_prices
                  ? Number(item?.product_prices?.selling_price)?.toFixed(2)
                  : "-"
              }}
            </td>
            <td class="lg:text-right text-left">
              <span class="md:hidden mr-1 font-bold">Quantity:</span>

              {{
                item?.pack_size?.quantity
                  ? Number(item?.pack_size?.quantity)?.toFixed(2)
                  : "-"
              }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Supplier:</span>

              {{ item.supplier ? item.supplier.company_name : "N/A" }}
            </td>
            <td class="text-left">
              <span class="md:hidden mr-1 font-bold">Product ID:</span>

              {{ item.product_id || "-" }}
            </td>
            <td class="lg:text-center text-left">
              <span class="md:hidden mr-1 font-bold">Location Cost Price:</span>

              {{ item.locationCostPrice || "Not Set" }}
            </td>
          </tr>
          <tr v-if="isLoading">
            <td colspan="9" class="text-red-600">Loading . . .</td>
          </tr>
        </tbody>
      </table>
    </div>
    <a-pagination
      v-if="allItems?.total > paginate"
      v-model:current="page"
      v-model:page-size="paginate"
      :total="allItems?.total"
      :show-total="(total) => `Total ${total} items`"
      :showSizeChanger="false"
      @change="handlePagination(page)"
    />
  </MainLayout>
</template>
