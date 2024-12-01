<script setup>
import MainLayout from "@/components/MainLayout.vue";
import moment from "moment";
import { usePsalesStore } from "@/stores/psales.js";
import { useDataStore } from "@/stores/data.js";
import { PictureOutlined, UserOutlined } from "@ant-design/icons-vue";
import { storeToRefs } from "pinia";
import { nextTick, ref, watchEffect, onMounted } from "vue";
import { imgBase } from "@/config";
import { showNotification } from "@/utilities/notification";

const dataStore = useDataStore();
const { userInfo } = storeToRefs(dataStore);
const permissions = JSON.parse(localStorage.getItem("permissions"));

const psalesStore = usePsalesStore();
const { paymentList, returnProductList, prices, isSearching, isPayment } = storeToRefs(psalesStore);
const { getSaleProduct, getSupplier, getBranch, getMRR, getPayment, purchaseReturn } = psalesStore;

/*-------- Variables ---------*/
const searchProduct = ref(null);
const visibleProductSearch = ref(false);
const allSupplier = ref(null);
const supplierList = ref(null);
const mrrList = ref(null);
const allMrrList = ref(null);
const supplierInfo = ref();
const visibleMrr = ref(false);
const visibleSupplier = ref(false);
const mrrInfo = ref({
  name: null,
  id: null,
});
const branchList = ref(null);
const branch_id = ref("");
const payment_method_id = ref(2);
const getis_percent = ref(null);
const amount = ref(null);
const paid_amount = ref(null);
const note = ref(null);
const isValidAmount = ref(false);

/*-------- Ref ---------*/
const searchInput = ref(null);
const searchList = ref(null);
const productQuantity = ref(null);
const supplierInput = ref(null);
const suppliers = ref(null);
const mrrs = ref(null);
const mrrInput = ref(null);
const getisInput = ref();
const paidInput = ref(null);
const noteInput = ref(null);
const purchaseBtn = ref(null);

/*-------- Onmounted ---------*/
onMounted(async () => {
  // Payment gateway
  await getPayment();
  // Branch
  branchList.value = await getBranch();
  branch_id.value = userInfo.value?.branch_id;
  // Supplier
  allSupplier.value = await getSupplier("");
  supplierList.value = allSupplier.value;
  // MRR
  // allMrrList.value = await getMRR();
  // mrrList.value = allMrrList.value;
});
/*-------- Product Search ---------*/
const handleProductSearch = async (query) =>
  (searchProduct.value = await getSaleProduct(query, branch_id.value));

const calculateTotalPrice = (price, quantity) => {
  return (Number(price) * Number(quantity)).toFixed(2);
};

