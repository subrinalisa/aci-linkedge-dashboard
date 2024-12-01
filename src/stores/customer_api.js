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
const apiClientMultiple = axios.create({
  baseURL:apiBase,

  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
});

export default {
  insertCustomer(formdata) {
    return apiClientMultiple.post(`/customers`, formdata);
  },
  fetchCustomerList(page) {
    return apiClient.get(`/all-customers-paginated?page=${page}`);
  },
  searchCustomerList(search) {
    return apiClient.get(`/all-customers-paginated?search=${search}`);
  },
  searchMRRList() {
    return apiClient.get(`/mrr/search`);
  },
  searchCustomer(id){
    return apiClientMultiple.get(`/customers/${id}`);
  },
  updateCustomer(id,formdata) {
    return apiClientMultiple.post(`/customer-update/${id}`, formdata);
  },

 
};