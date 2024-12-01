<script setup>
import MainLayout from "@/components/MainLayout.vue";
import moment from "moment";
import { useDataStore } from "@/stores/data";
import { PictureOutlined } from "@ant-design/icons-vue";
import { storeToRefs } from "pinia";
import { nextTick, ref, onMounted, watchEffect } from "vue";
import { apiBase, imgBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import { usePsalesStore } from "@/stores/psales";

const permissions = JSON.parse(localStorage.getItem("permissions"));

const dataStore = useDataStore();
const psalesStore = usePsalesStore();
const { userInfo } = storeToRefs(dataStore);

const { sellingProducts, isSearching, isCustomer, isPayment, isBranch, paymentList, priceList } =
  storeToRefs(psalesStore);

const { getCustomer, getPayment, getBranch, getSaleProduct, getGenericProducts, saleInsert } =
  psalesStore;

// Product Search
const visibleProductSearch = ref(false);
const item_tiers = ref("none");
const searchInput = ref(null);
const searchList = ref("");
const searchProduct = ref(null);
const productQuantity = ref(null);
const isValidDiscount = ref(false);
const isValidEntireDiscount = ref(false);
const isValidPayAmount = ref(false);

// Generic Products
const genericModal = ref(false);
const genericProducts = ref([]);
const genericButtons = ref(null);

const onItemTierSelect = () => {
  if (item_tiers.value == "wholesale") {
    sellingProducts.value?.map((product) => {
      priceList.value.discountPerItem = "";
      priceList.discountEntire = "";

      if (product?.product_prices?.wholesale_type == "percent_off") {
        product.discount_percent =
          product?.product_prices?.wholesale > 0 ? Number(product?.product_prices?.wholesale) : 12;
      } else if (product?.product_prices?.wholesale_type == "fixed_price") {
        product.discount_percent =
          product?.product_prices?.wholesale > 0
            ? Number(
                (Number(product?.product_prices?.wholesale) /
                  Number(product?.product_prices?.selling_price)) *
                  100
              ).toFixed(2)
            : 12;
      } else {
        product.discount_percent = 12;
      }
      product.total = calculateTotalPrice(
        Number(product?.product_prices?.selling_price),
        Number(product?.quantity),
        Number(product.discount_percent)
      );

      updateQuantity(product, product.quantity, product.discount_percent);
    });
  } else {
    sellingProducts.value?.map((product) => {
      priceList.value.discountPerItem = "";
      priceList.discountEntire = "";
      product.discount_percent = Number(priceList.value.discountPerItem);
      product.total = calculateTotalPrice(
        Number(product?.product_prices?.selling_price),
        Number(product?.quantity),
        Number(priceList.value.discountPerItem)
      );
    });
  }
  calculatePaymentAmount();
};
// Product Search Events
const handleProductSearch = async (query) => {
  searchProduct.value = await getSaleProduct(query, branch_id.value);
};

const storeProducts = async (product) => {
  genericModal.value = false;
  let quantity = 1;
  const existingProductIndex = sellingProducts.value?.findIndex((item) => item?.id == product?.id);
  if (existingProductIndex != -1) {
    if (
      sellingProducts.value[existingProductIndex].quantity ==
      sellingProducts.value[existingProductIndex].stock_batches
    ) {
      showNotification("warning", "Sorry ! Stock Out");
      return 0;
    }
    quantity++;
    sellingProducts.value[existingProductIndex].quantity++;
    sellingProducts.value[existingProductIndex].total = calculateTotalPrice(
      Number(product?.product_prices?.selling_price),
      Number(quantity),
      0
    );
    nextTick(() => productQuantity.value[existingProductIndex]?.focus());
  } else {
    // Generic Products
    const checkStock = calculateStock(product?.stock_batches);
    if (checkStock <= 0) {
      const genericId = product?.generic_id;
      genericProducts.value = await getGenericProducts(genericId, branch_id.value);

      if (!genericProducts.value?.length) {
        showNotification("warning", "Sorry ! Sold out");
        searchInput.value?.focus();
        return 0;
      }
      visibleProductSearch.value = false;
      genericModal.value = true;

      nextTick(() => genericButtons.value?.at(0)?.focus());
      return 0;
    }
    sellingProducts.value.push({
      ...product,
      quantity: quantity,
      discount_percent: "",
      total: calculateTotalPrice(
        Number(product?.product_prices?.selling_price),
        Number(quantity),
        0
      ),
      stock_batches: calculateStock(product?.stock_batches),
      cost_prices: calculateCostPrice(product?.stock_batches),
    });
    nextTick(() => productQuantity.value?.at(-1)?.focus());
  }
  calculatePaymentAmount();
};

const calculateTotalPrice = (price, quantity, discount) => {
  const costPrice = price * quantity;
  const dis = (costPrice * discount) / 100;
  return costPrice - dis;
};

const calculateDiscount = (price, quantity, discount) => {
  const dis = (price * quantity * discount) / 100;
  return Number(dis).toFixed(2);
};
const calculateStock = (stockes) => {
  const total = stockes.reduce((sum, batch) => {
    const balanced_quantity = parseFloat(batch.balanced_quantity);
    return sum + (isNaN(balanced_quantity) ? 0 : balanced_quantity);
  }, 0);
  return Number(total).toFixed(2);
};
const calculateCostPrice = (stockes) => {
  const total_balanced_quantity = calculateStock(stockes);
  if (isNaN(total_balanced_quantity) || total_balanced_quantity == 0) {
    return Number("0.00").toFixed(2);
  }
  const total_cost_price = stockes.reduce((sum, batch) => {
    const cost = parseFloat(batch.cost);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return Number(Number(total_cost_price) / Number(total_balanced_quantity)).toFixed(2);
};

// Update Quantity
const updateQuantity = (product, quantity, discount = 0) => {
  // console.log(product.cost_prices);
  let isValidDiscount = true;
  if (quantity < 0) product.quantity = 0;
  if (quantity > product?.stock_batches) {
    showNotification("warning", "Sorry ! Stock limit exceeded");
    product.quantity = product?.stock_batches;
  }
  if (discount > 100) product.discount_percent = 100;
  // if (discount) priceList.value.discountPerItem = "";

  const total = calculateTotalPrice(
    Number(product?.product_prices?.selling_price),
    Number(product?.quantity),
    Number(product.discount_percent)
  );

  if (total < product.cost_prices * product.quantity) {
    showNotification("error", "Enter Valid Discount");
    isValidDiscount = false;
    product.discount_percent = 0;
    product.total = Number(
      Number(product?.product_prices?.selling_price) * Number(product?.quantity)
    ).toFixed(2);
  } else {
    product.total = total;
  }

  calculatePaymentAmount();
  return isValidDiscount;
};
const updateDiscount = () => {
  if (!sellingProducts.value?.length) priceList.value.discountPerItem = 0;
  if (priceList.value.discountPerItem < 0) priceList.value.discountPerItem = 0;
  if (sellingProducts.value?.length && priceList.value.discountPerItem >= 0) {
    if (priceList.value.discountPerItem > 12) {
      priceList.value.discountPerItem = 12;
      isValidDiscount.value = true;
    } else {
      isValidDiscount.value = false;
    }
    sellingProducts.value?.map((product) => {
      product.discount_percent = priceList.value.discountPerItem;
      let isVDiscount = updateQuantity(product, product.quantity, priceList.value.discountPerItem);
      if (!isVDiscount) {
        priceList.value.discountPerItem = 0;
      }
      // product.total = calculateTotalPrice(
      //   Number(product?.product_prices?.selling_price),
      //   Number(product?.quantity),
      //   Number(priceList.value.discountPerItem)
      // );
    });
  }
};
// Supplier/Customer
const visibleCustomer = ref(false);
const suppliers = ref("");
const supplierInput = ref(null);
const supplierInfo = ref({
  name: "",
  id: "",
});
const supplierList = ref([]);

const getSupplierInfo = (supplier) => {
  supplierInfo.value = {
    name: `${supplier?.contact} - ${supplier?.first_name}`,
    id: supplier?.id,
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

const checkEntireDiscount = async () => {
  await nextTick();
  if (!sellingProducts.value?.length) priceList.value.discountEntire = 0;
  if (priceList.value.discountEntire < 0) priceList.value.discountEntire = 0;
  let cost_price = 0;
  let total_price = 0;
  sellingProducts.value.map((product) => {
    cost_price += Number(product?.cost_prices || 0);
    total_price += Number(product.total || 0);
  });
  total_price -= priceList.value.discountEntire;
  if (total_price < cost_price) {
    priceList.value.discountEntire = 0;
  }
  if (priceList.value.discountEntire > 9) {
    isValidEntireDiscount.value = true;
    priceList.value.discountEntire = 9;
  } else {
    isValidEntireDiscount.value = false;
  }
};
const reset = () => {
  notes.value = "";
  sellingProducts.value = [];
  supplierInfo.value = {
    name: "",
    id: "",
  };
  priceList.value = {
    discountPerItem: "",
    discountEntire: "",
    reson: "",
    subtotal: "",
    total: "",
    due: "",
  };
  paymentAmount.value = "";
  comment_on_receipt.value = false;
  payment_method_id.value = 2;
  branch_id.value = userInfo.value?.branch_id;
};

watchEffect(() => {
  if (sellingProducts.value?.length > 0) {
    const subtotal = sellingProducts.value?.reduce((sum, item) => sum + Number(item?.total), 0);
    priceList.value.subtotal = Number(subtotal)?.toFixed(2);
    priceList.value.total = Math.round(subtotal)?.toFixed(2);
    if (priceList.value.discountEntire) {
      priceList.value.total = Math.round(
        priceList.value.subtotal - Number(priceList.value.discountEntire)
      ).toFixed(2);
    }
    paymentAmount.value = paymentAmount.value || priceList.value.total;
    if (paymentAmount.value >= 0) {
      if (paymentAmount.value > priceList.value.total) {
        paymentAmount.value = Number(priceList.value.total).toFixed(2);
        isValidPayAmount.value = true;
      }
      priceList.value.due = Math.round(priceList.value.total - paymentAmount.value).toFixed(2);
    }
  } else
    priceList.value = {
      discountPerItem: "",
      discountEntire: "",
      reson: "",
      subtotal: "",
      total: "",
      due: "",
    };
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
  // if (!supplierInfo.value?.name) {
  //   supplierInput.value?.focus();
  //   showNotification("error", "Enter a customer");
  //   return 0;
  // }
  if (!supplierInfo.value?.id && priceList.value.due != 0) {
    paidAmount.value?.focus();
    isValidPayAmount.value = true;
    showNotification("error", "Enter full amount");
    return 0;
  }

  const currDate = moment().format("YYYY-MM-DD");
  const products = sellingProducts.value?.map((item) => ({
    product_id: item?.id,
    product_name: item?.name,
    quantity: Number(item?.quantity),
    price: Number(item?.product_prices?.selling_price),
    discount_percent: Number(item?.discount_percent).toFixed(2),
    total: Number(item?.total).toFixed(2),
  }));
  const data = {
    sale_date: currDate,
    note: notes.value,
    sale_products: products,
    customer_id: supplierInfo.value?.id,
    sub_total: priceList.value.subtotal,
    total: priceList.value.total,
    amount_due: priceList.value.due,
    paid_amount: paymentAmount.value,
    comment_on_receipt: comment_on_receipt.value,
    item_tiers: item_tiers.value,
    payment_method_id: payment_method_id.value,
    branch_id: branch_id.value,
    discount_entire_sale: priceList.value.discountEntire,
    discount_all_item_by_percent: priceList.value.discountPerItem,
    discount_reason: priceList.value.reason,
    customer_name: supplierInfo.value?.name,
  };

  const res = await saleInsert(data);
  nextTick(() => {
    if (res) reset();
  });
};

onMounted(async () => {
  await getPayment();
  branchList.value = await getBranch();
  branch_id.value = userInfo.value?.branch_id;
  handleProductSearch("");
  supplierList.value = await getCustomer("");
});
const isAddCustomer = ref(false);
const customerForm = ref({
  first_name: "",
  last_name: "",
  address_1: "",
  contact: "",
  email: "",
  image_path: null,
  address_2: "",
  city: "",
  state_or_province: "",
  zip: "",
  country: "",
  comments: "",
  internal_notes: "",
  store_account_balance: "",
  credit_limit: "",
  company_name: "",
  account_no: "",
  override_default_tax_for_sale: 1,
  tax_group: "",
  cumulative: "",
  taxable: "",
  non_tax_certificate_number: "",
  tier_type: "",
  mrr: "",
  mrr_id: "",
  files: [],
  taxes: "",
});
import Cookies from "js-cookie";
import axios from "axios";

const token = Cookies.get("token");
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
const createCustomer = async () => {
  if (!customerForm.value.first_name && !customerForm.value.contact) {
    isAddCustomer.value = false;
    return 0;
  }
  isAddCustomer.value = false;
  try {
    const res = await axios.post(`${apiBase}/customers`, customerForm.value, config);
    showNotification("success", res?.data?.message);
    if (res?.status == 201) {
      supplierInfo.value.name = `${res?.data?.customer?.contact || ""} - ${
        res?.data?.customer?.first_name || ""
      }`;
      supplierInfo.value.id = res?.data?.customer?.id;
    }
  } catch (err) {
    console.log(err);
    showNotification("error", err?.response?.data?.message);
  }
};
const customerSearch = async (value) => {
  supplierList.value = await getCustomer(value);
};
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

const searchData = ref();
const showDetails = ref(false);

function highlightText(text) {
  if (!searchData.value) return text;
  const regex = new RegExp(`(${searchData.value})`, "gi");
  return text.replace(regex, `<span class="highlight">$1</span>`);
}
</script>

<template>
  <MainLayout>
    <div class="lg:grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <h1 class="title">New Sale</h1>
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
              v-model="searchData"
              @input="handleProductSearch($event?.target?.value)"
              @keyup.down="searchList?.at(0)?.focus()"
              @keyup.right="
                () => {
                  visibleProductSearch = false;
                  discountPerItem.focus();
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
                    @click="
                      storeProducts(data);
                      priceList.discountPerItem = '';
                      priceList.discountEntire = '';
                    "
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
                      <!-- <h6 class="font-bold">
                        {{ data?.name }}
                      </h6> -->
                      <h6 class="font-bold" v-html="highlightText(data?.name)"></h6>
                      <p class="text-gray-500">
                        <span class="mr-2"
                          ><strong>Category:</strong
                          ><span v-html="highlightText(data?.category?.name || '')"></span>;</span
                        >
                        <span class="mr-2"
                          ><strong>Available Stock:</strong>
                          {{ calculateStock(data?.stock_batches) }};</span
                        >
                        <span class="mr-2"
                          ><strong>Cost Price:</strong>
                          {{ calculateCostPrice(data?.stock_batches) }};</span
                        >
                        <span class="mr-2"
                          ><strong>Price:</strong> {{ data?.product_prices?.selling_price }}</span
                        >
                        <span class="mr-2"
                          ><strong>Supplier:</strong>
                          <span v-html="highlightText(data?.supplier?.company_name || '')"></span
                        ></span>
                      </p>
                    </div>
                  </button>
                </a-menu-item>
                <!--/ a-menu-item -->
              </a-menu>
            </template>
          </a-dropdown>
          <button
            class="bg-[#000180] px-5 py-1 text-white min-w-fit hidden"
            type="button"
            @click="handleSale($router)"
          >
            <i class="bi bi-cart mr-2"></i> <span>Sale</span>
          </button>
        </div>
        <!-- Table -->
        <div class="overflow-x-auto mb-3">
          <table class="purchase-table">
            <thead class="table-header">
              <tr>
                <th colspan="9">
                  <span class="font-bold tracking-widest text-xl text-red-600">Discount</span>
                </th>
                <th class="text-right">
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
                <th class="text-right">Cost</th>
                <th class="text-right">Qty.</th>
                <th class="text-right">Disc %</th>
                <th class="text-right">Disc (Amount)</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-if="!sellingProducts?.length">
                <td colspan="10" class="text-center text-red-700">No Product Found</td>
              </tr>
              <tr v-for="(product, index) in sellingProducts" :key="index">
                <td class="text-center">
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
                <td class="lg:hidden">
                  <button type="button" @click="showDetails = !showDetails">
                    <span v-if="showDetails">-</span>
                    <span v-else>+</span>
                  </button>
                </td>
                <td class="text-center">
                  <span class="font-semibold mr-2 lg:hidden">SL:</span>{{ index + 1 }}
                </td>
                <td class="w-full">
                  <p>
                    <span class="font-semibold mr-2 lg:hidden">Item Name:</span>{{ product?.name }}
                  </p>
                  <div class="mt-3" v-if="showDetails">
                    <p>
                      <span class="font-semibold">Generic Name:</span>
                      {{ product?.generic?.name || "Empty" }}
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
                  <span class="font-semibold mr-2 lg:hidden">Price:</span>
                  {{ Number(product?.product_prices?.selling_price)?.toFixed(2) }}
                </td>
                <td class="text-right">
                  <span class="font-semibold mr-2 lg:hidden">Stock:</span
                  >{{ product?.stock_batches || "Empty" }}
                </td>
                <td class="text-right">
                  <span class="font-semibold mr-2 lg:hidden">Cost:</span>
                  {{
                    Number(
                      Number(product?.cost_prices != 0 ? product?.cost_prices : 0) *
                        Number(product.quantity || 1)
                    ).toFixed(2)
                  }}
                </td>
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
                    placeholder="Qty"
                    @focus="
                      () => {
                        visibleProductSearch = false;
                        productQuantity[index].select();
                      }
                    "
                    @keydown="
                      (event) => {
                        if (event.key == '.' || event.key == '-' || event.key == 'e') {
                          event.preventDefault();
                        }
                      }
                    "
                    @input="
                      updateQuantity(
                        product,
                        Number(product?.quantity),
                        Number(product?.discount_percent)
                      )
                    "
                  />
                </td>
                <td class="text-right min-w-24">
                  <!-- @keypress.enter="() => {
                    searchInput.focus();
                    visibleProductSearch = true;
                  }
                    " -->
                  <input
                    type="number"
                    v-model="product.discount_percent"
                    class="quantity focus:w-20"
                    placeholder="Discount"
                    @keydown="
                      (event) => {
                        if (event.key == '-' || event.key == 'e') {
                          event.preventDefault();
                        }
                      }
                    "
                    min="0"
                    @input="
                      updateQuantity(
                        product,
                        Number(product?.quantity),
                        Number(product?.discount_percent)
                      );
                      priceList.discountPerItem = '';
                      priceList.discountEntire = '';
                    "
                    @focus="$event.target.select()"
                  />
                </td>
                <td class="text-right">
                  <span class="font-semibold mr-2 lg:hidden">Disc:</span>
                  {{
                    calculateDiscount(
                      Number(product?.product_prices?.selling_price),
                      Number(product?.quantity),
                      Number(product?.discount_percent)
                    )
                  }}
                </td>
                <td class="text-right">
                  <span class="font-semibold mr-2 lg:hidden">Total:</span
                  >{{ Number(product?.total)?.toFixed(2) }}
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
          <a-modal v-model:open="isAddCustomer" title="Create New Customer">
            <form @submit.prevent="createCustomer()">
              <div class="mb-3">
                <label for="">Name</label>
                <input
                  v-model="customerForm.first_name"
                  type="text"
                  class="w-full border px-3 py-1 rounded-md"
                />
              </div>
              <div class="mb-3">
                <label for="">Mobile</label>
                <input
                  v-model="customerForm.contact"
                  type="tel"
                  class="w-full border px-3 py-1 rounded-md"
                />
              </div>
            </form>
            <template #footer>
              <button
                @click="isAddCustomer = false"
                class="bg-red-600 px-5 py-2 text-white rounded-md mr-3"
              >
                Cancel
              </button>
              <button
                @click="createCustomer()"
                class="bg-[#000180] px-5 py-2 text-white rounded-md"
              >
                Create
              </button>
            </template>
          </a-modal>
          <div class="flex mb-3">
            <span
              class="border border-slate-300 px-3 shadow-inner pt-1"
              @click="isAddCustomer = true"
            >
              <i class="bi bi-plus-lg"></i>
            </span>
            <div class="grow">
              <a-dropdown v-model:open="visibleCustomer">
                <input
                  type="text"
                  placeholder="Enter customer name"
                  class="searchInput"
                  ref="supplierInput"
                  v-model="supplierInfo.name"
                  @input="customerSearch($event?.target?.value)"
                  @keydown.down="suppliers?.at(0)?.focus()"
                  @focus="visibleCustomer = true"
                />
                <template #overlay>
                  <a-menu class="max-h-80 overflow-y-auto">
                    <a-menu-item v-if="isCustomer">
                      <h6 class="font-bold text-red-600">Loading...</h6>
                    </a-menu-item>
                    <a-menu-item v-if="!isCustomer && !supplierList?.length">
                      <h6 class="font-bold text-red-600">
                        No customer Found...
                        <button
                          type="button"
                          @click="isAddCustomer = true"
                          class="px-3 py-1 rounded-full border ml-3 bg-red-600 text-white"
                        >
                          Add New
                        </button>
                      </h6>
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
                            {{ `${supplier?.contact} - ${supplier?.first_name}` }}
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
        </div>
        <div class="border border-slate-300 p-2 px-3 mb-3">
          <div>
            <label for="item_tiers" class="block text-sm font-medium text-gray-700"
              >Item Tiers</label
            >
            <select
              id="item_tiers"
              v-model="item_tiers"
              @change="onItemTierSelect"
              class="searchInput"
            >
              <option value="none">None</option>
              <option value="wholesale">Wholesale</option>
              <option value="retail">Retail</option>
              <option value="institute">Institute</option>
            </select>
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
                @keydown="
                  (event) => {
                    if (event.key == '-' || event.key == 'e') {
                      event.preventDefault();
                    }
                  }
                "
                @input="
                  updateDiscount();
                  calculatePaymentAmount();
                "
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
                  checkEntireDiscount();
                  calculatePaymentAmount();
                "
                @keypress.enter="discountReason.focus()"
                @keydown="
                  (event) => {
                    if (event.key == '-' || event.key == 'e') {
                      event.preventDefault();
                    }
                  }
                "
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
          <i class="bi bi-cart mr-2"></i> <span>Sale</span>
        </button>
      </div>
    </div>
    <!-- Generic Products -->
    <a-modal v-model:open="genericModal" title="Select Products" :footer="null">
      <table class="table text-sm w-full purchase-table">
        <thead class="table-header">
          <tr>
            <th class="text-left">Item Name</th>
            <th class="text-right">Stock</th>
            <th class="text-right">Cost Prices</th>
            <th class="text-right">Price</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="(product, index) in genericProducts" :key="index">
            <td>
              <button
                type="button"
                class="w-full text-left focus:bg-yellow-400"
                ref="genericButtons"
                @keyup.down="genericButtons?.at(index + 1)?.focus()"
                @keyup.up="genericButtons?.at(index - 1)?.focus()"
                @click="storeProducts(product)"
              >
                {{ product?.name }}
              </button>
            </td>
            <td class="text-right">
              {{ calculateStock(product?.stock_batches) }}
            </td>
            <td class="text-right">
              {{ calculateCostPrice(product?.stock_batches) }}
            </td>
            <td class="text-right">
              {{ Number(product?.product_prices?.selling_price).toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </a-modal>
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
<style>
.highlight {
  background-color: yellow;
  color: black;
}
</style>