const calculateStock = (stockes) => {
  const total = stockes.reduce((sum, batch) => {
    return sum + parseFloat(batch.balanced_quantity);
  }, 0);
  return total;
};
const storeProducts = (product) => {
  let quantity = 1;
  const existingProductIndex = returnProductList.value.findIndex((item) => item?.id == product?.id);
  if (existingProductIndex != -1) {
    if (
      returnProductList.value[existingProductIndex].quantity ==
      returnProductList.value[existingProductIndex].stock
    ) {
      showNotification("warning", "Sorry ! Stock Out");
      return 0;
    }
    quantity++;
    returnProductList.value[existingProductIndex].quantity++;
    returnProductList.value[existingProductIndex].total = calculateTotalPrice(
      product?.product_prices?.trade_price,
      quantity
    );
    nextTick(() => productQuantity.value[existingProductIndex]?.focus());
  } else {
    const checkStock = calculateStock(product?.stock_batches);

    if (checkStock <= 0) {
      showNotification("warning", "Sorry ! Sold out");
      return 0;
    }
    returnProductList.value = [
      ...returnProductList.value,
      {
        ...product,
        quantity: quantity,
        total: calculateTotalPrice(product?.product_prices?.trade_price, quantity),
        stock: calculateStock(product?.stock_batches),
        expiry_date: "",
      },
    ];

    nextTick(() => productQuantity.value?.at(-1)?.focus());
  }
  calculateGetisAmount();
  calculatePaidAmount();
};
const updateQuantity = (product, quantity) => {
  if (quantity > product?.stock) {
    showNotification("warning", "Sorry ! Stock limit exceeded");
    product.quantity = product?.stock;
    return 0;
  }
  product.total = calculateTotalPrice(Number(product?.product_prices?.trade_price), quantity);

  calculateGetisAmount();
  calculatePaidAmount();
};
const updateExpireDate = (index, date) => {
  returnProductList.value[index].expiry_date = date;
};
const calculateGetisPercent = () => {
  if (amount.value > prices.value.subtotal) {
    amount.value = prices.value.subtotal;
  }
  if (amount.value <= 0) {
    amount.value = 0;
  }
  getis_percent.value = ((amount.value / prices.value.subtotal) * 100).toFixed(2);
};
const calculateGetisAmount = async () => {
  await nextTick();
  if (getis_percent.value <= 0) {
    getis_percent.value = 0;
  }

  if (getis_percent.value > 99) {
    getis_percent.value = 99;
  }

  amount.value = ((Number(prices.value.subtotal) * Number(getis_percent.value)) / 100).toFixed(2);
};
const calculatePaidAmount = async () => {
  await nextTick();
  paid_amount.value = prices.value.total;
};
/*-------- Supplier & MRR ---------*/
const supplierSearch = async (query) => {
  if (!query) {
    supplierList.value = allSupplier.value;
    return 0;
  }

  allSupplier.value = await getSupplier(query);
  supplierList.value = allSupplier.value;
};

const searchMRR = async (query) => {
  try {
    allMrrList.value = await getMRR(query, supplierInfo.value?.id);

    if (Array.isArray(allMrrList.value)) {
      mrrList.value = allMrrList.value.map((mrr) => {
        const supplierName = mrr.supplier?.company_name ? ` (${mrr.supplier.company_name})` : "";
        return {
          ...mrr,
          name: `${mrr.name}${supplierName}`,
        };
      });
    } else {
      console.error("Expected an array but got:", allMrrList.value);
      mrrList.value = [];
    }
  } catch (error) {
    console.error("Error fetching MRR data:", error);
    mrrList.value = [];
  }
};
/*-------- Purchase Insert ---------*/
const reset = () => {
  returnProductList.value = [];
  supplierInfo.value = null;
  getis_percent.value = 0;
  amount.value = 0;
  mrrInfo.value = {
    name: null,
    id: null,
  };

  prices.value = {
    subtotal: null,
    tradePrice: null,
    vat: null,
    total: null,
    due: null,
  };
  paid_amount.value = null;
  payment_method_id.value = 2;
  note.value = null;
  branch_id.value = userInfo.value?.branch_id;
};

watchEffect(() => {
  if (returnProductList.value?.length > 0) {
    const subtotal = returnProductList.value?.reduce((sum, item) => sum + Number(item?.total), 0);
    const tp = returnProductList.value?.reduce(
      (sum, item) => sum + Number(item?.product_prices?.trade_price) * Number(item?.quantity),
      0
    );
    const vat = returnProductList.value?.reduce(
      (sum, item) => sum + Number(item?.product_prices?.vat) * Number(item?.quantity),
      0
    );
    // if (getis_percent.value < 0) {
    //   getis_percent.value = 0;
    // }

    // if (getis_percent.value > 99) {
    //   getis_percent.value = 99;
    // }
    // amount.value = (Number(subtotal) * Number(getis_percent.value)) / 100;
    prices.value = {
      subtotal: Number(subtotal).toFixed(2),
      tradePrice: Number(tp).toFixed(2),
      vat: Number(vat).toFixed(2),
      total: Math.round(subtotal).toFixed(2),
      due: Math.round(subtotal).toFixed(2),
    };
    paid_amount.value = paid_amount.value || prices.value.total;
    if (paid_amount.value > prices.value.total || paid_amount.value < 0) {
      isValidAmount.value = true;
      paid_amount.value = Number(prices.value.total)?.toFixed(2);
    }
    prices.value.due = Math.round(prices.value.total - paid_amount.value);
  } else
    prices.value = {
      subtotal: null,
      tradePrice: null,
      vat: null,
      total: null,
      due: null,
    };
});

