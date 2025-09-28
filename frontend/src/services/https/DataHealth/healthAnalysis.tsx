import axios from "axios";
import { HealthAnalysisInterface } from "../../../interface/health_analysis_interface/health_analysis";

const apiUrl = "http://localhost:8000"; 
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



export const getHealthAnalysis = async (): Promise<HealthAnalysisInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthAnalysisInterface[]>(
      `${apiUrl}/list-healthAnalysis`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching health analysis: " + (error as Error).message);
  }
};


export const getHealthAnalysisByUserID = async (
  userId: number
): Promise<HealthAnalysisInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthAnalysisInterface[]>(
      `${apiUrl}/healthAnalysis/${userId}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching health analysis: " + (error as Error).message);
  }
};

export const GetSleepAnalysisByUser = async (userId: number) => {
  try { 
    const requestOptions = getRequestOptions();
    const res = await axios.get(`${apiUrl}/sleep-analysis/${userId}`, 
      requestOptions
    );
    return res.data;
  } catch (err: any) {
    throw new Error("Error fetching sleep analysis: " + err.message);
  }
};
