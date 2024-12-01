<template>
  <div>
    <h2 class="text-lg font-semibold mb-3">
      <span class="text-blue-500">
        Item Information (Fields in red are required)</span
      >
    </h2>
    <form>
      <div class="mb-4">
        <label class="block text-gray-700 font-weight: 700">Item Name</label>
        <input
          type="text"
          v-model="itemName"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-red-500">Category</label>
        <input
          type="text"
          v-model="category"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">Supplier</label>
        <input
          type="text"
          v-model="supplier"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">UPC/EAN/ISBN</label>
        <input
          type="text"
          v-model="upcEanIsbn"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">Product ID</label>
        <input
          type="text"
          v-model="productId"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">Additional Item Numbers</label>
        <input
          type="text"
          v-model="additionalItemNumbers"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">Tags</label>
        <input
          type="text"
          v-model="tags"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">Manufacturer</label>
        <input
          type="text"
          v-model="manufacturer"
          class="w-full border border-gray rounded-md shadow-sm px-2 py-1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700">Description</label>
        <textarea
          v-model="description"
          class="w-full border border-gray rounded-md shadow-sm px-4 py-2"
        ></textarea>
      </div>
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          class="px-4 py-2 bg-[#000180] text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      itemName: "",
      category: "",
      supplier: "",
      upcEanIsbn: "",
      productId: "",
      additionalItemNumbers: "",
      tags: "",
      manufacturer: "",
      description: "",
    };
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
