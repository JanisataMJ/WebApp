import axios from "axios";
import { HealthSummaryInterface } from "../../../interface/health_summary_interface/health_summary";

const apiUrl = "http://localhost:8000"; // เปลี่ยนตาม backend จริง
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



export const getHealthAnalysis = async (): Promise<HealthSummaryInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthSummaryInterface[]>(
      `${apiUrl}/list-healthSummary`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching health summary: " + (error as Error).message);
  }
};


export const getHealthAnalysisByUserID = async (
  userId: number
): Promise<HealthSummaryInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthSummaryInterface[]>(
      `${apiUrl}/healthSummary/${userId}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching health summary: " + (error as Error).message);
  }
};