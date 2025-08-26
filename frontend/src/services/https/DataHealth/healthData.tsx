import axios from "axios";
import { HealthDataInterface } from "../../../interface/health_data_interface/health_data";

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


export const getHealthData = async (): Promise<HealthDataInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthDataInterface[]>(
      `${apiUrl}/list-healthData`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching health data: " + (error as Error).message);
  }
};


// GET HealthData by userID
export const getHealthDataByUserID = async (
  userId: number
): Promise<HealthDataInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthDataInterface[]>(
      `${apiUrl}/healthData/${userId}`, // backend ต้องรองรับ route นี้
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error(
      "Error fetching health data: " + (error as Error).message
    );
  }
};