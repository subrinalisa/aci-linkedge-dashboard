import {
    apiBase
} from "@/config"; // Adjust this to your API base URL
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
    baseURL: apiBase,

    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
    },
});

export default {

    fetchUserList(page) {
        return apiClient.get(`/all_user_list`);
    },
    fetchPaymentMethodList(page) {
        return apiClient.get(`/all-payment-methods`);
    },
    fetchExpenseCategoryList(page) {
        return apiClient.get(`/all-expense-category`);
    },

    insertExpense(formdata) {
        return apiClientMultiple.post(`/expenses`, formdata);
    },
    fetchExpenseList(page) {
        return apiClient.get(`/all-expenses-paginated?page=${page}`);
    },
    searchExpenseList(search) {
        return apiClient.get(`/all-expenses-paginated?search=${search}`);
    },

    fetchExpense(id) {
        return apiClient.get(`/expenses/${id}`);
    },
    updateExpense(id, formdata) {
        return apiClient.post(`/expense-update/${id}`, formdata);
    },




};