const handlePurchase = async (router) => {
  if (!returnProductList.value?.length) {
    searchInput.value?.focus();
    showNotification("error", "Please insert a product");
    return 0;
  }
  if (!mrrInfo.value.id) {
    mrrInput.value?.focus();
    showNotification("error", "Please select an MRR");
    return 0;
  }
  if (!supplierInfo.value) {
    supplierInput.value?.focus();
    showNotification("error", "Please select a Supplier");
    return 0;
  }
  if (!paid_amount.value) {
    paidInput.value?.focus();
    showNotification("error", "Please insert the payment");
    return 0;
  }

  const currDate = moment().format("YYYY-MM-DD");
  const products = returnProductList.value?.map((item) => ({
    product_id: item?.id,
    product_name: item?.name,
    pack_size_id: item?.pack_size?.id,
    tp: item?.product_prices?.trade_price,
    vat: item?.product_prices?.vat,
    cost: item?.product_prices?.selling_price,
    quantity: item?.quantity,
    total: item?.total,
    size: item?.category?.name,
    generic_name: "",
    serial: "",
    stock: item?.stock,
    cost_price_preview: item?.product_prices?.cost_price_without_tax,
    item_id: item?.id,
    batch_no: item?.batch_no,
    expiry_date: item?.expiry_date,
  }));
  const purchaseData = {
    supplier_id: supplierInfo.value?.id,
    getis_percent: getis_percent.value,
    amount: amount.value,
    mrr_id: mrrInfo.value.id,
    sub_total: prices.value.subtotal,
    total_trade_price: prices.value.tradePrice,
    total_vat: prices.value.vat,
    total: prices.value.total,
    amount_due: prices.value.due,
    purchase_return_date: currDate,
    paid_amount: paid_amount.value,
    purchase_return_products: products,
    payment_method_id: payment_method_id.value,
    note: note.value,
    branch_id: branch_id.value,
  };

  const res = await purchaseReturn(purchaseData);
  nextTick(() => {
    if (res) {
      reset();
      // router.push({ name: "return-purchases-list" });
    }
  });
};

/*-------- Cancel Purchase  ---------*/
const cancelModal = ref(false);
const cancelbtn = ref();
const confirmbtn = ref();

const confirmCancel = () => {
  cancelModal.value = false;
  reset();
};

window.addEventListener("keydown", (event) => {
  if (event?.key === "Escape") {
    visibleProductSearch.value = false;
    cancelModal.value = true;
    nextTick(() => confirmbtn.value.focus());
  } else if (event?.key === "F2") {
    event.preventDefault();
    cancelModal.value = false;
    searchInput.value?.focus();
  }
});

/*-------- Toggle Details ---------*/

const showDetails = ref(false);
</script>

