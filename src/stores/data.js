import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const useDataStore = defineStore("dataStore", {
  state: () => ({
    productList: [],
    sellingProducts: [],
    backupSellingData: null,
    isLoading: false,
    isSelling: false,
    isPurchasing: false,
    isSupplier: false,
    isMRR: false,
    userInfo: null,
    searchProduct: null,
    paymentList: null,
    priceList: {
      discountPerItem: 0,
      discountEntire: 0,
      reson: null,
      subtotal: null,
      total: null,
      due: null,
    },
  }),

  actions: {
    // Login
    async handleLogin(data, router) {
      this.isLoading = true;
      try {
        const response = await axios.post(`${apiBase}/login`, data);
        this.isLoading = false;
        if (response?.status === 200) {
          const res = response?.data;
          this.userInfo = res?.user;
          Cookies.set("token", res?.token, { expires: null });
          const permissions = res?.user?.all_permissions?.map(permission => permission.name);
          localStorage.setItem('permissions', JSON.stringify(permissions));

          showNotification("success", res?.message || "Welcome back! You've successfully logged in");
          router.push({ name: "home" });

        }
      } catch (error) {
        this.isLoading = false;
        this.userInfo = null;
        Cookies.remove("token");
        if (error?.response?.status == 401)
          showNotification("error", error?.response?.data?.message || "Login failed. Please check your credentials and try again");
        else showNotification("error", error?.message);
      }
    },
    // Dashboard
    async getDashboard() {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/dashboard`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Product Search
    async getProduct(query, branch) {
      this.isPurchasing = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/products/search?term=${query}&branch_id=${branch}`, config);
        this.isPurchasing = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isPurchasing = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },

    // Supplier Search
    async getSupplier(query) {
      !query && (query = "");
      this.isSupplier = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/supplier/search?term=${query}`, config);
        this.isSupplier = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isSupplier = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Customer Search
    async getCustomer() {
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/customer_all`, config);

        if (response?.status == 200)
          return response?.data;
      } catch (error) {

        console.log(error);
      }
    },
    // Product List
    async getProducts(search, page, paginate) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-products-paginated?search=${search}&page=${page}&paginate=${paginate}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Expenses List
    async getSaleReport(from, to) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/report/detailed-sales-report?sale_date_from=${from}&sale_date_to=${to}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Purchase Report
    async getPurchaseReport(from, to) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/report/detailed-received-report?purchase_date_from=${from}&purchase_date_to=${to}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Invoice
    async getInvoice(id) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/report/detailed-sales-invoice?id=${id}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Purchase List
    async getPurchaseList(page, query) {
      if (query) page = ""
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-purchases-paginated?page=${page}&search=${query}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },

    // Sale List
    async getSalesList(page, query) {
      if (query) page = ""
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-sales-paginated?page=${page}&search=${query}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Get Minimum Stock Level Report
    async getMinimumStockLevelReport() {
      this.isLoading = true;
      const token = Cookies.get("token");
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      try {
        const response = await axios.get(`${apiBase}/report/minimum-stock-level`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Cash Report
    async getCashReport(from, to) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/report/cash-balance?date_from=${from}&date_to=${to}`, config);
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
