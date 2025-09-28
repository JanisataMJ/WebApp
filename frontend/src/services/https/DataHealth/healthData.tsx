import axios from "axios";
import { HealthDataInterface } from "../../../interface/health_data_interface/health_data";
import { RealTimeInterface } from "../../../interface/health_data_interface/realtime";

const apiUrl = "http://localhost:8000"; // เปลี่ยนตาม backend จริง

const getRequestOptions = () => {
  const token = localStorage.getItem("token");
  // 💡 แนะนำ: หากมีการเก็บ token_type ไว้ใน localStorage ควรดึงมาใช้ด้วย
  // const Bearer = localStorage.getItem("token_type") || "Bearer";
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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


export const getHealthDataByUserID = async (
  userId: number
): Promise<RealTimeInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<RealTimeInterface[]>(
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


export const getDailyHeartRate = async (
  userId: number,
  withStats = false
): Promise<any> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get(
      `${apiUrl}/daily-heart-rate?userID=${userId}&withStats=${withStats}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching daily heart rate: " + (error as Error).message);
  }
};


export const getDailySteps = async (
  userId: number,
  withStats = false
): Promise<any> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get(
      `${apiUrl}/daily-steps?userID=${userId}&withStats=${withStats}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching daily steps: " + (error as Error).message);
  }
};


export const getDailyCalories = async (
  userId: number,
  withStats = false
): Promise<any> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get(
      `${apiUrl}/daily-calories?userID=${userId}&withStats=${withStats}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching daily calories: " + (error as Error).message);
  }
};


export const getDailySpo2 = async (
  userId: number,
  withStats = false
): Promise<any> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get(
      `${apiUrl}/daily-spo2?userID=${userId}&withStats=${withStats}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching daily spo2: " + (error as Error).message);
  }
};


export const getDailySleep = async ( 
  userId: number,
  withStats = false
): Promise<any> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get(
      `${apiUrl}/daily-sleep?userID=${userId}&withStats=${withStats}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching daily sleep: " + (error as Error).message);
  }
};


export const GetWeeklyHealthData = async (
  userId: number,
  mode: "weekly" | "lastweek" | "last2weeks" = "weekly"
): Promise<HealthDataInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<HealthDataInterface[]>(
      `${apiUrl}/healthData/weekly/${userId}?mode=${mode}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error(
      "Error fetching health data: " + (error as Error).message
    );
  }
};