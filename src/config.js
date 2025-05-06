import Cookies from "js-cookie";
// export const apiBase = "https://linkage-backend.mis.digital/report-management-backend/api";
// export const apiBase = "https://webapps.acibd.com/report-management-backend/api";
export const apiBase = "https://wa.acibd.com/report-management-backend/api";

export const config = {
    headers: {
        'Authorization': `Bearer ${Cookies.get("token")}`,
    },
}
