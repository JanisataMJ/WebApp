import axios from "axios";
import { AnalysisResultInterface } from "../../../interface/analysis_result_interface/analysis_result";

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




export const getAnalysisResult = async (): Promise<AnalysisResultInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<AnalysisResultInterface[]>(
      `${apiUrl}/list-analysisResult`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching analysis results: " + (error as Error).message);
  }
};


export const getAnalysisResultByUserID = async (
  userId: number
): Promise<AnalysisResultInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<AnalysisResultInterface[]>(
      `${apiUrl}/analysisResult/${userId}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching analysis results: " + (error as Error).message);
  }
};