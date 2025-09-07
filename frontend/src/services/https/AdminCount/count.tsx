import axios from "axios";
import { AdminCountsInterface } from "../../../interface/admin_count_interface/count";

const apiUrl = "http://localhost:8000"; // เปลี่ยนตาม backend จริง

// ====== Utils ======
const getRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};


// GET Dashboard Counts
export const getAdminCounts = async (): Promise<AdminCountsInterface> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<AdminCountsInterface>(
      `${apiUrl}/admin-counts`,
      requestOptions
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error fetching dashboard counts: " + error.message);
  }
};
