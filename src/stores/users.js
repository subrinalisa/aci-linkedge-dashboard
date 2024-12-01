import { apiBase } from "@/config";
import { showNotification } from "@/utilities/notification";
import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    isLoading: false,
    isDeleting: false,
  }),

  actions: {
    // User List
    async getUsers() {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/user_list`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data?.users;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // User Details
    async getUserDetail(id) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/user_edit/${id}`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data?.user_info;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // User Update
    async userUpdate(id, data) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.put(`${apiBase}/user_update/${id}`, data, config);
        this.isLoading = false;
        if (response?.data?.status === "success") {
          showNotification("info", response?.data?.message)
          return 1;
        }

      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Delete User
    async deleteUser(id) {
      this.isDeleting = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.delete(`${apiBase}/user_delete/${id}`, config);
        this.isDeleting = false;
        if (response?.data?.status === "Success") {
          showNotification("info", response?.data?.message)
          return 1;
        }

      } catch (error) {
        this.isDeleting = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Role List
    async getRoles() {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/roles`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data?.role;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Create Role
    async addRole(data) {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.post(`${apiBase}/roles`, data, config);
        this.isLoading = false;
        if (response?.data?.status === "Success") {
          showNotification("info", response?.data?.message)
          return 1;
        }

      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Delete Role
    async deleteRole(id) {
      this.isDeleting = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.delete(`${apiBase}/roles/${id}`, config);
        this.isDeleting = false;
        if (response?.data?.status === "Success") {
          showNotification("info", response?.data?.message)
          return 1;
        }

      } catch (error) {
        this.isDeleting = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Permission List
    async getPermission() {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/permissions`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data?.permissions;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // Branch List
    async getBranch() {
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.get(`${apiBase}/all-branch`, config);
        this.isLoading = false;
        if (response?.status == 200)
          return response?.data;
      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
    // User Permission
    async assignPermission(id, value) {
      const data = { permissions: value }
      this.isLoading = true;
      try {
        const token = Cookies.get("token");
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        const response = await axios.put(`${apiBase}/assign_permission/${id}`, data, config);
        this.isLoading = false;
        if (response?.data?.status === "success") {
          showNotification("info", response?.data?.message)
          return 1;
        }

      } catch (error) {
        this.isLoading = false;
        console.log(error);
        showNotification("error", error?.message);
      }
    },
  },
  persist: true,
});
