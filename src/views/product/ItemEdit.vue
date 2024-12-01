<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import axios from "axios";
import Cookies from "js-cookie";
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import vselect from "vue-select";
import Vue3TagsInput from "vue3-tags-input";
// Variables
const activeTab = ref("itemInfo");
const categoryList = ref([]);
const supplierList = ref([]);
const genericList = ref([]);
const manufacturerList = ref([]);
const route = useRoute();
const router = useRouter();
const globalProductId = ref(null);
const tab1 = ref(false);
const tab2 = ref(false);
const tab3 = ref(false);
const tab4 = ref(false);
const tab5 = ref(false);
const tab6 = ref(false);
const lastTabVisit = ref("itemInfo");
const lastSubmit = ref("");

const products = reactive({
  products: {
    id: globalProductId.value,
    category_id: "",
    supplier_id: "",
    generic_id: null,
    name: "",
    additional_item_numbers: "",
    tags: "",
    manufacturer_id: "",
    upc_ean_isbn: "",
    is_ecommerce_item: false,
    is_barcoded: false,

    description: "",
    tags: [],
  },
  pack_size: null,
  product_variation_attributes: null,
  product_variation: null,
  product_prices: null,
  product_inventories: null,
  product_images: null,
  product_locations: null,
  product_id: globalProductId.value,
});

const pack_size = reactive({
  product_id: globalProductId.value,
  name: "",
  quantity: "",
  tp: "",
  vat_percent: "17.4",
  vat: "",
  selling_price: "",
  default_unit: false,
});
const isLoading = ref(false);

// Define reactive form error state
const formErrors = ref({});
// Basic validation function
function firstValidateForm() {
  let errors = true;
  if (!products.products.name) {
    errors = false;
    showNotification("warning", "ItemInfo -> Name is required");
  }
  if (!products.products.category_id) {
    errors = false;
    showNotification("warning", "ItemInfo -> Category is required");
  }
  if (!products.products.supplier_id) {
    errors = false;
    showNotification("warning", "ItemInfo -> Supplier is required");
  }
  if (!products.products.generic_id) {
    errors = false;
    showNotification("warning", "ItemInfo -> Generic is required");
  }

  // formErrors.value = errors;
  return errors;
}
function secondValidateForm() {
  let errors = true;
  if (!pack_size.name) {
    errors = false;
    showNotification("warning", "Variations -> Name is required");
  }
  if (!pack_size.quantity) {
    errors = false;
    showNotification("warning", "Variations -> Quantity is required");
  }
  if (!pack_size.tp) {
    errors = false;
    showNotification("warning", "Variations -> TP is required");
  }
  if (!pack_size.vat) {
    errors = false;
    showNotification("warning", "Variations -> Vat is required");
  }
  if (!pack_size.selling_price) {
    errors = false;
    showNotification("warning", "Variations -> Selling Price is required");
  }

  // formErrors.value = errors;
  return errors;
}

const handleChangeTag = (tag) => {
  products.products.tags = tag; // add the new tag to the tags array
  console.log(products.products.tags.join(", "));
};

const productVariationAttributes = ref([]);

const productVariations = ref([]);
const product_prices = reactive({
  product_id: globalProductId.value,
  cost_price_without_tax: "",
  selling_price: "",
  trade_price: "",
  vat: "",
  e_sale_type: "",
  e_sale: "",
  wholesale: "",
  promo_price: "",
  promo_start_date: "",
  promo_end_date: "",
  disable_from_price_rules: false,
  allow_price_override_regardless_of_permissions: false,
  prices_include_tax: false,
  only_allow_items_to_be_sold_in_whole_numbers: false,
  change_cost_price_during_sale: false,
  override_default_commission: false,
  override_default_tax: false,
});

const product_locations = reactive({
  product_id: globalProductId.value,
  location_at_store: "",
  reorder_level: "",
  replenish_level: "",
  hide_from_grid: false,
  override_prices: false,
  override_default_tax: false,
});

const product_inventories = reactive({
  product_id: globalProductId.value,
  quantity: "",
  recorder_level: "",
  replenish_level: "",
  days_expairation: "",
  damaged_quantity: "",
  inventory_add_subtract: "",
  comments: "",
});
const calculatePackSizeQuantityRelatedValue = () => {
  // if (pack_size?.name == "Pcs") {
  //   pack_size.quantity = 1;
  // }

  product_prices.cost_price_without_tax = Number(
    (Number(pack_size?.tp) + Number(pack_size?.vat)) /
    Number(pack_size?.quantity)
  ).toFixed(2);
  product_prices.selling_price = Number(
    Number(pack_size?.selling_price) / Number(pack_size?.quantity)
  ).toFixed(2);
  product_prices.trade_price = Number(
    Number(pack_size?.tp) / Number(pack_size?.quantity)
  ).toFixed(2);
  product_prices.vat = Number(
    Number(pack_size?.vat) / Number(pack_size?.quantity)
  ).toFixed(2);
};
const calculatePackSizeTpRelatedValue = () => {
  pack_size.vat = Number(
    (pack_size?.tp * pack_size?.vat_percent) / 100
  ).toFixed(2);
  product_prices.trade_price = Number(
    Number(pack_size?.tp) / Number(pack_size?.quantity)
  ).toFixed(2);
  product_prices.vat = Number(
    Number(pack_size?.vat) / Number(pack_size?.quantity)
  ).toFixed(2);
  product_prices.cost_price_without_tax = Number(
    (Number(pack_size?.tp) + Number(pack_size?.vat)) /
    Number(pack_size?.quantity)
  ).toFixed(2);
};
const calculatePackSizeVatRelatedValue = () => {
  product_prices.vat = Number(
    Number(pack_size?.vat) / Number(pack_size?.quantity)
  ).toFixed(2);
  product_prices.cost_price_without_tax = Number(
    (Number(pack_size?.tp) + Number(pack_size?.vat)) /
    Number(pack_size?.quantity)
  ).toFixed(2);
};
const calculatePackSizeSellingPriceRelatedValue = () => {
  product_prices.selling_price = Number(
    Number(pack_size?.selling_price) / Number(pack_size?.quantity)
  ).toFixed(2);
};
const checkWholeSaleType = () => {
  console.log(product_prices.wholesale_type);
  if (typeof product_prices.wholesale_type === "undefined") {
    product_prices.wholesale = null;
    showNotification("warning", "Wholesale type required");
  }
};
const checkESaleType = () => {
  if (typeof product_prices.e_sale_type == "undefined") {
    product_prices.e_sale = null;
    showNotification("warning", "E sale type required");
  }
};
const selectedAttribute = ref("");
const attributes = ref(["Attribute 1", "Attribute 2"]);

