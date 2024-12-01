<template>
 
    <div class="bg-white p-5 rounded-lg shadow">
      <h3 class="text-md font-semibold mb-2">
        <span class="text-blue-500">
          Pack Size (Fields in red are required)</span
        >
      </h3>

      <table class="w-full">
        <thead>
          <tr>
            <th class="w-1/12">Name</th>
            <th class="w-1/12">Qty.</th>
            <th class="w-1/12">TP</th>
            <th class="w-1/12">Vat %</th>
            <th class="w-1/12">Vat</th>
            <th class="w-1/12">Selling Price</th>
            <th class="w-1/6">Default Unit</th>
            <th class="w-1/6" >Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                v-model="packSize.name"
                class="border border-gray rounded-md shadow-sm px-1 py-1"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="packSize.qty"
                class="border border-gray rounded-md shadow-sm px-1 py-1"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="packSize.tp"
                class="border border-gray rounded-md shadow-sm px-1 py-1"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="packSize.vats"
                class="border border-gray rounded-md shadow-sm px-1 py-1"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="packSize.vat"
                class="border border-gray rounded-md shadow-sm px-1 py-1"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="packSize.sellingPrice"
                class="border border-gray rounded-md shadow-sm px-1 py-1"
              />
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                v-model="packSize.defaultUnit"
                class="self-center"
              />
            </td>
            <td class="text-center">
              <button @click="deletePackSize" class="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <br>
    <div class="mb-6 bg-white p-5 rounded-lg shadow">
      <h3 class="text-md font-semibold mb-2">
        <span class="text-blue-500"
          >Variations (Fields in red are required)</span
        >
      </h3>
      <div class="mb-4">
        <label class="block mb-2">Item Attributes</label>
        <div class="flex items-center gap-2 mb-2">
          <select
            v-model="selectedAttribute"
            class="border border-grey rounded-md shadow-sm px-2 py-1 flex-1"
          >
            <option value="" disabled>Select an Attribute</option>
            <!-- Add options here -->
            <option
              v-for="attribute in attributes"
              :key="attribute"
              :value="attribute"
            >
              {{ attribute }}
            </option>
          </select>
          <button
            @click="addAttribute"
            class="bg-blue-800 text-white rounded-md px-3 py-1"
          >
            Add
          </button>
        </div>

        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-2">Name</th>
              <th class="p-2">Values</th>
              <th class="p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(attribute, index) in itemAttributes" :key="index">
              <td class="border border-gray-300 p-2">{{ attribute.name }}</td>
              <td class="border border-gray-300 p-2">{{ attribute.values }}</td>
              <td class="border border-gray-300 p-2 text-center">
                <button @click="deleteAttribute(index)" class="text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <button
          @click="manageGlobalAttributes"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-2 hover:border-transparent rounded"
        >
          Manage Global Attributes
        </button>

        <br>
        <label class="block mb-2">Item Variations:</label>
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-2">Name</th>
              <th class="p-2">Attributes</th>
              <th class="p-2">Item Number</th>
              <th class="p-2">Is Ecommerce Item</th>
              <th class="p-2">Variation ID</th>
              <th class="p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
           
          </tbody>
        </table>

      </div>
    </div>
    <div class="flex justify-end space-x-4">
      <button type="button" class="px-4 py-2 bg-[#000180] text-white rounded-lg">
        Save
      </button>
    </div>

</template>

<script>
export default {
  data() {
    return {
      packSize: {
        name: "",
        qty: "",
        tp: "",
        vats: "",
        vat: "",
        sellingPrice: "",
        defaultUnit: false,
      },
      selectedAttribute: "",
      attributes: ["Attribute 1", "Attribute 2", "Attribute 3"],
      itemVariations: [
        {
          id: 1,
          name: "",
          attributes: "",
          itemNumber: "",
          isEcommerceItem: false,
          variationId: "",
        },
      ],
    };
  },
  methods: {
    deletePackSize() {
      // Logic to delete pack size
    },
    addItemAttribute() {
      // Logic to add item attribute
    },
    manageGlobalAttributes() {
      // Logic to manage global attributes
    },
    addItemVariation() {
      // Logic to add item variation
    },
    autoCreateVariation() {
      // Logic to auto-create variation
    },
    deleteItemVariation(id) {
      this.itemVariations = this.itemVariations.filter(
        (variation) => variation.id !== id
      );
    },
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
