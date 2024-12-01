import Cookies from "js-cookie";

// export const imgBase = "https://apps.mis.digital/api/pharmacy-app/storage";
export const apiBase = "https://webapps.acibd.com/report-management-backend/api";

const token = Cookies.get("token");
export const config = {
    headers: {
        'Authorization': `Bearer ${token}`,
    },
}