const images = reactive([]);
const valid = ref(false);
const commonSubmitData = () => {
  if (secondValidateForm()) {
    products.pack_size = pack_size;
    products.product_variation = productVariations.value;
    products.product_variation_attributes = productVariationAttributes.value;
  }
  products.product_prices = product_prices;
  products.product_inventories = product_inventories;
  products.product_images = files.value;
  products.product_locations = product_locations;
};
const itemInformationSubmit = () => {
  isLoading.value = true;
  if (firstValidateForm()) {
    commonSubmitData();
    console.log(products);

    try {
      const token = Cookies.get("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .post(
          `${apiBase}/product-update/${globalProductId.value}`,
          products,
          config
        )
        .then((res) => {
          if (res.data.status === "success") {
            const productId = res.data.product.id;
            globalProductId.value = productId;
            products.products.id = productId;

            productVariationAttributes.value = Object.values(
              res.data.product.product_variation_attributes || {}
            );
            productVariations.value = Object.values(
              res.data.product.product_variations || {}
            );

            showNotification("success", res?.data?.message);

            activeTab.value = "variations";
            isLoading.value = false;
          } else {
            isLoading.value = false;
            showNotification("error", res.data.message);
          }
        })
        .catch((err) => {
          isLoading.value = false;
          console.error(err);
          showNotification("error", err.message);
        });
    } catch (err) {
      console.error(err);
      isLoading.value = false;
      showNotification("error", err.message);
    }
  } else {
    isLoading.value = false;
  }
};

const addAttribute = () => {
  console.log("hello");
  if (selectedAttribute.value) {
    productVariationAttributes.value.push({
      id: null,
      name: selectedAttribute.value,
      values: "",
      product_id: globalProductId.value,
    });
  }
};

const addItemVeriation = () => {
  console.log(productVariationAttributes.value.length);
  if (
    productVariationAttributes.value.length > 0 &&
    productVariationAttributes.value.attribute != ""
  ) {
    productVariations.value.push({
      id: null,
      name: "",
      attributes: "",
      item_number: "",
      is_ecommerce_item: "",
      variation_id: "",
    });
  }
};
const deleteAttribute = (index) => {
  productVariationAttributes.value.splice(index, 1);
};

