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
  fetchGraphicalData(dateForm,dateTo) {
    return apiClient.get(`/report/graphical-sales-report?sale_date_from=${dateForm}&sale_date_to=${dateTo}`);
  },
  fetchSummeryData(dateForm,dateTo) {
    return apiClient.get(`/report/sales-summary-report?sale_date_from=${dateForm}&sale_date_to=${dateTo}`);
  },
};