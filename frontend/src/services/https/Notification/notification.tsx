import axios from "axios";
import { NotificationInterface } from "../../../interface/notification_interface/notification";

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


// GET Notifications by user ID
export const getNotificationByUserID = async (
  userId: number
): Promise<NotificationInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<NotificationInterface[]>(
      `${apiUrl}/notification/${userId}`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching notifications: " + (error as Error).message);
  }
};


// CREATE Notification
export const createNotification = async (
  noti: Omit<NotificationInterface, "ID">
): Promise<NotificationInterface> => {
  try {
    const requestOptions = postRequestOptions(noti);
    const response = await fetch(`${apiUrl}/notifications`, requestOptions);
    if (!response.ok) {
      throw new Error("Error creating notification");
    }
    const data: NotificationInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Error creating notification: " + (error as Error).message);
  }
};


// DELETE Notification by ID
/*export const deleteNotification = async (notiId: number): Promise<void> => {
  try {
    const requestOptions = getRequestOptions();
    await axios.delete(`${apiUrl}/notifications/${notiId}`, requestOptions);
  } catch (error) {
    throw new Error("Error deleting notification: " + (error as Error).message);
  }
};*/
