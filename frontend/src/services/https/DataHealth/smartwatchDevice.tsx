import axios from "axios";
import { SmartwatchDeviceInterface } from "../../../interface/smartwatch_device_interface/smartwatch_device";

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

const postRequestOptions = (body: any) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: JSON.stringify(body),
  };
};



export const createSmartwatchDevice = async (
  noti: Omit<SmartwatchDeviceInterface, "ID">
): Promise<SmartwatchDeviceInterface> => {
  try {
    const requestOptions = postRequestOptions(noti);
    const response = await fetch(`${apiUrl}/create-smartwatch`, requestOptions);
    if (!response.ok) {
      throw new Error("Error creating smartwatch");
    }
    const data: SmartwatchDeviceInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating smartwatch:", error);
    throw new Error("Error creating smartwatch: " + (error as Error).message);
  }
};


export const getSmartwatchDeviceByUserID = async (
  userId: number
): Promise<SmartwatchDeviceInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<SmartwatchDeviceInterface[]>(
      `${apiUrl}/smartwatch/${userId}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching smartwatch: " + (error as Error).message);
  }
};