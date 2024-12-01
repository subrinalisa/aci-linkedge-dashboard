<template>
  <div>
    <h3 class="text-md font-semibold mb-3">
      <span class="text-blue-500">Inventory</span>
    </h3>
    <form>
      <div class="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label class="block mb-2">Dhaka</label>

          <div class="grid grid-cols-1 gap-2">
            <div>
              <input
                type="text"
                value="Quantity"
                class="border border-grey rounded-md shadow-sm px-1 py-1 mr-px w-5/12"
                readonly
              />
              <input
                type="text"
                v-model="quantity"
                class="border border-grey rounded-md shadow-sm px-1 py-1 w-5/12"
              />
            </div>
            <div>
              <input
                type="text"
                value="Recorder Level"
                class="border border-grey rounded-md shadow-sm px-1 py-1 mr-px w-5/12"
                readonly
              />
              <input
                type="text"
                v-model="recorderLevel"
                class="border border-grey rounded-md shadow-sm px-1 py-1 w-5/12"
              />
            </div>
          </div>
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
      quantity: "",
      recorderLevel: "",
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
``