<template>
  <MainLayout>
    <div class="lg:grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <h1 class="title">Purchase Return</h1>
        <!-- Search -->
        <div class="flex mb-3">
          <button type="button" class="border border-slate-300 px-5 py-2 shadow-inner">
            <i class="bi bi-search"></i>
          </button>
          <a-dropdown v-model:open="visibleProductSearch">
            <input
              type="text"
              class="searchInput"
              placeholder="Enter item name or scan barcode"
              ref="searchInput"
              @input="handleProductSearch($event?.target?.value)"
              @keyup.down="searchList?.at(0)?.focus()"
              @keyup.right="
                () => {
                  visibleProductSearch = false;
                  mrrInput.focus();
                }
              "
              @focus="
                () => {
                  searchInput.select();
                  visibleProductSearch = true;
                }
              "
            />
            <template #overlay>
              <a-menu class="max-h-80 overflow-y-auto">
                <a-menu-item v-if="isSearching">
                  <h6 class="font-bold text-red-600">Loading...</h6>
                </a-menu-item>
                <a-menu-item v-if="!isSearching && (!searchProduct || !searchProduct?.length)">
                  <h6 class="font-bold text-red-600">No Products Currently Available...</h6>
                </a-menu-item>
                <!-- a-menu-item -->
                <a-menu-item v-for="(data, index) in searchProduct" :key="data?.id">
                  <button
                    class="dropdownButton"
                    ref="searchList"
                    @click="storeProducts(data)"
                    @keyup.down="searchList?.at(index + 1)?.focus()"
                    @keyup.up="searchList?.at(index - 1)?.focus()"
                  >
                    <div class="mr-3">
                      <a-avatar
                        :size="32"
                        :src="imgBase + data?.product_images?.at(-1)?.path"
                        v-if="data?.product_images?.at(-1)?.path"
                      >
                      </a-avatar>
                      <a-avatar :size="32" v-else>
                        <PictureOutlined class="align-middle mb-2" />
                      </a-avatar>
                    </div>
                    <div>
                      <h6 class="font-bold">
                        {{ data?.name }}
                      </h6>
                      <p class="text-gray-500">
                        <span class="mr-2"
                          ><strong>Category:</strong> {{ data?.category?.name || "N/A" }};</span
                        >
                        <span class="mr-2"
                          ><strong>Available Stock:</strong>
                          {{ calculateStock(data?.stock_batches) }};</span
                        >
                        <span class="mr-2"
                          ><strong>Price:</strong>
                          {{
                            Number(
                              Number(data?.product_prices?.trade_price) +
                                Number(data?.product_prices?.vat)
                            ).toFixed(2)
                          }}</span
                        >
                        <span class="mr-2"
                          ><strong>Supplier:</strong> {{ data?.supplier?.company_name }}</span
                        >
                      </p>
                    </div>
                  </button>
                </a-menu-item>
                <!--/ a-menu-item -->
              </a-menu>
            </template>
          </a-dropdown>

          <button
            class="bg-[#000180] px-5 py-1 text-white min-w-fit hidden lg:block"
            type="button"
            @click="handlePurchase($router)"
          >
            <i class="bi bi-cart mr-2"></i> <span>Return</span>
          </button>
        </div>
        <!-- Table -->
        <div class="h-4/6 overflow-y-auto">
          <div class="overflow-x-auto">
            <table class="purchase-table">
              <thead class="table-header">
                <tr>
                  <th>
                    <button
                      type="button"
                      class="outline-none w-full block"
                      @click="showDetails = !showDetails"
                    >
                      <span v-if="showDetails">-</span>
                      <span v-else>+</span>
                    </button>
                  </th>
                  <th class="text-center">SL</th>
                  <th class="text-left">Item Name</th>
                  <th class="text-left">Pack Size</th>
                  <th class="text-right">Stock</th>
                  <th class="text-right">TP</th>
                  <th class="text-right">VAT</th>
                  <!-- <th class="text-right">Cost</th> -->
                  <th class="text-right">Qty.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr v-if="!returnProductList?.length">
                  <td colspan="9" class="text-center text-red-700">No Product Found</td>
                </tr>
                <tr v-for="(product, index) in returnProductList" :key="index">
                  <td class="text-center">
                    <!-- <button
                      type="button"
                      class="w-full"
                      @click="returnProductList.splice(index, 1)"
                    >
                      <i class="bi bi-x-lg text-red-500"></i>
                    </button> -->
                    <button
                      @click="
                        returnProductList.splice(index, 1);
                        calculateGetisAmount();
                        calculatePaidAmount();
                      "
                    >
                      <i class="bi bi-x-lg text-red-500"></i>
                    </button>
                    <!-- <a-popconfirm title="Are you sure delete?" ok-text="Yes" cancel-text="No"
                      @confirm="returnProductList.splice(index, 1); calculateGetisAmount(); calculatePaidAmount();">
                      <a href="#"><i class="bi bi-x-lg text-red-500"></i></a>
                    </a-popconfirm> -->
                  </td>
                  <td class="text-center">{{ index + 1 }}</td>
                  <td class="w-full">
                    <p>{{ product?.name }}</p>
                    <div class="mt-3" v-if="showDetails">
                      <p>
                        <span class="font-semibold">Size:</span>
                        {{ product?.category?.name }}
                      </p>
                      <p>
                        <span class="font-semibold">Generic Name:</span>
                        {{ product?.generic_name || "Empty" }}
                      </p>
                      <p>
                        <span class="font-semibold">Serial:</span>
                        {{ product?.serial || "Empty" }}
                      </p>
                      <p>
                        <span class="font-semibold">Stock:</span>
                        {{ product?.stock || "Empty" }}
                      </p>
                      <p>
                        <span class="font-semibold">Cost Price Preview:</span>
                        {{ Number(product?.product_prices?.cost_price_without_tax)?.toFixed(2) }}
                      </p>
                      <p>
                        <span class="font-semibold">Item Id:</span>
                        {{ product?.id || "-" }}
                      </p>
                      <p class="mt-2">
                        <label class="mb-2 block">Select Expire Date</label>
                        <input
                          type="date"
                          class="px-3 py-1 border border-black rounded"
                          @input="updateExpireDate(index, $event?.target?.value)"
                        />
                      </p>
                    </div>
                  </td>
                  <td>{{ product?.pack_size?.name }} ({{ product?.pack_size?.quantity }})</td>
                  <td class="text-right">
                    {{ Number(product?.stock) }}
                  </td>
                  <td class="text-right">
                    {{ Number(product?.product_prices?.trade_price).toFixed(2) }}
                  </td>
                  <td class="text-right">
                    {{ Number(product?.product_prices?.vat).toFixed(2) }}
                  </td>
                  <!-- <td class="text-right">
                    {{
                      Number(product?.product_prices?.selling_price).toFixed(2)
                    }}
                  </td> -->
                  <td class="text-right min-w-24">
                    <!-- @keypress.enter="() => {
                          searchInput.focus();
                          visibleProductSearch = true;
                        }
                          " -->
                    <input
                      type="number"
                      v-model="product.quantity"
                      class="quantity focus:w-20"
                      ref="productQuantity"
                      @focus="
                        () => {
                          visibleProductSearch = false;
                          productQuantity[index].select();
                        }
                      "
                      @input="updateQuantity(product, Number(product.quantity))"
                      @keydown="
                        (event) => {
                          if (event.key == '.' || event.key == '-' || event.key == 'e') {
                            event.preventDefault();
                          }
                        }
                      "
                    />
                  </td>
                  <td class="text-right">{{ product?.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="right-side">
        <div class="border border-slate-300 p-2 px-3 mb-3">
          <!-- Branch -->
          <div class="mb-3">
            <select class="searchInput" v-model="branch_id" disabled>
              <option :value="null">Enter branch name</option>
              <template v-for="item in branchList">
                <option :value="item?.id">
                  {{ item?.organization_name }} - {{ item?.branch }}
                </option>
              </template>
            </select>
          </div>
          <!-- Supplier -->
          <div class="flex">
            <span class="border border-slate-300 px-5 py-2 shadow-inner">
              <i class="bi bi-plus-lg"></i>
            </span>
            <div class="grow">
              <a-dropdown v-model:open="visibleSupplier">
                <input
                  type="text"
                  placeholder="Enter Supplier name"
                  class="searchInput"
                  ref="supplierInput"
                  @input="supplierSearch($event?.target?.value)"
                  @keydown.down="suppliers?.at(0)?.focus()"
                  @focus="visibleSupplier = true"
                />
                <template #overlay>
                  <a-menu class="max-h-80 overflow-y-auto">
                    <a-menu-item v-if="!supplierList || !supplierList?.length">
                      <h6 class="font-bold text-red-600">No Supplier Found...</h6>
                    </a-menu-item>
                    <!-- a-menu-item -->
                    <a-menu-item v-for="(supplier, index) in supplierList" :key="index">
                      <button
                        type="button"
                        class="flex items-center w-full text-left"
                        ref="suppliers"
                        @click="
                          () => {
                            supplierInfo = supplier;
                            visibleSupplier = false;
                            searchMRR('');
                            getisInput?.focus();
                          }
                        "
                        @keydown.down="suppliers?.at(index + 1)?.focus()"
                        @keydown.up="suppliers?.at(index - 1)?.focus()"
                      >
                        <div class="mr-3">
                          <a-avatar
                            :size="32"
                            :src="imgBase + supplier?.image_path"
                            v-if="supplier?.image_path"
                          >
                          </a-avatar>
                          <a-avatar :size="32" v-else>
                            <PictureOutlined class="align-middle mb-2" />
                          </a-avatar>
                        </div>
                        <div>
                          <h6 class="font-bold">
                            {{ supplier?.company_name }}
                          </h6>
                        </div>
                      </button>
                    </a-menu-item>
                    <!--/ a-menu-item -->
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
          <div class="supplierInfo" v-if="supplierInfo">
            <div class="flex justify-between">
              <div class="mt-3">
                <div class="flex">
                  <div class="mr-3">
                    <a-avatar
                      :size="32"
                      :src="imgBase + supplierInfo?.image_path"
                      v-if="supplierInfo?.image_path"
                    >
                    </a-avatar>
                    <a-avatar :size="32" v-else>
                      <PictureOutlined class="align-middle mb-2" />
                    </a-avatar>
                  </div>
                  <div>
                    <h6 class="font-bold">
                      {{ supplierInfo?.company_name }}
                    </h6>
                    <p class="text-[#43B000]">({{ supplierInfo?.type }})</p>
                  </div>
                </div>
              </div>
              <div></div>
            </div>
            <!-- Update & detach -->
            <div class="text-right">
              <button
                type="button"
                class="w-full text-right"
                @click="
                  supplierInfo = null;
                  mrrInfo = {
                    name: null,
                    id: null,
                  };
                  mrrList = [];
                "
              >
                <i class="bi bi-x mr-3 text-red-600"></i>Detach
              </button>
            </div>
          </div>
          <!-- MRR -->
          <a-dropdown class="mb-3" v-model:open="visibleMrr">
            <input
              type="text"
              placeholder="Enter MRR name"
              class="searchInput"
              ref="mrrInput"
              v-model="mrrInfo.name"
              @input="searchMRR($event?.target?.value)"
              @keydown.down="mrrs?.at(0)?.focus()"
              @focus="visibleMrr = true"
              :disabled="!supplierInfo"
            />
            <template #overlay>
              <a-menu class="max-h-80 overflow-y-auto" v-if="supplierInfo">
                <a-menu-item v-if="!mrrList || !mrrList?.length">
                  <h6 class="font-bold text-red-600">No Data Found...</h6>
                </a-menu-item>
                <a-menu-item v-for="(mrr, index) in mrrList" :key="index">
                  <button
                    class="flex items-center w-full text-left"
                    ref="mrrs"
                    @click="
                      () => {
                        mrrInfo = mrr;
                        visibleMrr = false;
                        supplierInput.focus();
                      }
                    "
                    @keydown.down="mrrs?.at(index + 1)?.focus()"
                    @keydown.up="mrrs?.at(index - 1)?.focus()"
                  >
                    <div class="mr-3">
                      <a-avatar :size="32">
                        <template #icon>
                          <UserOutlined class="align-middle" />
                        </template>
                      </a-avatar>
                    </div>
                    <div>
                      <h6 class="font-bold">{{ mrr?.name }}</h6>
                    </div>
                  </button>
                </a-menu-item>
                <!--/ a-menu-item -->
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <!-- Price List -->
        <div class="border border-slate-300 p-2 px-3 mb-3">
          <div class="lg:grid grid-cols-2 gap-2 gap-y-3">
            <div class="mb-0">
              <p class="mb-2">Getis %</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="getis_percent"
                ref="getisInput"
                @focus="getisInput.select()"
                @keypress.enter="paidInput.focus()"
                @keydown="
                  (event) => {
                    if (event.key == '-' || event.key == 'e') {
                      event.preventDefault();
                    }
                  }
                "
                @input="calculateGetisAmount"
              />
            </div>
            <div class="mb-0">
              <p class="mb-2">Getis Amount</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="amount"
                @input="calculateGetisPercent"
              />
            </div>
            <div class="mb-0 col-span-2">
              <p class="mb-2">Sub Total:</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="prices.subtotal"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="mb-2">Total Trade Price:</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="prices.tradePrice"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="mb-2">Total VAT:</p>
              <input type="number" class="searchInput text-right" v-model="prices.vat" readonly />
            </div>
            <div class="mb-0">
              <p class="xl:text-xl lg:text-lg font-bold">Total:</p>
              <input
                type="number"
                class="searchInput text-right font-bold xl:text-xl lg:text-lg text-green-600"
                v-model="prices.total"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="xl:text-xl lg:text-lg text-red-700 font-bold">Amount Due:</p>
              <input
                type="number"
                class="searchInput text-right font-bold xl:text-xl lg:text-lg text-red-700"
                v-model="prices.due"
                readonly
              />
            </div>
          </div>
        </div>
        <!-- Payment Gateway -->
        <div class="">
          <div class="mb-2" v-if="permissions.includes('purchase-payment')">
            <h6>Add Payment</h6>
            <p class="text-red-600 mt-2" v-if="isPayment">Loading...</p>
            <template v-for="payment in paymentList">
              <button
                type="button"
                class="border px-3 py-2 rounded-md my-1 mr-2"
                :class="
                  payment_method_id == payment?.id
                    ? 'bg-[#000180] text-white'
                    : 'bg-white text-black'
                "
                @click="payment_method_id = payment?.id"
              >
                {{ payment?.name }}
              </button>
            </template>
          </div>
          <input
            type="number"
            class="searchInput rounded text-right"
            :class="{ shake: isValidAmount }"
            placeholder="Enter Amount . . ."
            ref="paidInput"
            v-model="paid_amount"
            @focus="paidInput?.select()"
            @keypress.enter="noteInput.focus()"
            v-if="permissions.includes('purchase-final-amount')"
          />
          <textarea
            rows="2"
            class="block w-full border mt-3 px-3 py-2 rounded-md"
            placeholder="note . . ."
            v-model="note"
            ref="noteInput"
            @keypress.enter="purchaseBtn.focus()"
          ></textarea>
        </div>
        <button class="submit-btn" type="button" @click="handlePurchase($router)" ref="purchaseBtn">
          <i class="bi bi-cart mr-2"></i> <span>Return</span>
        </button>
      </div>
    </div>
    <!-- Calcel -->
    <a-modal v-model:open="cancelModal" title="Are you sure you want to cancel?">
      <template #footer>
        <button
          class="cancel-btn mr-2"
          ref="cancelbtn"
          @click="cancelModal = false"
          @keyup.right="confirmbtn?.focus()"
        >
          Cancel
        </button>
        <button
          class="submit-btn"
          ref="confirmbtn"
          @click="confirmCancel"
          @keyup.left="cancelbtn?.focus()"
        >
          Confirm
        </button>
      </template>
    </a-modal>
  </MainLayout>
</template>
