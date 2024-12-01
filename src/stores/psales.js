import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const usePsalesStore = defineStore("psalesStore", {
  state: () => ({
    sellingProducts: [],
    productList: [],
    returnProductList: [],
    backupSellingData: null,
    isSearching: false,
    isCustomer: false,
    isLoading: false,
    isPayment: false,
    isBranch: false,
    isSupplier: false,
    isMRR: false,
    paymentList: null,

    priceList: {
      discountPerItem: '',
      discountEntire: '',
      reson: '',
      subtotal: '',
      total: '',
      due: '',
    },
    prices: {
      subtotal: '',
      tradePrice: '',
      vat: '',
      total: '',
      due: '',
    },
  }),

  actions: {
    // Customer List
    async getCustomer(value) {
      this.isCustomer = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/customer/search?term=${value}`, config);
        this.isCustomer = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isCustomer = false;
        // showNotification("error", `Network Error ! Can't get Customers`)
      }
    },
    // Payment List
    async getPayment() {
      this.isPayment = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-payment-methods`, config);
        this.isPayment = false;
        if (response?.status == 200)
          this.paymentList = response?.data
      } catch (error) {
        this.isPayment = false;
        this.paymentList = null
        // showNotification("error", `Network Error ! Can't get Payment Gateway`)
      }
    },
    // Branch
    async getBranch() {
      this.isBranch = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-branch`, config);
        this.isBranch = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isBranch = false;
        console.log(error);
        // showNotification("error", `Network Error ! Can't get Branches`);
      }
    },
    // Supplier
    async getSupplier(value) {
      this.isSupplier = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/supplier/search?term=${value}`, config);
        this.isSupplier = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isSupplier = false;
        console.log(error);
        // showNotification("error", error?.message);
      }
    },
    // MRR Search
    async getMRR(query, supplier) {
      this.isMRR = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/mrr/search?term=${query}&supplier_id=${supplier}`, config);
        this.isMRR = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isMRR = false;
        console.log(error);
      }
    },
    // Sale Product Search
    async getSaleProduct(query, branch) {
      this.isSearching = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/sales/products/search?term=${query}&branch_id=${branch}`, config);
        this.isSearching = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isSearching = false;
        // showNotification("error", error?.message);
      }
    },
    // Generic Products
    async getGenericProducts(id, branch) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/sales/products_with_generic/${id}/${branch}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        // showNotification("error", error?.message);
      }
    },
    // Sale Insert
    async saleInsert(data) {
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.post(`${apiBase}/sales`, data, config);
        if (response?.status == 201) {
          showNotification("success", response?.data?.message)
          return 1
        }
      } catch (error) {
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    /*-------- Return ------- */
    // Product Search
    async getProduct(query, branch) {
      this.isSearching = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/products/search?term=${query}&branch_id=${branch}`, config);
        this.isSearching = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isSearching = false;
        console.log(error);
        // showNotification("error", error?.message);
      }
    },
    // Purchase Product Search
    async getPurchaseProduct(query, branch) {
      this.isSearching = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/purchase/products/search?term=${query + '-end-'}&branch_id=${branch}`, config);
        this.isSearching = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isSearching = false;
        console.log(error);
        // showNotification("error", error?.message);
      }
    },
    // Return Sale
    async returnSale(data) {
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.post(`${apiBase}/sale-return`, data, config);
        if (response?.status == 201) {
          showNotification("success", response?.data?.message)
          return 1
        }
      } catch (error) {
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Return Sale List
    async getReturnSalesList(page, query) {
      if (query) page = ""
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-sale-return-paginated?page=${page}&search=${query}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Purchase Insert
    async purchaseInsert(data) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
        const response = await axios.post(`${apiBase}/purchases`, data, config);
        this.isLoading = false;
        if (response?.status == 200) {
          if (response?.data?.success) {
            showNotification("success", response?.data?.message)
            return 1
          }
          else {
            showNotification("success", response?.data?.message)
          }
        }
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Purchase Return
    async purchaseReturn(data) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.post(`${apiBase}/purchase-return`, data, config);
        this.isLoading = false;
        if (response?.status == 200) {
          showNotification("success", response?.data?.message)
          return 1
        }
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Return Purchase List
    async getReturnPurchaseList(page, query) {
      if (query) page = ""
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-purchase-returns-paginated?page=${page}&search=${query}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },

  },
  persist: true,
});
