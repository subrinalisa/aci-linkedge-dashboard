import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export const showNotification = (type, message) => {
  toast(message, {
    theme: "light",
    type: type,
    autoClose: 3000,
  })
};