const itemVariationsSubmit = () => {
  isLoading.value = true;
  if (secondValidateForm() && firstValidateForm()) {
    commonSubmitData();
    console.log(products);

    try {
      const token = Cookies.get("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .post(
          `${apiBase}/product-update/${globalProductId.value}`,
          products,
          config
        )
        .then((res) => {
          if (res.data.status === "success") {
            const productId = res.data.product.id;
            globalProductId.value = productId;
            products.products.id = productId;

            productVariationAttributes.value = Object.values(
              res.data.product.product_variation_attributes || {}
            );
            productVariations.value = Object.values(
              res.data.product.product_variations || {}
            );

            showNotification("success", "Variation Update Successfully");

            activeTab.value = "pricing";
            isLoading.value = false;
          } else {
            isLoading.value = false;
            showNotification("error", res.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          isLoading.value = false;
          showNotification("error", err.message);
        });
    } catch (err) {
      console.error(err);
      isLoading.value = false;
      showNotification("error", err.message);
    }
  } else {
    isLoading.value = false;
  }
};

const itemPriceSubmit = () => {
  isLoading.value = true;

  if (secondValidateForm() && firstValidateForm()) {
    commonSubmitData();
    console.log(products);

    try {
      const token = Cookies.get("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .post(
          `${apiBase}/product-update/${globalProductId.value}`,
          products,
          config
        )
        .then((res) => {
          if (res.data.status === "success") {
            const productId = res.data.product.id;
            globalProductId.value = productId;
            products.products.id = productId;

            productVariationAttributes.value = Object.values(
              res.data.product.product_variation_attributes || {}
            );
            productVariations.value = Object.values(
              res.data.product.product_variations || {}
            );

            showNotification("success", "Pricing Update Successfully");

            activeTab.value = "inventory";
            isLoading.value = false;
          } else {
            isLoading.value = false;
            showNotification("error", res.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          isLoading.value = false;
          showNotification("error", err.message);
        });
    } catch (err) {
      console.error(err);
      isLoading.value = false;
      showNotification("error", err.message);
    }
  } else {
    isLoading.value = false;
  }
};

const itemInventorySubmit = () => {
  isLoading.value = true;
  if (secondValidateForm() && firstValidateForm()) {
    commonSubmitData();
    console.log(products);

    try {
      const token = Cookies.get("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .post(
          `${apiBase}/product-update/${globalProductId.value}`,
          products,
          config
        )
        .then((res) => {
          if (res.data.status === "success") {
            const productId = res.data.product.id;
            globalProductId.value = productId;
            products.products.id = productId;

            productVariationAttributes.value = Object.values(
              res.data.product.product_variation_attributes || {}
            );
            productVariations.value = Object.values(
              res.data.product.product_variations || {}
            );

            showNotification("success", "Inventory Update Successfully");

            activeTab.value = "images";
            isLoading.value = false;
          } else {
            isLoading.value = false;
            showNotification("error", res.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          isLoading.value = false;
          showNotification("error", err.message);
        });
    } catch (err) {
      console.error(err);
      isLoading.value = false;
      showNotification("error", err.message);
    }
  } else {
    isLoading.value = false;
  }
};

const files = ref([]);

const onFileChange = (event) => {
  files.value = Array.from(event.target.files);
};

const itemImageSubmit = () => {
  isLoading.value = true;
  if (secondValidateForm() && firstValidateForm()) {
    commonSubmitData();
    console.log(products);

    try {
      const token = Cookies.get("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .post(
          `${apiBase}/product-update/${globalProductId.value}`,
          products,
          config
        )
        .then((res) => {
          if (res.data.status === "success") {
            const productId = res.data.product.id;
            globalProductId.value = productId;
            products.products.id = productId;

            productVariationAttributes.value = Object.values(
              res.data.product.product_variation_attributes || {}
            );
            productVariations.value = Object.values(
              res.data.product.product_variations || {}
            );

            // showNotification("success", 'Image Added Successfully');

            activeTab.value = "locations";
            isLoading.value = false;
          } else {
            isLoading.value = false;
            showNotification("error", res.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          isLoading.value = false;
          showNotification("error", err.message);
        });
    } catch (err) {
      console.error(err);
      isLoading.value = false;
      showNotification("error", err.message);
    }
  } else {
    isLoading.value = false;
  }
};

const itemLocationSubmit = () => {
  isLoading.value = true;
  if (secondValidateForm() && firstValidateForm()) {
    commonSubmitData();
    console.log(products);

    try {
      const token = Cookies.get("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .post(
          `${apiBase}/product-update/${globalProductId.value}`,
          products,
          config
        )
        .then((res) => {
          if (res.data.status === "success") {
            const productId = res.data.product.id;
            globalProductId.value = productId;
            products.products.id = productId;

            productVariationAttributes.value = Object.values(
              res.data.product.product_variation_attributes || {}
            );
            productVariations.value = Object.values(
              res.data.product.product_variations || {}
            );

            showNotification("success", "Locations Update Successfully");
            isLoading.value = false;
            router.push({ name: "item" });
          } else {
            isLoading.value = false;
            showNotification("error", res.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          isLoading.value = false;
          showNotification("error", err.message);
        });
    } catch (err) {
      console.error(err);
      isLoading.value = false;
      showNotification("error", err.message);
    }
  } else {
    isLoading.value = false;
  }
};

const getGeneric = async (searchTerm, loading) => {
  loading(true);
  // if (searchTerm.length >= 2) {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const res = await axios.get(
      `${apiBase}/generic/search?term=${searchTerm}`,
      config
    );
    if (res.status === 200) {
      genericList.value = res.data;
    }
  } catch (error) {
    console.error("Error fetching generic data:", error);
  } finally {
    loading(false);
  }
  // } else {
  //   loading(false);
  // }
};

const getSupplier = async (searchTerm, loading) => {
  loading(true);
  // if (searchTerm.length >= 2) {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const res = await axios.get(
      `${apiBase}/supplier/search?term=${searchTerm}`,
      config
    );
    if (res.status === 200) {
      supplierList.value = res.data;
    }
  } catch (error) {
    console.error("Error fetching supplier data:", error);
  } finally {
    loading(false);
  }
  // } else {
  //   loading(false);
  // }
};

const getManufacturer = async (searchTerm, loading) => {
  loading(true);
  // if (searchTerm.length >= 2) {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const res = await axios.get(
      `${apiBase}/manufacturer/search?term=${searchTerm}`,
      config
    );
    if (res.status === 200) {
      manufacturerList.value = res.data;
    }
  } catch (error) {
    console.error("Error fetching manufacturer data:", error);
  } finally {
    loading(false);
  }
  // } else {
  //   loading(false);
  // }
};

onMounted(async () => {
  const token = Cookies.get("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await axios.get(
      `${apiBase}/product-edit/${route.params.id}`,
      config
    );

    // console.log(res);

    if (res.status == 200) {
      const data = res.data;
      // console.log(data);

      products.products.id = data?.product.id;
      globalProductId.value = data?.product.id;
      products.products.product_id = data?.product.product_id;
      products.products.name = data?.product?.name;
      products.products.category_id = parseInt(data?.product?.category_id);
      products.products.supplier_id = parseInt(data?.product?.supplier_id);
      products.products.upc_ean_isbn = data?.product?.upc_ean_isbn;
      products.products.additional_item_numbers =
        data?.product?.additional_item_numbers;
      products.products.tags = data?.product?.tags;
      products.products.manufacturer = data?.product?.manufacturer;
      products.products.is_ecommerce_item =
        data?.product?.is_ecommerce_item == 1 ? true : false;
      products.products.is_barcoded =
        data?.product?.is_barcoded == 1 ? true : false;
      products.products.description = data?.product?.description;
      products.products.generic_id = parseInt(data?.product?.generic_id);
      pack_size.product_id = data?.product.id;
      pack_size.name = data?.product?.pack_size?.name;
      pack_size.quantity = data?.product?.pack_size?.quantity;
      pack_size.tp = data?.product?.pack_size?.tp;
      pack_size.vat = data?.product?.pack_size?.vat;
      pack_size.selling_price = data?.product?.pack_size?.selling_price;
      pack_size.default_unit =
        data?.product?.pack_size?.default_unit == 1 ? true : false;
      product_prices.product_id = data?.product.id;
      product_prices.cost_price_without_tax =
        data?.product?.product_prices?.cost_price_without_tax;
      if (
        product_prices.cost_price_without_tax === undefined &&
        data?.product?.pack_size != null
      ) {
        product_prices.cost_price_without_tax = Number(
          (Number(pack_size?.tp) + Number(pack_size?.vat)) /
          Number(pack_size?.quantity)
        ).toFixed(2);
      }

      product_prices.selling_price =
        data?.product?.product_prices?.selling_price;

      if (
        product_prices.selling_price === undefined &&
        data?.product?.pack_size != null
      ) {
        product_prices.selling_price = Number(
          Number(pack_size?.selling_price) / Number(pack_size?.quantity)
        ).toFixed(2);
      }
      product_prices.trade_price = data?.product?.product_prices?.trade_price;

      if (
        product_prices.trade_price === undefined &&
        data?.product?.pack_size != null
      ) {
        product_prices.trade_price = Number(
          Number(pack_size?.tp) / Number(pack_size?.quantity)
        ).toFixed(2);
      }
      product_prices.vat = data?.product?.product_prices?.vat;

      product_prices.wholesale_type =
        data?.product?.product_prices?.wholesale_type;
      product_prices.wholesale = data?.product?.product_prices?.wholesale;
      product_prices.e_sale_type = data?.product?.product_prices?.e_sale_type;
      product_prices.e_sale = data?.product?.product_prices?.e_sale;
      product_prices.promo_price = data?.product?.product_prices?.promo_price;
      product_prices.promo_start_date =
        data?.product?.product_prices?.promo_start_date;
      product_prices.promo_end_date =
        data?.product?.product_prices?.promo_end_date;
      product_prices.disable_from_price_rules =
        data?.product?.product_prices?.disable_from_price_rules == 1
          ? true
          : false;

      product_prices.allow_price_override_regardless_of_permissions =
        data?.product?.product_prices
          ?.allow_price_override_regardless_of_permissions == 1
          ? true
          : false;
      product_prices.prices_include_tax =
        data?.product?.product_prices?.prices_include_tax == 1 ? true : false;
      product_prices.only_allow_items_to_be_sold_in_whole_numbers =
        data?.product?.product_prices
          ?.only_allow_items_to_be_sold_in_whole_numbers == 1
          ? true
          : false;
      product_prices.change_cost_price_during_sale =
        data?.product?.product_prices?.change_cost_price_during_sale == 1
          ? true
          : false;
      product_prices.override_default_commission =
        data?.product?.product_prices?.override_default_commission == 1
          ? true
          : false;
      product_prices.override_default_tax =
        data?.product?.product_prices?.override_default_tax == 1 ? true : false;
      if (
        product_prices.vat === undefined &&
        data?.product?.pack_size != null
      ) {
        product_prices.vat = Number(
          Number(pack_size?.vat) / Number(pack_size?.quantity)
        ).toFixed(2);
        itemPriceSubmit();
      }
      product_inventories.product_id = data?.product.id;
      product_inventories.quantity =
        data?.product?.product_inventories?.quantity;
      product_inventories.recorder_level =
        data?.product?.product_inventories?.recorder_level;
      product_inventories.replenish_level =
        data?.product?.product_inventories?.replenish_level;
      product_inventories.days_expairation =
        data?.product?.product_inventories?.days_expairation;
      product_inventories.damaged_quantity =
        data?.product?.product_inventories?.damaged_quantity;
      product_inventories.inventory_add_subtract =
        data?.product?.product_inventories?.inventory_add_subtract;
      product_inventories.comments =
        data?.product?.product_inventories?.comments;
      images.value = data?.product?.product_images;
      product_locations.product_id = data?.product.id;
      product_locations.location_at_store =
        data?.product?.product_locations?.location_at_store;
      product_locations.reorder_level =
        data?.product?.product_locations?.reorder_level;
      product_locations.replenish_level =
        data?.product?.product_locations?.replenish_level;
      product_locations.hide_from_grid =
        data?.product?.product_locations?.hide_from_grid == 1 ? true : false;
      product_locations.override_prices =
        data?.product?.product_locations?.override_prices == 1 ? true : false;
      product_locations.override_default_tax =
        data?.product?.product_locations?.override_default_tax == 1
          ? true
          : false;

      productVariationAttributes.value = Object.values(
        data?.product?.product_variation_attributes || {}
      );
      productVariations.value = Object.values(
        data?.product?.product_variations || {}
      );
      categoryList.value = data?.categories;
      supplierList.value = data?.suppliers;
      manufacturerList.value = data?.manufacturers;
      genericList.value = data?.generics;
    }
  } catch (err) {
    showNotification("error", err || err?.response?.data);
    console.log(err?.response?.data);
  }
});

const deleteVariation = (index) => {
  productVariations.value.splice(index, 1);
};

const validatePromoDates = (product_prices) => {
  const startDate = new Date(product_prices.promo_start_date);
  const endDate = new Date(product_prices.promo_end_date);

  if (product_prices.promo_start_date && product_prices.promo_end_date) {
    if (endDate < startDate) {
      product_prices.promo_end_date = "";
    }
  }
};
</script>

<template>
  <MainLayout>
    <div class="rounded-xl">
      <ul class="grid grid-cols-6 gap-3 justify-between items-center font-medium mb-3">
        <li>
          <button type="button" class="tabButton" :class="`${activeTab == 'itemInfo' ? 'activeTab' : 'inactiveTab'}`"
            @click.prevent="activeTab = 'itemInfo'" :disabled="tab1">
            Item info
          </button>
        </li>
        <li>
          <button type="button" class="tabButton" :class="`${activeTab == 'variations' ? 'activeTab' : 'inactiveTab'
            }`" @click.prevent="activeTab = 'variations'" :disabled="tab2">
            Variations
          </button>
        </li>
        <li>
          <button type="button" class="tabButton" :class="`${activeTab == 'pricing' ? 'activeTab' : 'inactiveTab'}`"
            @click="activeTab = 'pricing'" :disabled="tab3">
            Pricing
          </button>
        </li>
        <li>
          <button type="button" class="tabButton" :class="`${activeTab == 'inventory' ? 'activeTab' : 'inactiveTab'}`"
            @click="activeTab = 'inventory'" :disabled="tab4">
            Inventory
          </button>
        </li>
        <li>
          <button type="button" class="tabButton" :class="`${activeTab == 'images' ? 'activeTab' : 'inactiveTab'}`"
            @click="activeTab = 'images'" :disabled="tab5">
            Images
          </button>
        </li>
        <li>
          <button type="button" class="tabButton" :class="`${activeTab == 'locations' ? 'activeTab' : 'inactiveTab'}`"
            @click="activeTab = 'locations'" :disabled="tab6">
            Locations
          </button>
        </li>
      </ul>
    </div>

    <!-- Item Information Tab -->
    <template v-if="activeTab == 'itemInfo'">
      <form @submit.prevent="itemInformationSubmit">
        <!-- Form Fields -->
        <div class="mb-4">
          <label for="itemName" class="block text-grey-500 font-semibold">
            Item Name <span class="text-red-500">*</span>
          </label>
          <input id="itemName" type="text" v-model="products.products.name"
            class="w-full border border-gray rounded-md shadow-sm px-2 py-1" required />
        </div>
        <div class="space-y-4">
          <!-- Category Select -->
          <div class="flex flex-col">
            <label for="category_id" class="text-sm text-grey-500 font-semibold mb-1">Category <span
                class="text-red-500">*</span></label>
            <vselect v-model="products.products.category_id" id="category_id" :options="categoryList" label="name"
              :reduce="(category) => category.id" class="w-full rounded-md shadow-sm" placeholder="Select Category..."
              required></vselect>
          </div>
          <!-- Supplier Select -->
          <div class="flex flex-col">
            <label for="supplier_id" class="text-sm text-grey-500 font-semibold mb-1">Supplier <span
                class="text-red-500">*</span></label>

            <vselect v-model="products.products.supplier_id" id="supplier_id" @search="getSupplier"
              :options="supplierList" label="company_name" :reduce="(supplier) => supplier.id"
              class="w-full rounded-md shadow-sm" placeholder="Select Supplier..." required></vselect>
          </div>
          <!-- Supplier Select -->

          <div class="flex flex-col mb-3">
            <label for="generic_id" class="text-sm text-grey-500 font-semibold mb-1">Generic <span
                class="text-red-500">*</span></label>
            <vselect v-model="products.products.generic_id" id="generic_id" @search="getGeneric" :options="genericList"
              label="name" :reduce="(generic) => generic.id" class="w-full rounded-md shadow-sm mb-3"
              placeholder="Select Generic..." required></vselect>
          </div>
        </div>
        <!-- Additional Form Fields -->
        <div class="mb-4">
          <label for="upc" class="block text-gray-700 font-semibold">
            UPC/EAN/ISBN
          </label>
          <input id="upc" type="text" v-model="products.products.upc_ean_isbn"
            class="w-full border border-gray rounded-md shadow-sm px-2 py-1" />
        </div>
        <div class="mb-4">
          <label for="additionalItemNumbers" class="block text-gray-700 font-semibold">
            Additional Item Numbers
          </label>
          <input id="additionalItemNumbers" type="text" v-model="products.products.additional_item_numbers"
            class="w-full border border-gray rounded-md shadow-sm px-2 py-1" />
        </div>
        <div class="mb-4">
          <label for="tags" class="block text-gray-700 font-semibold">
            Tags
          </label>
          <vue3-tags-input :tags="products.products.tags" placeholder="enter some tags"
            @on-tags-changed="handleChangeTag" />
        </div>
        <div class="mb-4">
          <div class="flex flex-col mb-3">
            <label for="supplier_id" class="text-sm text-grey-500 font-semibold mb-1">Manufacturer</label>
            <vselect v-model="products.products.manufacturer_id" id="manufacturer" @search="getManufacturer"
              :options="manufacturerList" label="company_name" :reduce="(manufacture) => manufacture.id"
              class="w-full rounded-md shadow-sm mb-3" required></vselect>
          </div>
        </div>
        <div class="mb-4 col-span-2 flex">
          <label for="manufacturer" class="block text-gray-700 font-semibold pr-4">
            Is Ecommerce Item:
          </label>
          <input type="checkbox" v-model="products.products.is_ecommerce_item" class="flex self-center" />
          <span class="p-2"></span>
          <label for="manufacturer" class="block text-gray-700 font-semibold pr-4">
            Is Barcoded:
          </label>
          <input type="checkbox" v-model="products.products.is_barcoded" class="flex self-center items-start" />
        </div>
        <div class="mb-4">
          <label for="description" class="block text-gray-700 font-semibold">
            Description
          </label>
          <textarea id="description" v-model="products.products.description"
            class="w-full border border-gray rounded-md shadow-sm px-4 py-2"></textarea>
        </div>
        <div class="flex justify-end space-x-4">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg" :disabled="isLoading">
            <a-spin v-if="isLoading" />
            Update
          </button>
          <!-- <button type="button" @click="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
            Cancel
          </button> -->
        </div>
      </form>
    </template>

    <!-- Variations Tab -->
    <template v-if="activeTab === 'variations'">
      <div>
        <!-- @submit.prevent="itemVariations" -->
        <form @submit.prevent="itemVariationsSubmit">
          <!-- Pack Size Section -->
          <div class="bg-white p-5 rounded-lg shadow">
            <h3 class="text-md font-semibold mb-2">
              <span class="text-blue-500">Pack Size (Fields in red are required)</span>
            </h3>
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="w-1/12 text-grey-500">
                    Name <span class="text-red-500">*</span>
                  </th>
                  <th class="w-1/12 text-grey-500">
                    Qty. <span class="text-red-500">*</span>
                  </th>
                  <th class="w-1/12 text-grey-500">
                    TP <span class="text-red-500">*</span>
                  </th>
                  <th class="w-1/12">Vat %</th>
                  <th class="w-1/12">
                    Vat <span class="text-red-500">*</span>
                  </th>
                  <th class="w-1/12">
                    Selling Price <span class="text-red-500">*</span>
                  </th>
                  <th class="w-1/6">Default Unit</th>
                  <!-- <th class="w-1/6">Delete</th> -->
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border px-4 py-2">
                    <vselect v-model="pack_size.name" id="pack_size_name" :options="[{ name: 'Pcs' }, { name: 'Pack' }]"
                      label="name" :reduce="(pack_size) => pack_size.name" class="w-full rounded-md shadow-sm"
                      placeholder="Select Name..." @update:modelValue="calculatePackSizeQuantityRelatedValue" required>
                    </vselect>
                  </td>
                  <td class="border px-4 py-2">
                    <input type="number" step="any" v-model="pack_size.quantity" min="0"
                      @input="calculatePackSizeQuantityRelatedValue"
                      class="w-full border border-gray rounded-md shadow-sm px-2 py-1 text-right" required="required"
                      @keydown="(event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'E' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                        " />
                  </td>
                  <td class="border px-4 py-2">
                    <input type="number" step="any" v-model="pack_size.tp" @input="calculatePackSizeTpRelatedValue"
                      class="w-full border border-gray rounded-md shadow-sm px-2 py-1 text-right" min="0" required
                      @keydown="(event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'E' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                        " />
                  </td>
                  <td class="border px-4 py-2">
                    <input type="number" v-model="pack_size.vat_percent"
                      class="w-full border border-gray rounded-md shadow-sm px-2 py-1 text-right" readonly required />
                  </td>
                  <td class="border px-4 py-2">
                    <input type="number" step="any" v-model="pack_size.vat" min="0"
                      @input="calculatePackSizeVatRelatedValue"
                      class="w-full border border-gray rounded-md shadow-sm px-2 py-1 text-right" required @keydown="(event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'E' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                        " />
                  </td>
                  <td class="border px-4 py-2">
                    <input type="number" v-model="pack_size.selling_price" step="any" min="0"
                      @input="calculatePackSizeSellingPriceRelatedValue"
                      class="w-full border border-gray rounded-md shadow-sm px-2 py-1 text-right" required @keydown="(event) => {
                          if (
                            event.key == '.' ||
                            event.key == '+' ||
                            event.key == '-' ||
                            event.key == 'E' ||
                            event.key == 'e'
                          ) {
                            event.preventDefault();
                          }
                        }
                        " />
                  </td>
                  <td class="border px-4 py-2">
                    <input type="checkbox" v-model="pack_size.default_unit"
                      class="w-full border border-gray rounded-md shadow-sm px-2 py-1 text-right" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-6 bg-white p-5 rounded-lg shadow">
            <h3 class="text-md font-semibold mb-2">
              <span class="text-blue-500">Variations (Fields in red are required)</span>
            </h3>

            <div class="mb-4">
              <label class="block mb-2">Item Attributes</label>
              <div class="flex items-center gap-2 mb-2">
                <select v-model="selectedAttribute" class="border border-gray rounded-md shadow-sm px-2 py-1 flex-1">
                  <option value="" disabled>Select an Attribute</option>
                  <!-- Add options here if needed -->
                  <option v-for="attribute in attributes" :key="attribute" :value="attribute">
                    {{ attribute }}
                  </option>
                </select>
                <button @click.prevent="addAttribute" class="bg-blue-800 text-white rounded-md px-3 py-1">
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
                  <tr v-for="(attribute, index) in productVariationAttributes" :key="index">
                    <td class="border border-gray-300 p-2">
                      {{ attribute.name }}
                    </td>
                    <td class="border border-gray-300 p-2">
                      <input type="number" v-model="attribute.values"
                        class="w-full border border-gray rounded-md shadow-sm px-0 p-1 text-right" @keydown="(event) => {
                            if (
                              event.key == '.' ||
                              event.key == '+' ||
                              event.key == '-' ||
                              event.key == 'E' ||
                              event.key == 'e'
                            ) {
                              event.preventDefault();
                            }
                          }
                          " min="0" />
                    </td>
                    <td class="border border-gray-300 p-2 text-center">
                      <button @click.prevent="deleteAttribute(index)" class="text-grey-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <br />
              <button @click="manageGlobalAttributes"
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-2 hover:border-transparent rounded">
                Manage Global Attributes
              </button>

              <br />

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
                  <tr v-for="(variation, index) in productVariations" :key="index">
                    <td class="border border-gray-300 p-2">
                      <input type="text" v-model="variation.name"
                        class="w-full border border-gray rounded-md shadow-sm px-0 p-1 text-left" />
                    </td>
                    <td class="border border-gray-300 p-2">
                      <input type="text" v-model="variation.attributes"
                        class="w-full border border-gray rounded-md shadow-sm px-0 p-1 text-left" />
                    </td>
                    <td class="border border-gray-300 p-2">
                      <input type="number" v-model="variation.item_number"
                        class="w-full border border-gray rounded-md shadow-sm px-0 p-1 text-right" @keydown="(event) => {
                            if (
                              event.key == '.' ||
                              event.key == '+' ||
                              event.key == '-' ||
                              event.key == 'E' ||
                              event.key == 'e'
                            ) {
                              event.preventDefault();
                            }
                          }
                          " min="0" />
                    </td>
                    <td class="border border-gray-300 p-2 text-center">
                      <input type="checkbox" :checked="variation.is_ecommerce_item === '1'" disabled />
                    </td>
                    <td class="border border-gray-300 p-2">
                      <input type="number" v-model="variation.variation_id"
                        class="w-full border border-gray rounded-md shadow-sm px-0 p-1 text-right" @keydown="(event) => {
                            if (
                              event.key == '.' ||
                              event.key == '+' ||
                              event.key == '-' ||
                              event.key == 'E' ||
                              event.key == 'e'
                            ) {
                              event.preventDefault();
                            }
                          }
                          " min="0" />
                    </td>
                    <td class="border border-gray-300 p-2 text-center">
                      <button @click.prevent="deleteVariation(index)" class="text-grey-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button @click.prevent="addItemVeriation" class="rounded-md px-3 py-1 text-blue-700">
                Add Item Variation
              </button>
            </div>
          </div>

          <!-- Form Buttons -->
          <div class="flex justify-end space-x-4 mt-4">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg" :disabled="isLoading">
              <a-spin v-if="isLoading" />
              Update
            </button>
            <!-- <button type="button" @click="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
              Cancel
            </button> -->
          </div>
        </form>
      </div>
    </template>

    <!-- <Pricing v-if="activeTab=='pricing'"></Pricing> -->
    <template v-if="activeTab == 'pricing'">
      <div class="bg-white p-5 rounded-lg shadow">
        <h3 class="text-md font-semibold mb-3">
          <span class="text-blue-500">Pricing (Fields in red are required)</span>
        </h3>
        <form @submit.prevent="itemPriceSubmit()">
          <div class="grid grid-cols-1 gap-4 mb-3">
            <div>
              <label class="block text-grey-500 mb-2">Cost Price [Without Tax]
                <span class="text-red-500">*</span></label>
              <input type="number" v-model="product_prices.cost_price_without_tax"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" readonly />
            </div>
            <div>
              <label class="block text-grey-500 mb-2">Selling Price <span class="text-red-500">*</span></label>
              <input type="number" v-model="product_prices.selling_price"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" readonly />
            </div>
            <div>
              <label class="block mb-2">Trade Price</label>
              <input type="number" v-model="product_prices.trade_price"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" readonly />
            </div>
            <div>
              <label class="block mb-2">Vat</label>
              <input type="number" v-model="product_prices.vat"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" readonly />
            </div>
            <div>
              <label class="block mb-2 w-full">Wholesale</label>
              <div class="flex items-center mb-3">
                <vselect id="wholesale_type" v-model="product_prices.wholesale_type" :options="[
                  { label: 'Fixed Price', value: 'fixed_price' },
                  { label: 'Percent Off', value: 'percent_off' },
                  { label: 'Cost Plus Percent', value: 'cost_plus_percent' },
                  {
                    label: 'Cost Plus Fixed Amount',
                    value: 'cost_plus_fixed_amount',
                  },
                ]" label="label" :reduce="(option) => option.value" placeholder="Select Wholesale..."
                  class="rounded-md shadow-sm mr-2" style="width: 30%" />

                <input type="number" v-model="product_prices.wholesale" @keyup="checkWholeSaleType"
                  class="border border-grey rounded-md shadow-sm px-1 py-1 text-right" style="width: 70%" @keydown="(event) => {
                      if (
                        event.key == '.' ||
                        event.key == '+' ||
                        event.key == '-' ||
                        event.key == 'E' ||
                        event.key == 'e'
                      ) {
                        event.preventDefault();
                      }
                    }
                    " min="0" />
              </div>
            </div>

            <div>
              <label class="block mb-2 w-full">E Sale</label>

              <div class="flex items-center mb-3">
                <vselect id="e_sale_type" v-model="product_prices.e_sale_type" :options="[
                  { label: 'Fixed Price', value: 'fixed_price' },
                  { label: 'Percent Off', value: 'percent_off' },
                  { label: 'Cost Plus Percent', value: 'cost_plus_percent' },
                  {
                    label: 'Cost Plus Fixed Amount',
                    value: 'cost_plus_fixed_amount',
                  },
                ]" label="label" :reduce="(option) => option.value" placeholder="Select E Sale..."
                  class="rounded-md shadow-sm mr-2" style="width: 30%" />

                <input type="number" v-model="product_prices.e_sale" @keyup="checkESaleType"
                  class="border border-grey rounded-md shadow-sm px-1 py-1 text-right" style="width: 70%" @keydown="(event) => {
                      if (
                        event.key == '.' ||
                        event.key == '+' ||
                        event.key == '-' ||
                        event.key == 'E' ||
                        event.key == 'e'
                      ) {
                        event.preventDefault();
                      }
                    }
                    " min="0" />
              </div>
            </div>
            <div>
              <label class="block mb-2">Promo Price</label>
              <input type="number" v-model="product_prices.promo_price"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" @keydown="(event) => {
                    if (
                      event.key == '.' ||
                      event.key == '+' ||
                      event.key == '-' ||
                      event.key == 'E' ||
                      event.key == 'e'
                    ) {
                      event.preventDefault();
                    }
                  }
                  " min="0" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block mb-2">Promo Start Date</label>
              <input type="date" v-model="product_prices.promo_start_date"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
                @change="validatePromoDates(product_prices)" />
            </div>
            <div>
              <label class="block mb-2">Promo End Date</label>
              <input type="date" v-model="product_prices.promo_end_date"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full"
                @change="validatePromoDates(product_prices)" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.disable_from_price_rules" />
              <label>Disable From Price Rules</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.allow_price_override_regardless_of_permissions
                " />
              <label>Allow price override regardless of permissions</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.change_cost_price_during_sale" />
              <label>Change cost price during sale</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.override_default_commission" />
              <label>Override Default Commission</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.prices_include_tax" />
              <label>Prices include Tax</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.override_default_tax" />
              <label>Override Default Tax</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="product_prices.only_allow_items_to_be_sold_in_whole_numbers
                " />
              <label>Only allow items to be sold in whole numbers</label>
            </div>
          </div>
          <div class="flex justify-end space-x-4">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg" :disabled="isLoading">
              <a-spin v-if="isLoading" />
              Update
            </button>
            <!-- <button type="button" @click="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
              Cancel
            </button> -->
          </div>
        </form>
      </div>
    </template>

    <!-- <Inventory v-if="activeTab=='inventory'"></Inventory> -->
    <template v-if="activeTab == 'inventory'">
      <h3 class="text-md font-semibold mb-3">
        <span class="text-blue-500">Inventory</span>
      </h3>
      <form @submit.prevent="itemInventorySubmit()">
        <div class="grid gap-4">
          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Recorder Level:</label>
            <input type="number" v-model="product_inventories.recorder_level"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11 text-right" @keydown="(event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
                " min="0" />
          </div>
          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Replenish Level:</label>
            <input type="number" v-model="product_inventories.replenish_level"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11 text-right" @keydown="(event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
                " min="0" />
          </div>

          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Days to Expairation:</label>
            <input type="number" v-model="product_inventories.days_expairation"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11 text-right" @keydown="(event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
                " min="0" />
          </div>
          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Current Quantity:</label>
            <input type="number" v-model="product_inventories.quantity"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11 text-right" @keydown="(event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
                " min="0" />
          </div>
          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Damaged Qty:</label>
            <input type="number" v-model="product_inventories.damaged_quantity"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11 text-right" @keydown="(event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
                " min="0" />
          </div>
          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Inventory to add/subtract:</label>
            <input type="number" v-model="product_inventories.inventory_add_subtract"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11 text-right" @keydown="(event) => {
                  if (
                    event.key == '.' ||
                    event.key == '+' ||
                    event.key == '-' ||
                    event.key == 'E' ||
                    event.key == 'e'
                  ) {
                    event.preventDefault();
                  }
                }
                " min="0" />
          </div>
          <div class="grid grid-cols-12 gap-4">
            <label class="mb-2 w-auto col-span-1">Comments:</label>
            <textarea type="text" v-model="product_inventories.comments"
              class="flex-1 border border-grey rounded-md shadow-sm px-1 py-1 col-span-11"></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg" :disabled="isLoading">
            <a-spin v-if="isLoading" />
            Update
          </button>
          <!-- <button type="button" @click="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
              Cancel
            </button> -->
        </div>
      </form>
    </template>
    <!-- <Images v-if="activeTab=='images'"></Images> -->
    <template v-if="activeTab == 'images'">
      <h3 class="text-md font-semibold mb-2">
        <span class="text-blue-500">Image</span>
      </h3>
      <form @submit.prevent="itemImageSubmit()">
        <div class="mb-4">
          <input type="file" multiple @change="onFileChange" class="mb-4" />
          <div class="flex space-x-4">
            <div v-for="(image, index) in images" :key="index"
              class="w-16 h-16 border border-gray-400 flex items-center justify-center">
              <img :src="image.src" alt="Image" class="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-4">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg" :disabled="isLoading">
            <a-spin v-if="isLoading" />
            Update
          </button>
          <!-- <button type="button" @click="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
            Cancel
          </button> -->
        </div>
      </form>
    </template>

    <template v-if="activeTab == 'locations'">
      <div class="bg-white p-5 rounded-lg shadow">
        <h3 class="text-md font-semibold mb-3">
          <span class="text-blue-500">Locations</span>
        </h3>
        <form @submit.prevent="itemLocationSubmit()">
          <div class="grid grid-cols-1 gap-4 mb-3">
            <div>
              <label class="block text-500 mb-2">Location At Store</label>
              <input type="text" v-model="product_locations.location_at_store"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full" />
            </div>
            <div>
              <label class="block text-500 mb-2">Reorder Level</label>
              <input type="number" v-model="product_locations.reorder_level"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" @keydown="(event) => {
                    if (
                      event.key == '.' ||
                      event.key == '+' ||
                      event.key == '-' ||
                      event.key == 'E' ||
                      event.key == 'e'
                    ) {
                      event.preventDefault();
                    }
                  }
                  " min="0" />
            </div>
            <div>
              <label class="block mb-2">Replenish Level</label>
              <input type="number" v-model="product_locations.replenish_level"
                class="border border-grey rounded-md shadow-sm px-2 py-1 w-full text-right" @keydown="(event) => {
                    if (
                      event.key == '.' ||
                      event.key == '+' ||
                      event.key == '-' ||
                      event.key == 'E' ||
                      event.key == 'e'
                    ) {
                      event.preventDefault();
                    }
                  }
                  " min="0" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div class="flex items-center gap-2">
              <label>Hide From Grid:</label>
              <input type="checkbox" v-model="product_locations.hide_from_grid" />
            </div>
            <div class="flex items-center gap-2">
              <label>Override Prices:</label>
              <input type="checkbox" v-model="product_locations.override_prices" />
            </div>
            <div class="flex items-center gap-2">
              <label>Override Default Tax:</label>
              <input type="checkbox" v-model="product_locations.override_default_tax" />
            </div>
          </div>
          <div class="flex justify-end space-x-4">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg" :disabled="isLoading">
              <a-spin v-if="isLoading" />
              Update
            </button>
            <!-- <button type="button" @click="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
              Cancel
            </button> -->
          </div>
        </form>
      </div>
    </template>
  </MainLayout>
</template>
<style>
@import "vue-select/dist/vue-select.css";
</style>
