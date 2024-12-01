import { apiBase } from "@/config"; // Adjust this to your API base URL
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
  insertBranch(formdata) {
    return apiClientMultiple.post(`/branch`, formdata);
  },
  fetchBranchList(page) {
    return apiClient.get(`/all-branch-paginated?page=${page}`);
  },
  searchBranchList(search) {
    return apiClient.get(`/all-branch-paginated?search=${search}`);
  },
  showBranch(id) {
    return apiClientMultiple.get(`/branch/${id}`);
  },
  deleteBranch(id) {
    return apiClientMultiple.delete(`/branch/${id}`);
  },
  updateBranch(formdata, id) {
    return apiClientMultiple.put(`/branch/${id}`, formdata);
  }
};
