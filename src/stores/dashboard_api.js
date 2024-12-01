import { apiBase } from "@/config"; // Adjust this to your API base URL
// Adjust the import path as needed
import axios from 'axios';
import Cookies from 'js-cookie';
const token = Cookies.get('token');

const apiClient = axios.create({
  baseURL: apiBase,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});


export default {
  fetchDashboardData() {
    return apiClient.get(`/dashboard`);
  },
};