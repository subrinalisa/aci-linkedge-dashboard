<template>
  <div class="bg-white p-5 rounded-lg shadow">
    <h3 class="text-md font-semibold mb-3">
      <span class="text-blue-500">Pricing (Fields in red are required)</span>
    </h3>
    <form>
      <div class="grid grid-cols-1 gap-4 mb-3">
        <div>
          <label class="block text-red-500 mb-2"
            >Cost Price [Without Tax]</label
          >
          <input
            type="text"
            v-model="costPrice"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block text-red-500 mb-2">Selling Price</label>
          <input
            type="text"
            v-model="sellingPrice"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block mb-2">Trade Price</label>
          <input
            type="text"
            v-model="tradePrice"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block mb-2">Vat</label>
          <input
            type="text"
            v-model="vat"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block mb-2">Wholesale</label>
          <input
            type="text"
            value="Present Off"
            class="border border-grey rounded-md shadow-sm px-1 py-1 mr-px w-1/6"
            readonly
          />
          <input
            type="text"
            v-model="wholesale"
            class="border border-grey rounded-md shadow-sm px-1 py-1 w-4/5"
          />
        </div>
        <div>
          <label class="block mb-2">Promo Price</label>
          <input
            type="text"
            v-model="promoPrice"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label class="block mb-2">Promo Start Date</label>
          <input
            type="date"
            v-model="promoStartDate"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
        <div>
          <label class="block mb-2">Promo End Date</label>
          <input
            type="date"
            v-model="promoEndDate"
            class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-3">
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="disableFromPriceRules" />
          <label>Disable From Price Rules</label>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="allowPriceOverride" />
          <label>Allow price override regardless of permissions</label>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="changeCostPriceDuringSale" />
          <label>Change cost price during sale</label>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="overrideDefaultCommission" />
          <label>Override Default Commission</label>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="pricesIncludeTax" />
          <label>Prices include Tax</label>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="overrideDefaultTax" />
          <label>Override Default Tax</label>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="onlyAllowWholeNumbers" />
          <label>Only allow items to be sold in whole numbers</label>
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
      costPrice: "",
      sellingPrice: "",
      tradePrice: "",
      vat: "",
      wholesale: "",
      promoPrice: "",
      promoStartDate: "",
      promoEndDate: "",
      disableFromPriceRules: false,
      allowPriceOverride: false,
      changeCostPriceDuringSale: false,
      overrideDefaultCommission: false,
      pricesIncludeTax: false,
      overrideDefaultTax: false,
      onlyAllowWholeNumbers: false,
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
