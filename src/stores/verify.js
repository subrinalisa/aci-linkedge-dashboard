import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const useVerifyStore = defineStore("verifyStore", {
  state: () => ({
    isLoading: false,
    isSubmitting: false,
    saleList: null,
  }),

  actions: {
    async fetchData(url, method = 'get', router = null, bodyData) {
      const config = {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      };
      this.isLoading = true;
      if (router) this.isSubmitting = true;

      try {
        let response = '';
        if (method == 'post') {
          response = await axios[method](`${apiBase}${url}`, bodyData, config);
        } else {
          response = await axios[method](`${apiBase}${url}`, config);
        }
        this.isLoading = false;
        if (router) this.isSubmitting = false;

        if (response?.status === 200) {
          if (router) {
            if (response.data.success) {
              showNotification("success", response.data.message);
              router.go(-1);
            } else {
              showNotification("error", response.data.message);
            }
          } else {
            return response.data;
          }
        }
      } catch (error) {
        this.isLoading = false;
        if (router) this.isSubmitting = false;
        showNotification("error", error.message);
      }
    },
    getSalesVerify(page) {
      return this.fetchData(`/verify-sales-list?page=${page}`);
    },
    getSalesReturnVerify(page) {
      return this.fetchData(`/verify-sale-return-list?page=${page}`);
    },
    getSalesDetails(id) {
      return this.fetchData(`/sales/${id}`);
    },
    getSalesReturnDetails(id) {
      return this.fetchData(`/sale-return/${id}`);
    },
    getSaleSuspended(id, router) {
      return this.fetchData(`/sale/suspended/${id}`, 'get', router);
    },
    getSaleReturnSuspended(id, router) {
      return this.fetchData(`/sale-return/suspended/${id}`, 'get', router);
    },
    getSaleVerified(id, router, data) {
      return this.fetchData(`/sale/verified/${id}`, 'post', router, data);
    },
    getSaleReturnVerified(id, router, data) {
      return this.fetchData(`/sale-return/verified/${id}`, 'post', router, data);
    },
    getPurchaseVerify(page) {
      return this.fetchData(`/all-verify-purchases-paginated?page=${page}`);
    },
    getPurchaseDetails(id) {
      return this.fetchData(`/purchases-edit?id=${id}`);
    },
    getPurchaseSuspended(id, router) {
      return this.fetchData(`/purchase/suspended/${id}`, 'get', router);
    },
    getPurchaseVerified(id, router, data) {
      return this.fetchData(`/purchase/verified/${id}`, 'post', router, data);
    },
    getPurchaseReturnVerify(page) {
      return this.fetchData(`/verify-purchase-return-list?page=${page}`);
    },
    getPurchaseReturnDetails(id) {
      return this.fetchData(`/purchase-return/${id}`);
    },
    getPurchaseReturnSuspended(id, router) {
      return this.fetchData(`/purchase-return/suspended/${id}`, 'get', router);
    },
    getPurchaseReturnVerified(id, router, data) {
      return this.fetchData(`/purchase-return/verified/${id}`, 'post', router, data);
    },
  },

  persist: true,
});
