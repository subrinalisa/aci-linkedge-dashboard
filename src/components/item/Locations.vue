<template>
  <div class="bg-white p-5 rounded-lg shadow">
    <h3 class="text-md font-semibold mb-3">
      <span class="text-blue-500">Locations</span>
    </h3>
    <form>
      <div class="grid grid-cols-1 gap-4 mb-3">
        <div>
          <label class="block text-500 mb-2">Location At Store</label>
          <input
            type="text"
            v-model="locationAtStore"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block text-500 mb-2">Reorder Level</label>
          <input
            type="text"
            v-model="reorderLevel"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block mb-2">Replenish Level</label>
          <input
            type="text"
            v-model="replenishLevel"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-3">
        <div class="flex items-center gap-2">
          <label>Hide From Grid:</label>
          <input type="checkbox" v-model="hideFromGrid" />
        </div>
        <div class="flex items-center gap-2">
          <label>Override Prices:</label>
          <input type="checkbox" v-model="overridePrices" />
        </div>
        <div class="flex items-center gap-2">
          <label>Override Default Tax:</label>
          <input type="checkbox" v-model="overrideDefaultTax" />
        </div>
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
      replenishLevel: "",
      reorderLevel: "",
      locationAtStore: "",
      hideFromGrid: false,
      overridePrices: false,
      overrideDefaultTax: false,
    };
  },
  methods: {
    // Add methods for handling form submission or other actions
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
