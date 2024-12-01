<script setup>
import MainLayout from "@/components/MainLayout.vue";
import moment from "moment";
import { useDataStore } from "@/stores/data";
import { PictureOutlined } from "@ant-design/icons-vue";
import { storeToRefs } from "pinia";
import { nextTick, ref, onMounted, watchEffect } from "vue";
import { imgBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import { usePsalesStore } from "@/stores/psales";

const dataStore = useDataStore();
const psalesStore = usePsalesStore();
const permissions = JSON.parse(localStorage.getItem("permissions"));

const { userInfo } = storeToRefs(dataStore);

const {
  sellingProducts,
  isSearching,
  isCustomer,
  isPayment,
  isBranch,

  paymentList,
  priceList,
} = storeToRefs(psalesStore);

const {
  getCustomer,
  getPayment,
  getBranch,
  getProduct,

  returnSale,
} = psalesStore;

// Product Search
const visibleProductSearch = ref(false);
const searchInput = ref(null);
const searchList = ref("");
const searchProduct = ref(null);
const productQuantity = ref(null);
const isValidDiscount = ref(false);
const isValidEntireDiscount = ref(false);
const isValidPayAmount = ref(false);

// Product Search Events
const handleProductSearch = async (query) => {
  if (!query) return 0;
  searchProduct.value = await getProduct(query, branch_id.value);
};
const storeProducts = async (product) => {
  let quantity = 1;
  const existingProductIndex = sellingProducts.value?.findIndex(
    (item) => item?.product_id == product?.id
  );
  if (existingProductIndex != -1) {
    quantity++;
    sellingProducts.value[existingProductIndex].quantity++;
    sellingProducts.value[existingProductIndex].total = calculateTotalPrice(
      product?.product_prices?.selling_price,
      quantity,
      0
    );
    nextTick(() => productQuantity.value[existingProductIndex]?.focus());
  } else {
    sellingProducts.value.push({
      product_id: product?.id,
      product_name: product?.name,
      quantity: quantity,
      price: product?.product_prices?.selling_price || 0,
      discount_percent: 0,
      total: calculateTotalPrice(product?.product_prices?.selling_price, quantity, 0),
      stock_batches: calculateStock(product?.stock_batches),
    });

    nextTick(() => productQuantity.value?.at(-1)?.focus());
  }
  calculatePaymentAmount();
};

const calculateTotalPrice = (price, quantity, discount) => {
  const costPrice = Number(price) * Number(quantity);
  const dis = (Number(costPrice) * Number(discount)) / 100;
  return Number(costPrice - dis).toFixed(2);
};

const calculateStock = (stockes) => {
  const total = stockes.reduce((sum, batch) => {
    return sum + parseFloat(batch.balanced_quantity);
  }, 0);
  return total;
};
const calculateDiscount = (price, discount) => {
  const dis = (Number(price) * Number(discount)) / 100;
  return Number(dis).toFixed(2);
};
// Update Quantity
const updateQuantity = (product, quantity) => {
  product.total = calculateTotalPrice(product?.price, quantity, product?.discount_percent);
  calculatePaymentAmount();
};
// Supplier/Customer
const visibleCustomer = ref(false);
const suppliers = ref("");
const supplierInput = ref(null);
const supplierInfo = ref();
const allSupplierList = ref(null);
const supplierList = ref(null);

const handleSupplierSearch = async (name) => {
  allSupplierList.value = await getCustomer(name);
  supplierList.value = allSupplierList.value;
  // if (!name) {
  //   supplierList.value = allSupplierList.value;
  //   return;
  // }
  // supplierList.value = allSupplierList.value?.filter((customer) =>
  //   customer.first_name?.toLowerCase().includes(name)
  // );
};
const getSupplierInfo = (supplier) => {
  supplierInfo.value = {
    id: supplier?.id,
    name: supplier?.first_name,
    company: supplier?.company_name,
    image: imgBase + supplier?.image_path,
  };
  visibleCustomer.value = false;
  discountPerItem.value?.focus();
};

// Price
const discountPerItem = ref(null);
const discountAll = ref(null);
const discountReason = ref(null);
const paymentAmount = ref(null);
const paidAmount = ref(null);
const payment_method_id = ref(2);
const saleButton = ref("");
const notes = ref(null);
const noteInput = ref("");

const checkEntireDiscount = (discount) => {
  if (discount > 9 || discount < 0) {
    isValidEntireDiscount.value = true;
    priceList.value.discountEntire = 9;
  } else {
    isValidEntireDiscount.value = false;
  }
};
const reset = () => {
  notes.value = null;
  sellingProducts.value = [];

  supplierInfo.value = null;
  priceList.value = {
    discountPerItem: 0,
    discountEntire: 0,
    reson: null,
    subtotal: null,
    total: null,
    due: null,
  };
  paymentAmount.value = null;
  comment_on_receipt.value = false;
  payment_method_id.value = 2;
  branch_id.value = userInfo.value?.branch_id;
};
watchEffect(() => {
  if (sellingProducts.value?.length > 0) {
    if (priceList.value.discountPerItem) {
      if (priceList.value.discountPerItem > 12) {
        priceList.value.discountPerItem = 12;
        isValidDiscount.value = true;
      } else {
        isValidDiscount.value = false;
        sellingProducts.value = sellingProducts.value.map((product) => ({
          ...product,

          discount_percent: priceList.value.discountPerItem,
          total: calculateTotalPrice(
            product?.price,
            product?.quantity,
            priceList?.value.discountPerItem
          ),
        }));
      }
    } else priceList.value.discountPerItem = null;

    const subtotal = sellingProducts.value?.reduce((sum, item) => sum + Number(item?.total), 0);
    const total = sellingProducts.value?.reduce((sum, item) => sum + Number(item?.total), 0);

    priceList.value.subtotal = Number(subtotal)?.toFixed(2);
    priceList.value.total = Math.round(total - priceList.value.discountEntire).toFixed(2);

    paymentAmount.value = paymentAmount.value || priceList.value.total;
    if (paymentAmount.value > priceList.value.total || paymentAmount.value < 0)
      paymentAmount.value = Number(priceList.value.total).toFixed(2);

    if (paymentAmount.value) {
      priceList.value.due = Math.round(priceList.value.total - paymentAmount.value).toFixed(2);
    } else priceList.value.due = Math.round(priceList.value.total).toFixed(2);
  } else {
    priceList.value = {
      discountPerItem: null,
      discountEntire: null,
      reson: null,
      subtotal: null,
      total: null,
      due: null,
    };
  }
});

const calculatePaymentAmount = async () => {
  await nextTick();
  paymentAmount.value = priceList.value.total;
};
// Sale Insert
const comment_on_receipt = ref(false);
const branchList = ref(null);
const branch_id = ref("");

const handleSale = async (router) => {
  if (!sellingProducts.value?.length) {
    searchInput.value?.focus();
    showNotification("error", "Please insert a product");
    return 0;
  }
  if (!supplierInfo.value?.id) {
    if (Number(paymentAmount.value) != Number(priceList.value.total)) {
      paidAmount.value?.focus();
      showNotification("error", "Choose a customer or pay in full.");
      return 0;
    }
  }
  if (supplierInfo.value?.id && !paymentAmount.value) {
    paidAmount.value?.focus();
    showNotification("error", "Please insert the Amount");
    return 0;
  }
  const currDate = moment().format("YYYY-MM-DD");
  const returnData = {
    sale_return_date: currDate,
    note: notes.value,
    sale_return_products: sellingProducts.value,
    customer_id: supplierInfo.value?.id,
    sub_total: priceList.value.subtotal,
    total: priceList.value.total,
    amount_due: priceList.value.due,
    paid_amount: paymentAmount.value,
    comment_on_receipt: comment_on_receipt.value,
    item_tiers: "none",
    payment_method_id: payment_method_id.value,
    branch_id: branch_id.value,
    discount_entire_sale: priceList.value.discountEntire,
    discount_all_item_by_percent: priceList.value.discountPerItem,
    discount_reason: priceList.value.reason,
  };

  const res = await returnSale(returnData);
  nextTick(() => {
    if (res) {
      reset();
      // router.push({ name: "return-sales-list" });
    }
  });
};

onMounted(async () => {
  await getPayment();

  allSupplierList.value = await getCustomer("");
  supplierList.value = allSupplierList.value;

  branchList.value = await getBranch();
  branch_id.value = userInfo.value?.branch_id;
});

// Cancel Modal
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
        <h1 class="title">Sale Return</h1>
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
                  supplierInput.focus();
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
                          ><strong>Price:</strong> {{ data?.product_prices?.selling_price }}</span
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
            @click="handleSale($router)"
          >
            <i class="bi bi-cart mr-2"></i> <span>Return</span>
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="purchase-table">
            <thead class="table-header">
              <tr>
                <th colspan="6">
                  <span class="font-bold tracking-widest text-xl text-red-600">Discount</span>
                </th>
                <th colspan="3" class="text-right">
                  <span class="text-xl font-bold text-red-600 pr-3"
                    >{{ priceList.discountEntire || 0 }} BDT</span
                  >
                </th>
              </tr>
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
                <th class="text-right">Price</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Qty.</th>
                <th class="text-right">Disc %</th>
                <th class="text-right">Disc (Amount)</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="!sellingProducts?.length">
                <td colspan="9" class="text-center text-red-700">No Product Found</td>
              </tr>
              <tr v-for="(product, index) in sellingProducts" :key="index">
                <td class="text-center">
                  <!-- <button
                    type="button"
                    class="w-full"
                    @click="sellingProducts.splice(index, 1)"
                  >
                    <i class="bi bi-x-lg text-red-500"></i>
                  </button> -->
                  <button
                    @click="
                      sellingProducts.splice(index, 1);
                      calculatePaymentAmount();
                    "
                  >
                    <i class="bi bi-x-lg text-red-500"></i>
                  </button>
                  <!-- <a-popconfirm title="Are you sure delete?" ok-text="Yes" cancel-text="No"
                    @confirm="sellingProducts.splice(index, 1); calculatePaymentAmount();">
                    <a href="#"><i class="bi bi-x-lg text-red-500"></i></a>
                  </a-popconfirm> -->
                </td>
                <td class="text-center">{{ index + 1 }}</td>
                <td class="w-full">
                  <p>{{ product?.product_name }}</p>
                  <div class="mt-5" v-if="showDetails">
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
                      {{ product?.stock_batches || "Empty" }}
                    </p>
                    <p>
                      <span class="font-semibold">Item Id:</span>
                      {{ product?.product_id || "Empty" }}
                    </p>
                  </div>
                </td>
                <td class="text-right">
                  {{ Number(product?.price)?.toFixed(2) }}
                </td>
                <td class="text-right">{{ product?.stock_batches }}</td>
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
                    @input="updateQuantity(product, Number(product?.quantity))"
                    @keydown="
                      (event) => {
                        if (event.key == '.' || event.key == '-' || event.key == 'e') {
                          event.preventDefault();
                        }
                      }
                    "
                  />
                </td>
                <td class="text-right w-20">
                  {{ priceList?.discountPerItem }}
                </td>
                <td class="text-right">
                  {{
                    Number(
                      calculateDiscount(product?.price, priceList?.discountPerItem) *
                        product?.quantity
                    ).toFixed(2)
                  }}
                </td>
                <td class="text-right">
                  {{ Number(product?.total)?.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="right-side">
        <div>
          <!-- Branch -->
          <div class="mb-3">
            <p v-if="isBranch" class="text-red-600 mb-2">Getting Branch...</p>
            <select class="common-select" v-model="branch_id" disabled v-else>
              <option value="">Branch name</option>
              <template v-for="item in branchList">
                <option :value="item?.id">
                  {{ item?.organization_name }} - {{ item?.branch }}
                </option>
              </template>
            </select>
          </div>
          <!-- Customer -->
          <div class="flex mb-3">
            <span class="border border-slate-300 px-5 py-2 shadow-inner">
              <i class="bi bi-plus-lg"></i>
            </span>
            <div class="grow">
              <a-dropdown v-model:open="visibleCustomer">
                <input
                  type="text"
                  placeholder="Enter customer name"
                  class="searchInput"
                  ref="supplierInput"
                  @input="handleSupplierSearch($event?.target?.value)"
                  @keydown.down="suppliers?.at(0)?.focus()"
                  @focus="visibleCustomer = true"
                />
                <template #overlay>
                  <a-menu class="max-h-80 overflow-y-auto">
                    <a-menu-item v-if="isCustomer">
                      <h6 class="font-bold text-red-600">Loading...</h6>
                    </a-menu-item>
                    <a-menu-item v-if="!isCustomer && (!supplierList || !supplierList?.length)">
                      <h6 class="font-bold text-red-600">No customer Found...</h6>
                    </a-menu-item>
                    <!-- a-menu-item -->
                    <a-menu-item v-for="(supplier, index) in supplierList" :key="index">
                      <button
                        type="button"
                        class="flex items-center w-full text-left"
                        ref="suppliers"
                        @click="getSupplierInfo(supplier)"
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
                            {{ supplier?.first_name }} -
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
              <div class="mb-3">
                <div class="flex">
                  <div class="mr-3">
                    <a-avatar :size="36" :src="supplierInfo?.image" class="border border-slate-400">
                    </a-avatar>
                  </div>
                  <div>
                    <h6 class="font-bold">{{ supplierInfo?.name }}</h6>
                    <p class="text-[#43B000]">({{ supplierInfo?.company }})</p>
                  </div>
                </div>
              </div>
            </div>

            <ul class="flex justify-end items-center space-x-4 list-none p-0 w-full">
              <li class="mb-3 w-1/2">
                <button type="button" class="w-full text-right" @click="supplierInfo = null">
                  <i class="bi bi-x mr-3 text-red-600"></i>Detach
                </button>
              </li>
            </ul>
          </div>
        </div>
        <!-- Price List -->
        <div class="border border-slate-300 p-2 px-3 mb-3">
          <div class="lg:grid grid-cols-2 gap-2 gap-y-3">
            <div class="mb-0">
              <p class="mb-2">Discount all Items by Percent</p>
              <input
                type="number"
                class="searchInput text-right"
                :class="{ shake: isValidDiscount }"
                ref="discountPerItem"
                @focus="discountPerItem.select()"
                v-model="priceList.discountPerItem"
                @keypress.enter="discountAll.focus()"
                @input="calculatePaymentAmount()"
              />
              <p class="text-red-600" v-if="isValidDiscount">Discount can't exceed 12%</p>
            </div>
            <div class="mb-0">
              <p class="mb-2">Discount Entire Sale (BDT)</p>
              <input
                type="number"
                class="searchInput text-right"
                :class="{ shake: isValidEntireDiscount }"
                ref="discountAll"
                @focus="discountAll.select()"
                v-model="priceList.discountEntire"
                @input="
                  checkEntireDiscount($event?.target?.value);
                  calculatePaymentAmount();
                "
                @keypress.enter="discountReason.focus()"
              />
              <p class="text-right text-red-600" v-if="isValidEntireDiscount">
                Discount can't exceed 9 TK
              </p>
            </div>
            <div class="mb-0">
              <p class="mb-2">Discount Reason</p>
              <input
                type="text"
                class="searchInput"
                placeholder="Enter Reason"
                ref="discountReason"
                @focus="discountReason.select()"
                v-model="priceList.reson"
                @keypress.enter="paidAmount.focus()"
              />
            </div>
            <div class="mb-0">
              <p class="mb-2">Sub Total:</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="priceList.subtotal"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="xl:text-xl lg:text-lg font-bold">Total:</p>
              <input
                type="number"
                class="searchInput text-right font-bold xl:text-xl lg:text-lg text-green-600"
                v-model="priceList.total"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="xl:text-xl lg:text-lg text-red-700 font-bold">Amount Due:</p>
              <input
                type="number"
                class="searchInput text-right font-bold xl:text-xl lg:text-lg text-red-700"
                v-model="priceList.due"
                readonly
              />
            </div>
          </div>
        </div>
        <!-- Payment Gateway -->
        <div class="">
          <div class="mb-2" v-if="permissions.includes('sale-payment')">
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
            :class="{ shake: isValidPayAmount }"
            placeholder="Enter Amount . . ."
            ref="paidAmount"
            v-model="paymentAmount"
            @focus="paidAmount?.select()"
            @keypress.enter="saleButton.focus()"
            @input="paymentAmount < 0 && (paymentAmount = 0)"
            @keydown="
              (event) => {
                if (event.key == '-' || event.key == 'e') {
                  event.preventDefault();
                }
              }
            "
            v-if="permissions.includes('sale-final-amount')"
          />
          <textarea
            rows="3"
            class="block w-full border mt-3 px-3 py-2 rounded-md mb-3"
            placeholder="Notes . . ."
            v-model="notes"
            ref="noteInput"
            @keypress.enter="saleButton.focus()"
          ></textarea>
          <label for="comment_on_receipt" class="text-sm"
            ><input
              type="checkbox"
              class="mr-3"
              id="comment_on_receipt"
              v-model="comment_on_receipt"
            />Comment on receipt</label
          >
        </div>
        <button class="submit-btn" type="button" @click="handleSale($router)" ref="saleButton">
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
