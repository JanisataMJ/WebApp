import axios from "axios";
import { NotificationInterface } from "../../../interface/notification_interface/notification";

const apiUrl = "http://localhost:8000"; // เปลี่ยนเป็น backend จริง

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

// GET Notifications by user ID
export const getNotificationByUserID = async (
  userId: number
): Promise<NotificationInterface[]> => {
  const requestOptions = getRequestOptions();
  const response = await axios.get<NotificationInterface[]>(
    `${apiUrl}/notification/${userId}`,
    requestOptions
  );
  return response.data;
};

// CREATE Notification
export const createNotification = async (
  noti: Omit<NotificationInterface, "ID">
): Promise<NotificationInterface> => {
  const requestOptions = getRequestOptions();
  const response = await axios.post<NotificationInterface>(
    `${apiUrl}/create-notification`,
    noti,
    requestOptions
  );
  return response.data;
};



interface NotificationStatusUpdate {
  status: number; // ID ของ NotificationStatus
}

export const updateNotificationStatusByID = async (
  id: number,
  data: NotificationStatusUpdate
): Promise<NotificationInterface | any> => {
  try {
    const res = await axios.patch(
      `${apiUrl}/notification/${id}/status`,
      data,
      getRequestOptions() // ใช้ฟังก์ชันนี้
    );
    return res.data;
  } catch (error: any) {
    return error.response;
  }
};

export const sendWeeklySummary = async (): Promise<string | any> => {
  try {
    const res = await axios.get<{ message: string }>(
      `${apiUrl}/notification/send-weekly-summary`,
      getRequestOptions()
    );
    return res.data.message;
  } catch (error: any) {
    console.error("Failed to send weekly summary:", error);
    return error.response;
  }
};

export const sendRealtimeAlert = async (healthData: any): Promise<string | any> => {
  try {
    const res = await axios.post<{ message: string }>(
      `${apiUrl}/notification/check-realtime-alert`,
      healthData,
      getRequestOptions()
    );
    return res.data.message;
  } catch (error: any) {
    console.error("Failed to send realtime alert:", error);
    return error.response;
  }
};


// ไม่ต้องเขียน SSE function เพราะ React ใช้ EventSource
// แต่สามารถสร้างฟังก์ชันส่ง Notification ใหม่ให้ backend
export const sendNotification = async (notif: Partial<NotificationInterface>) => {
  const res = await axios.post(`${apiUrl}/create-notification/${notif.UserID}`, notif);
  return res.data;
};