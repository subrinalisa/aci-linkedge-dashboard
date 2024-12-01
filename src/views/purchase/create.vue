<script setup>
import MainLayout from "@/components/MainLayout.vue";
import moment from "moment";
import { usePsalesStore } from "@/stores/psales.js";
import { useDataStore } from "@/stores/data.js";
import { PictureOutlined, UserOutlined } from "@ant-design/icons-vue";
import { storeToRefs } from "pinia";
import { nextTick, ref, onMounted, computed } from "vue";
import { imgBase } from "@/config";
import { showNotification } from "@/utilities/notification";

const dataStore = useDataStore();
const { userInfo } = storeToRefs(dataStore);
const permissions = JSON.parse(localStorage.getItem("permissions"));

const psalesStore = usePsalesStore();
const { paymentList, productList, prices, isSearching, isPayment } = storeToRefs(psalesStore);
const { getPurchaseProduct, getSupplier, getBranch, getMRR, getPayment, purchaseInsert } =
  psalesStore;

/*-------- Variables ---------*/
const searchProduct = ref(null);
const visibleProductSearch = ref(false);
const allSupplier = ref(null);
const supplierList = ref(null);
const mrrList = ref([]);
const allMrrList = ref([]);
const supplierInfo = ref();
const visibleMrr = ref(false);
const discount_all = ref("");
const visibleSupplier = ref(false);
const mrrInfo = ref({
  name: null,
  id: null,
});
const branchList = ref(null);
const branch_id = ref("");
const payment_method_id = ref(2);
const getis_percent = ref("");
const amount = ref("");
const paid_amount = ref("");
const note = ref(null);
const isValidAmount = ref(false);
const discount_entire_purchase = ref("");
const discount_price = ref(0);
const showDetails = ref(false);
const invoice_no = ref("");

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
const discountInput = ref(null);

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
});
const mrrSearch = async (query) => {
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
const supplierSearch = async (value) => {
  allSupplier.value = await getSupplier(value);
  supplierList.value = allSupplier.value;
};
/*-------- Product Search ---------*/

const handleProductSearch = async (query) =>
  (searchProduct.value = await getPurchaseProduct(query, branch_id.value));

const calculateStock = (stockes) => {
  const total = stockes.reduce((sum, batch) => {
    return sum + parseFloat(batch.balanced_quantity);
  }, 0);
  return total;
};
const storeProducts = (product) => {
  let quantity = 1;
  const existingProductIndex = productList.value.findIndex((item) => item?.id == product?.id);
  if (existingProductIndex != -1) {
    quantity++;
    if (productList.value[existingProductIndex].quantity < 9999) {
      productList.value[existingProductIndex].quantity++;
      productList.value[existingProductIndex].total = calculateTotalPrice(
        Number(product?.product_prices?.trade_price) + Number(product?.product_prices?.vat),
        quantity
      );
    }
    nextTick(() => productQuantity.value[existingProductIndex]?.focus());
  } else {
    productList.value = [
      ...productList.value,
      {
        ...product,
        price: Number(product?.product_prices?.trade_price) + Number(product?.product_prices?.vat),
        cost: Number(product?.product_prices?.trade_price) + Number(product?.product_prices?.vat),
        quantity: quantity,
        discount: "",
        discount_amount: "",
        getis: "",
        getis_amount: "",
        total: calculateTotalPrice(
          Number(product?.product_prices?.trade_price) + Number(product?.product_prices?.vat),
          quantity
        ),
        stock: calculateStock(product?.stock_batches),
        expiry_date: "",
      },
    ];

    // nextTick(() => {
    productQuantity.value?.at(-1)?.focus();
    calculatePaidAmount();
    calculateGetisPercent();
    handleAllDiscount();

    // });
  }
  calculatePaidAmount();
  calculateGetisPercent();
  handleAllDiscount();
  finalCalculation();
  // calculateGetisAmount();
  // calculatePaidAmount();
};

const calculateTotalPrice = (price, quantity, product = "") => {
  const cost = Number(price);
  const qty = Number(quantity);
  const discount = product?.discount_amount ? Number(product?.discount_amount) : 0;
  const getis = product?.getis_amount ? Number(product?.getis_amount) : 0;
  return Number((cost - discount - getis) * qty).toFixed(2);
};
const updateQuantity = (product, quantity) => {
  if (quantity > 9999) {
    product.quantity = 9999;
  }
  if (quantity < 1) {
    product.quantity = 1;
    quantity = 1;
  }
  product.total = calculateTotalPrice(Number(product?.price), quantity, product);
};

const handleAllDiscount = () => {
  if (discount_all.value > 100) {
    discount_all.value = 100;
  }
  if (discount_all.value < 0) {
    discount_all.value = 0;
  }

  productList.value?.map((product) => {
    product.discount = discount_all.value;
    let isValidDiscount = updateDiscount(product, discount_all.value);
    if (!isValidDiscount) {
      discount_all.value = "";
    }
  });
};
const updateDiscount = (product, discount) => {
  let isValidDiscount = true;
  if (discount > 100) {
    product.discount = 100;
  }
  let discounts = Number(product.discount * product.price) / 100;
  // product.cost = product.cost - discounts;
  if (product.price - product.per_dis - discounts - (product.getis_amount || 0) < 0) {
    showNotification("error", "Entire valid amount");
    product.discount = 0;
    discounts = 0;
    isValidDiscount = false;
    // return 0;
  }

  product.cost = product.price - (product.per_dis || 0) - discounts - (product.getis_amount || 0);

  const total_discounts = Number(product.discount * product.price * product.quantity) / 100;
  product.total = product.price * product.quantity - total_discounts;
  product.discount_amount = Number(
    (product.price * product.discount * product.quantity) / 100
  ).toFixed(2);
  // product.total = calculateTotalPrice(
  //   Number(product.price),
  //   product.quantity,
  //   product
  // );
  // if (product.total < 0) {
  //   product.total = 0;
  // }
  return isValidDiscount;
};
const updateGetis = (product, getis) => {
  product.getis = getis;
  let isValidGetis = true;
  if (getis > 100) {
    product.getis = 100;
  }
  product.getis_amount = Number((product.price * product.getis) / 100).toFixed(2);

  let discounts = Number(product.discount * product.price) / 100;
  if (product.price - product.per_dis - discounts - (product.getis_amount || 0) < 0) {
    showNotification("error", "Entire valid amount");
    product.getis_amount = 0;
    product.getis = 0;
    isValidGetis = false;
    // return 0;
  }
  product.cost = product.price - (product.per_dis || 0) - discounts - (product.getis_amount || 0);
  return isValidGetis;
};

const calculateGetisPercent = async () => {
  await nextTick();

  if (getis_percent.value < 0) {
    getis_percent.value = 0;
  }
  if (getis_percent.value > 100) {
    getis_percent.value = 100;
  }

  productList.value?.map((product) => {
    let isValidGetis = updateGetis(product, getis_percent.value);
    if (!isValidGetis) {
      getis_percent.value = "";
      amount.value = "";
    }
  });

  const total_getis_amount = productList.value.reduce((sum, product) => {
    // Check if the cost is a valid number before adding
    const getis_amount = parseFloat(product.getis_amount);
    return sum + (isNaN(getis_amount) ? 0 : getis_amount);
  }, 0);
  amount.value = Number(total_getis_amount).toFixed(2);
};

const calculateGetisAmount = async () => {
  if (amount.value <= 0) {
    amount.value = 0;
  }

  const total_prices = productList.value.reduce((sum, product) => {
    // Check if the cost is a valid number before adding
    const price = parseFloat(product.price);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  getis_percent.value = ((amount.value / total_prices) * 100).toFixed(2);

  if (getis_percent.value > 100) {
    getis_percent.value = 100;
    amount.value = total_prices;
  }

  productList.value?.map((product) => {
    let isValidGetis = updateGetis(product, getis_percent.value);
    if (!isValidGetis) {
      getis_percent.value = "";
      amount.value = "";
    }
  });
};

const calculatePaidAmount = async () => {
  if (!productList.value?.length) {
    discount_entire_purchase.value = 0;
    return 0;
  }
  !discount_entire_purchase.value && (discount_price.value = 0);
  if (discount_entire_purchase.value && !discount_entire_purchase.value?.includes("%")) {
    discount_price.value = discount_entire_purchase.value;
  }
  const totalCost = productList.value.reduce((accumulator, item) => {
    return accumulator + item.price;
  }, 0);
  let check_valid_dis = true;
  productList.value.map((item) => {
    const perItemdis = (item.price * discount_price.value) / totalCost;
    let discounts = Number(item.discount * item.price) / 100;

    if (item.price - discounts - perItemdis < 0) {
      check_valid_dis = false;
      discount_price.value = 0;
      discount_entire_purchase.value = "";
      showNotification("error", "আপনার ডিসকাউন্টের পরিমাণ পণ্যের খরচের চেয়ে বেশি");
      return 0;
    }
  });

  productList.value.map((item) => {
    const perItemdis = check_valid_dis
      ? (item.price * Number(discount_price.value)) / totalCost
      : 0;
    item.per_dis = perItemdis;
    let discounts = Number(item.discount * item.price) / 100;
    item.cost = item.price - discounts - item.per_dis;
  });
};

/*-------- Purchase Insert ---------*/
const reset = () => {
  productList.value = [];
  bonusBackupProduct.value = [];
  bonusProduct.value = [];
  supplierInfo.value = "";
  getis_percent.value = "";
  amount.value = "";
  mrrInfo.value = {
    name: "",
    id: "",
  };

  prices.value = {
    subtotal: "",
    tradePrice: "",
    vat: "",
    total: "",
    due: "",
  };
  paid_amount.value = "";
  payment_method_id.value = 2;
  note.value = "";
  branch_id.value = userInfo.value?.branch_id;
  discount_entire_purchase.value = "";
  discount_price.value = 0;
};
const file = ref(null);
const onFileChange = (event) => {
  file.value = event.target.files[0];
};

const dueCalculation = async () => {
  if (paid_amount.value < 0) {
    paid_amount.value = 0;
  }
  if (paid_amount.value > prices.value?.total) {
    paid_amount.value = prices.value?.total;
  }
  prices.value.due = prices.value.total - paid_amount.value;
};
const finalCalculation = async () => {
  await nextTick();

  if (productList.value?.length > 0) {
    let subtotal = 0;
    let tp = 0;
    let vat = 0;
    productList.value.map((product) => {
      const total = parseFloat(product.total);
      const trade_price = parseFloat(product?.product_prices?.trade_price);
      const quantity = parseFloat(product?.quantity);
      const per_vat = parseFloat(product?.product_prices?.vat);

      subtotal += isNaN(total) ? 0 : total;
      tp += (isNaN(trade_price) ? 0 : trade_price) * (isNaN(quantity) ? 0 : quantity);
      vat += (isNaN(per_vat) ? 0 : per_vat) * (isNaN(quantity) ? 0 : quantity);
    });
    let totalBonusSum = bonusBackupProduct.value?.reduce((sum, item) => sum + (item.total || 0), 0);
    prices.value = {
      subtotal: (Number(subtotal) + Number(totalBonusSum || 0)).toFixed(2),
      tradePrice: Number(tp).toFixed(2),
      vat: Number(vat).toFixed(2),
      total: Math.round(
        subtotal + Number(totalBonusSum || 0) - (discount_price.value || 0)
      )?.toFixed(2),
      due: 0,
    };
    paid_amount.value = prices.value.total;
  } else {
    // prices.value = {
    //   subtotal: "",
    //   tradePrice: "",
    //   vat: "",
    //   total: "",
    //   due: "",
    // };
    // paid_amount.value = "";
    reset();
  }
  // if (productList.value?.length > 0) {
  //
  //

  //
  //   if (discount_entire_purchase.value) {
  //     let discount = Number(discount_entire_purchase.value?.replace(/%/g, ""));
  //     if (discount_entire_purchase.value.includes("%")) {
  //       if (discount > 100) {
  //         discount_entire_purchase.value = "% 100";
  //         discount = 100;
  //       }
  //       discount_price.value = Number(
  //         (prices.value.subtotal * discount) / 100
  //       ).toFixed(2);
  //       prices.value.total = Math.round(
  //         prices.value.subtotal - (prices.value.subtotal * discount) / 100
  //       ).toFixed(2);
  //     } else {
  //       if (discount > prices.value.subtotal) {
  //         discount = prices.value.subtotal;
  //         discount_entire_purchase.value = prices.value.subtotal;
  //       }
  //       discount_price.value = Number(discount).toFixed(2);
  //       prices.value.total = Math.round(
  //         prices.value.subtotal - discount
  //       ).toFixed(2);
  //     }
  //   } else {
  //     discount_price.value = 0;
  //   }
  //   prices.value.total = Number(prices.value.total) - Number(amount.value);
  //   paid_amount.value = paid_amount.value || prices.value.total;
  //   if (paid_amount.value > prices.value.total || paid_amount.value < 0) {
  //     isValidAmount.value = true;
  //     paid_amount.value = Number(prices.value.total)?.toFixed(2);
  //   }
  //   prices.value.due = Math.round(prices.value.total - paid_amount.value);
  // } else
  //   prices.value = {
  //     subtotal: "",
  //     tradePrice: "",
  //     vat: "",
  //     total: "",
  //     due: "",
  //   };
};
const handlePurchase = async (router) => {
  if (!productList.value?.length) {
    searchInput.value?.focus();
    showNotification("error", "Please insert a product");
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
  const products = productList.value?.map((item) => ({
    product_id: item?.id,
    product_name: item?.name,
    pack_size_id: item?.pack_size?.id,
    tp: item?.product_prices?.trade_price,
    vat: item?.product_prices?.vat,
    cost: item?.cost,
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
    without_dis_total: item?.price,
    discount_percent: item?.discount,
    discount_amount: item?.discount_amount,
    getis_percent: item?.getis,
    getis_amount: item?.getis_amount,
  }));
  const bonus_products = bonusBackupProduct.value?.map((item) => ({
    product_id: item?.id,
    product_name: item?.name,
    pack_size_id: item?.pack_size?.id,
    tp: 0,
    vat: item?.product_prices?.vat,
    cost: item?.product_prices?.vat,
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
    getis_percent: getis_percent.value || 0,
    amount: amount.value || 0,
    mrr_id: mrrInfo.value.id,
    sub_total: prices.value.subtotal || 0,
    total_trade_price: prices.value.tradePrice || 0,
    total_vat: prices.value.vat || 0,
    total: prices.value.total || 0,
    amount_due: prices.value.due || 0,
    purchase_date: currDate,
    paid_amount: paid_amount.value || 0,
    purchase_products: products,
    bonus_products: bonus_products,
    payment_method_id: payment_method_id.value,
    note: note.value,
    branch_id: branch_id.value,
    discount_entire_purchase: Number(discount_price.value),
    discount_all_percent: Number(discount_all.value),
    invoice_no: invoice_no.value,
    file: file.value,
  };

  const res = await purchaseInsert(purchaseData);
  nextTick(() => {
    if (res) reset();
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
// Bonus
const isBonus = ref(false);
const bonusDetails = ref(false);
const bonusProduct = ref([]);
const bonusBackupProduct = ref([]);
const totalBonusSum = computed(() =>
  bonusBackupProduct.value?.reduce((sum, item) => sum + (item.total || 0), 0)
);
const storeBonus = (product) => {
  let quantity = 1;
  const existingProductIndex = bonusProduct.value.findIndex((item) => item?.id == product?.id);
  if (existingProductIndex != -1) {
    bonusProduct.value[existingProductIndex].quantity++;
    bonusProduct.value[existingProductIndex].total =
      (quantity + 1) * bonusProduct.value[existingProductIndex].cost;
  } else {
    bonusProduct.value = [
      ...bonusProduct.value,
      {
        ...product,
        price: Number(product?.product_prices?.vat).toFixed(2),
        cost: Number(product?.product_prices?.vat).toFixed(2),
        quantity: quantity,
        discount: "",
        discount_amount: "",
        getis: "",
        getis_amount: "",
        total: Number(product?.product_prices?.vat).toFixed(2) * quantity,
        stock: calculateStock(product?.stock_batches),
        expiry_date: "",
      },
    ];
  }
};
// highlightText
const searchData = ref();
const searchBonus = ref();

function highlightText(text) {
  if (!searchData.value) return text;
  const regex = new RegExp(`(${searchData.value})`, "gi");
  return text.replace(regex, `<span class="highlight">$1</span>`);
}
function highlightBonus(text) {
  if (!searchBonus.value) return text;
  const regex = new RegExp(`(${searchBonus.value})`, "gi");
  return text.replace(regex, `<span class="highlight">$1</span>`);
}
</script>

<template>
  <MainLayout>
    <div class="lg:grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <div class="md:flex justify-between items-center">
          <div class="grow whitespace-nowrap mb-2"><h1 class="title">New Purchase</h1></div>
          <input
            type="file"
            class="border bg-white mb-2"
            accept="image/*"
            @change="onFileChange($event)"
            v-if="permissions.includes('purchase-attachment')"
          />
        </div>
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
                        <PictureOutlined class="align-middle mb-1" />
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
                          ><strong>Price:</strong>
                          {{
                            Number(
                              Number(data?.product_prices?.trade_price) +
                                Number(data?.product_prices?.vat)
                            ).toFixed(2)
                          }}</span
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
            class="bg-[#000180] px-5 py-1 text-white min-w-fit hidden md:block"
            type="button"
            @click="handlePurchase($router)"
          >
            <i class="bi bi-cart mr-2"></i> <span>Purchase</span>
          </button>
          <button
            class="bg-indigo-600 px-5 py-1 ml-2 text-white min-w-fit hidden md:block"
            type="button"
            @click="isBonus = true"
          >
            <i class="bi bi-plus-circle mr-2"></i> <span>Bonus</span>
          </button>
        </div>
        <div class="h-[600px] overflow-y-auto">
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="purchase-table">
              <thead class="table-header">
                <tr>
                  <th colspan="10">
                    <span class="font-semibold text-red-600">Discount</span>
                  </th>
                  <th class="text-right">
                    <span class="font-semibold text-red-600">{{ discount_price }} BDT</span>
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
                  <th class="text-left">Pack Size</th>
                  <th class="text-right">TP</th>
                  <th class="text-right">VAT</th>
                  <th class="text-right">Cost</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Disc %</th>
                  <th class="text-right">Disc (Amount)</th>
                  <!-- <th class="text-right">Getis %</th> -->
                  <!-- <th class="text-right">Getis (Amount)</th> -->
                  <th class="text-right">Total</th>
                </tr>
              </thead>

              <tbody class="table-body">
                <tr v-if="!productList?.length">
                  <td colspan="13" class="text-center text-red-700">No Product Found</td>
                </tr>
                <tr v-for="(product, index) in productList" :key="index">
                  <td class="text-center">
                    <button
                      @click="
                        productList.splice(index, 1);
                        calculatePaidAmount();
                        finalCalculation();
                      "
                    >
                      <i class="bi bi-x-lg text-red-500"></i>
                    </button>
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
                      <span class="font-semibold mr-2 lg:hidden">Item Name:</span
                      >{{ product?.name }}
                    </p>
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
                        <label class="mb-1 block">Select Expire Date</label>
                        <input
                          type="date"
                          v-model="product.expiry_date"
                          class="px-3 py-1 border border-black rounded"
                        />
                      </p>
                    </div>
                  </td>
                  <td>
                    <span class="font-semibold mr-2 lg:hidden">Pack Size:</span
                    >{{ product?.pack_size?.name }} ({{
                      product?.pack_size?.name == "Pack" ? product?.pack_size?.quantity : 1
                    }})
                  </td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">TP:</span
                    >{{ Number(product?.product_prices?.trade_price).toFixed(2) }}
                  </td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">VAT:</span>
                    {{ Number(product?.product_prices?.vat).toFixed(2) }}
                  </td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">Cost:</span
                    >{{ Number(product?.cost).toFixed(2) }}
                  </td>
                  <td class="text-right min-w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      v-model="product.quantity"
                      class="quantity focus:w-20"
                      ref="productQuantity"
                      max="9999"
                      @focus="
                        () => {
                          visibleProductSearch = false;
                          productQuantity[index].select();
                        }
                      "
                      @keydown="
                        (event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                      "
                      @input="
                        updateQuantity(product, Number(product?.quantity));
                        finalCalculation();
                      "
                    />
                  </td>
                  <td class="text-right">
                    <input
                      type="number"
                      class="quantity focus:w-20"
                      v-model="product.discount"
                      placeholder="Disc"
                      @focus="(event) => event.target.select()"
                      @keydown="
                        (event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                      "
                      @input="
                        updateDiscount(product, Number(product?.discount));
                        discount_all = '';
                        finalCalculation();
                      "
                    />
                  </td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">Disc (Amount) :</span
                    >{{ product?.discount_amount }}
                  </td>
                  <!-- <td class="text-right">
                    <input
                      type="number"
                      class="quantity focus:w-20"
                      v-model="product.getis"
                      placeholder="Getis"
                      min="0"
                      @focus="(event) => event.target.select()"
                      @keydown="
                        (event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                      "
                      @input="
                        updateGetis(product, Number(product?.getis));
                        getis_percent = '';
                        amount = '';
                      "
                    />
                  </td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">Getis (Amount) :</span
                    >{{ product?.getis_amount }}
                  </td> -->
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">Total:</span
                    >{{ Number(product?.total).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Bonus -->
          <div class="overflow-x-auto mt-3" v-if="bonusBackupProduct?.length">
            <table class="purchase-table">
              <thead class="table-header">
                <tr>
                  <th colspan="9">
                    <span class="font-semibold text-indigo-600">Bonus Items</span>
                  </th>
                </tr>
                <tr>
                  <th>
                    <button
                      type="button"
                      class="outline-none w-full block"
                      @click="bonusDetails = !bonusDetails"
                    >
                      <span v-if="bonusDetails">-</span>
                      <span v-else>+</span>
                    </button>
                  </th>
                  <th class="text-center">SL</th>
                  <th class="text-left">Item Name</th>
                  <th class="text-left">Pack Size</th>
                  <th class="text-right">TP</th>
                  <th class="text-right">VAT</th>
                  <th class="text-right">Cost</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr v-if="!bonusBackupProduct?.length">
                  <td colspan="9" class="text-center text-red-700">No Product Found</td>
                </tr>
                <tr v-for="(product, index) in bonusBackupProduct" :key="index">
                  <td class="text-center">
                    <button
                      @click="
                        bonusBackupProduct.splice(index, 1);
                        finalCalculation();
                      "
                    >
                      <i class="bi bi-x-lg text-red-500"></i>
                    </button>
                  </td>
                  <td class="lg:hidden">
                    <button type="button" @click="bonusDetails = !bonusDetails">
                      <span v-if="bonusDetails">-</span>
                      <span v-else>+</span>
                    </button>
                  </td>
                  <td class="text-center">
                    <span class="font-semibold mr-2 lg:hidden">SL:</span>{{ index + 1 }}
                  </td>
                  <td class="w-full">
                    <p>
                      <span class="font-semibold mr-2 lg:hidden">Item Name:</span
                      >{{ product?.name }}
                    </p>
                    <div class="mt-3" v-if="bonusDetails">
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
                        <label class="mb-1 block">Select Expire Date</label>
                        <input
                          type="date"
                          v-model="product.expiry_date"
                          class="px-3 py-1 border border-black rounded"
                        />
                      </p>
                    </div>
                  </td>
                  <td>
                    <span class="font-semibold mr-2 lg:hidden">Pack Size:</span
                    >{{ product?.pack_size?.name }} ({{
                      product?.pack_size?.name == "Pack" ? product?.pack_size?.quantity : 1
                    }})
                  </td>
                  <td class="text-right"><span class="font-semibold mr-2 lg:hidden">TP:</span>0</td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">VAT:</span>
                    {{ Number(product?.product_prices?.vat).toFixed(2) }}
                  </td>
                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">Cost:</span
                    >{{ Number(product?.cost).toFixed(2) }}
                  </td>
                  <td class="text-right min-w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      v-model="product.quantity"
                      class="quantity focus:w-20"
                      @input="
                        product.total = product.quantity * Number(product?.cost);
                        finalCalculation();
                      "
                    />
                  </td>

                  <td class="text-right">
                    <span class="font-semibold mr-2 lg:hidden">Total:</span
                    >{{ Number(product?.total).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="right-side">
        <div class="mb-3">
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
          <div>
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

                  <a-menu-item v-for="(supplier, index) in supplierList" :key="index">
                    <button
                      type="button"
                      class="flex items-center w-full text-left"
                      ref="suppliers"
                      @click="
                        () => {
                          supplierInfo = supplier;
                          visibleSupplier = false;
                          mrrSearch('');
                          nextTick(() => mrrInput.focus());
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
                          <PictureOutlined class="align-middle mb-1" />
                        </a-avatar>
                      </div>
                      <div>
                        <h6 class="font-bold">
                          {{ supplier?.company_name }}
                        </h6>
                      </div>
                    </button>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
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
                      <PictureOutlined class="align-middle mb-1" />
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
          <a-dropdown class="mt-3" v-model:open="visibleMrr">
            <input
              type="text"
              placeholder="Enter MRR name"
              class="searchInput"
              ref="mrrInput"
              v-model="mrrInfo.name"
              :disabled="!supplierInfo"
              @input="mrrSearch($event?.target?.value)"
              @keydown.down="mrrs?.at(0)?.focus()"
              @focus="visibleMrr = true"
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

                        getisInput?.focus();
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
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <!-- Price List -->
        <div class="">
          <div class="lg:grid grid-cols-2 gap-2 items-end">
            <div class="mb-0">
              <p class="mb-1">Getis %</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="getis_percent"
                min="0"
                ref="getisInput"
                @focus="getisInput.select()"
                @keypress.enter="discountInput.focus()"
                @keydown="
                  (event) => {
                    if (event.key == '-' || event.key == '+' || event.key == 'e') {
                      event.preventDefault();
                    }
                  }
                "
                @input="calculateGetisPercent"
              />
            </div>
            <div class="mb-0">
              <p class="mb-1">Getis Amount</p>
              <input
                type="number"
                class="searchInput text-right"
                min="0"
                v-model="amount"
                @input="calculateGetisAmount"
              />
            </div>
            <div class="mb-0">
              <p class="mb-1">Discount all Items by Percent</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="discount_all"
                @input="
                  handleAllDiscount();
                  finalCalculation();
                "
                min="0"
                @keydown="
                  (event) => {
                    if (event.key == '-' || event.key == '+' || event.key == 'e') {
                      event.preventDefault();
                    }
                  }
                "
              />
            </div>
            <div class="mb-0">
              <div class="flex justify-between">
                <p class="mb-1 text-red-600 font-medium">Discount:</p>
                <p class="mb-1 text-red-600 font-medium">{{ discount_price }} BDT</p>
              </div>
              <input
                type="text"
                class="searchInput text-right"
                ref="discountInput"
                v-model="discount_entire_purchase"
                @focus="discountInput.select()"
                @keypress.enter="paidInput.focus()"
                @keydown="
                  (event) => {
                    if (event.key == '+' || event.key == '-' || event.key == 'e') {
                      event.preventDefault();
                    }
                  }
                "
                @input="
                  calculatePaidAmount();
                  finalCalculation();
                "
              />
            </div>
            <div class="mb-0">
              <p class="mb-1">Sub Total:</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="prices.subtotal"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="mb-1">Total Trade Price:</p>
              <input
                type="number"
                class="searchInput text-right"
                v-model="prices.tradePrice"
                readonly
              />
            </div>
            <div class="mb-0">
              <p class="mb-1">Total VAT:</p>
              <input type="number" class="searchInput text-right" v-model="prices.vat" readonly />
            </div>
            <div class="mb-0">
              <p class="mb-1">Invoice No:</p>
              <input type="number" class="searchInput text-right" v-model="invoice_no" />
            </div>

            <div class="mb-0">
              <p class="xl:text-xl lg:text-lg font-bold">Total:</p>
              <input
                type="number"
                class="searchInput text-right text-green-600 font-bold xl:text-xl lg:text-lg"
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
            <!-- <div class="mb-0 col-span-2">
              <p class="mb-1">Attachment</p>
              <input
                type="file"
                class="searchInput text-right"
                accept="image/*"
                @change="onFileChange($event)"
              />
            </div> -->
          </div>
        </div>

        <!-- Payment Gateway -->
        <div class="">
          <div class="mb-1" v-if="permissions.includes('purchase-payment')">
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
            @input="dueCalculation"
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
          <i class="bi bi-cart mr-2"></i> <span>Purchase</span>
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

    <!-- Bonus -->
    <a-modal v-model:open="isBonus" title="Bonus Products" @ok="isBonus = false">
      <a-dropdown>
        <input
          type="text"
          class="searchInput"
          placeholder="Enter item name or scan barcode"
          v-model="searchBonus"
          @input="handleProductSearch($event?.target?.value)"
          @keyup.down="searchList?.at(0)?.focus()"
        />
        <template #overlay>
          <a-menu class="max-h-80 overflow-y-auto max-w-[480px]">
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
                @click="storeBonus(data)"
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
                    <PictureOutlined class="align-middle mb-1" />
                  </a-avatar>
                </div>
                <div>
                  <h6 class="font-bold" v-html="highlightBonus(data?.name)"></h6>
                  <p class="text-gray-500">
                    <span class="mr-2"
                      ><strong>Category:</strong
                      ><span v-html="highlightBonus(data?.category?.name || '')"></span>;</span
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
                      ><strong>Supplier:</strong>
                      <span v-html="highlightBonus(data?.supplier?.company_name || '')"></span
                    ></span>
                  </p>
                </div>
              </button>
            </a-menu-item>
            <!--/ a-menu-item -->
          </a-menu>
        </template>
      </a-dropdown>
      <!-- table -->
      <h2 class="font-semibold text-indigo-600 mt-3 text-lg" v-if="bonusProduct?.length">
        Bonus Items
      </h2>
      <div class="max-h-[500px] overflow-y-auto">
        <template v-for="(product, index) in bonusProduct" :key="index">
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">SL</div>
            <div class="w-1/2 border border-b-0 px-2">{{ index + 1 }}</div>
          </div>
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">Item Name</div>
            <div class="w-1/2 border border-b-0 px-2">{{ product?.name }}</div>
          </div>
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">Pack Size</div>
            <div class="w-1/2 border border-b-0 px-2">
              {{ product?.pack_size?.name }} ({{
                product?.pack_size?.name == "Pack" ? product?.pack_size?.quantity : 1
              }})
            </div>
          </div>
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">TP</div>
            <div class="w-1/2 border border-b-0 px-2">0</div>
          </div>
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">VAT</div>
            <div class="w-1/2 border border-b-0 px-2">
              {{ Number(product?.product_prices?.vat).toFixed(2) }}
            </div>
          </div>
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">Cost</div>
            <div class="w-1/2 border border-b-0 px-2">
              {{ Number(product?.cost).toFixed(2) }}
            </div>
          </div>
          <div class="flex">
            <div class="w-1/2 border border-b-0 px-2 font-bold">Quantity</div>
            <div class="w-1/2 border border-b-0 px-2">
              <input type="text" class="outline-none" v-model="product.quantity" />
            </div>
          </div>
          <div class="flex mb-3">
            <div class="w-1/2 border px-2 font-bold">Total</div>
            <div class="w-1/2 border px-2">{{ Number(product?.total).toFixed(2) }}</div>
          </div>
        </template>
      </div>

      <template #footer>
        <button class="cancel-btn mr-2" @click="isBonus = false">Cancel</button>
        <button
          class="submit-btn"
          @click="
            bonusBackupProduct = bonusProduct;
            finalCalculation();
            isBonus = false;
          "
        >
          Done
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
