import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const useOpeningStore = defineStore("openingStore", {
  state: () => ({
    isLoading: false,

  }),

  actions: {
    async setOpeningBalance(data) {
      const config = {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      };
      this.isLoading = true;
      try {
        const response = await axios.post(`${apiBase}/cash_balances`, data, config);
        this.isLoading = false;
        if (response?.status === 201) {
          showNotification("success", response?.data?.message)
          return 1;
        }
      }
      catch (error) {
        this.isLoading = false;
        showNotification("error", error.message);
      }
    },
    async todayCashBalance() {
      const config = {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      };
      this.isLoading = true;
      try {
        const response = await axios.get(`${apiBase}/today_cash_balance`, config);
        this.isLoading = false;
        if (response?.status === 201) {

          return response?.data?.data;
        }
      }
      catch (error) {
        this.isLoading = false;
        showNotification("error", error.message);
      }
    },
    async previousCashBalance() {
      const config = {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      };
      this.isLoading = true;
      try {
        const response = await axios.get(`${apiBase}/previous_cash_balance`, config);
        this.isLoading = false;
        if (response?.status === 201) {

          return response?.data?.previous_cash_balance;
        }
      }
      catch (error) {
        this.isLoading = false;
        showNotification("error", error.message);
      }
    },

  },

  persist: true,
});
