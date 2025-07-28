import axios from "axios";
import { MoodDataInterface } from "../../../interface/mooddata_interface/mooddata";

const apiUrl = "http://localhost:8000";
const getRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const deleteRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const formDataRequestOptions = (method: string, formData: FormData) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");

  return {
    method: method,
    headers: {
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: formData,
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

export const getCalendars = async (): Promise<MoodDataInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<MoodDataInterface[]>(
      `${apiUrl}/calendar`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching calendars: " + (error as Error).message);
  }
};

export const createCalendar = async (
  calendar: Omit<MoodDataInterface, "id">
): Promise<MoodDataInterface> => {
  try {
    const requestOptions = postRequestOptions(calendar);
    const response = await fetch(`${apiUrl}/create-calendar`, requestOptions);
    if (!response.ok) {
      throw new Error("Error creating calendar");
    }
    const data: MoodDataInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw new Error("Error creating calendar: " + (error as Error).message);
  }
};

export const deleteCalendar = async (calendarId: number): Promise<void> => {
  try {
    const requestOptions = deleteRequestOptions();

    await axios.delete(
      `${apiUrl}/delete-calendar/${calendarId}`,
      requestOptions
    );
  } catch (error) {
    throw new Error("Error deleting calendar: " + (error as Error).message);
  }
};