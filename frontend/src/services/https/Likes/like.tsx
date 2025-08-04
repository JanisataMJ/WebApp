import axios from "axios";
import { Like } from "../../../interface/like_interface/like";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  }
};

// Like Service Functions

// Create a new like
async function CreateLike(data: Like) {
  return await axios
    .post(`${apiUrl}/likes`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Get all likes
async function GetLikes() {
  return await axios
    .get(`${apiUrl}/likes`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Get a like by ID
async function GetLikeById(id: string) {
  return await axios
    .get(`${apiUrl}/likes/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Update a like by ID
async function UpdateLikeStatus(userId: string, novelId: string, data: Like) {
  return await axios
    .put(`${apiUrl}/likes?user_id=${userId}&novel_id=${novelId}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Delete a like by ID
async function DeleteLikeByNIdandUId(userId: string | null, novelId: number) {
  return await axios
    .delete(`${apiUrl}/likes?user_id=${userId}&novel_id=${novelId}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function Flike(userId: string, novelId: string) {
  return await axios
    .get(`${apiUrl}/find-like?user_id=${userId}&novel_id=${novelId}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function CountLikeByNovelID(novelID: string) {
  return await axios
  .get(`${apiUrl}/likes/count/${novelID}`, requestOptions)
  .then((res) => res)
  .catch((e) => e.response);
}

// Toggle like (add/remove based on existence)
async function ToggleLike(novelId: string, userId: string) {
  return await axios
    .post(`${apiUrl}/like/toggle`, { novelId, userId }, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export const FindLikeByUserAndNovelId = async (novelId: string, userId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/likes/${novelId}`, {
      params: {
        user_id: userId,
      },
    });
    return response.data; // Return the data from the API
  } catch (error) {
    console.error("Error fetching like status:", error);
    return null;
  }
};

export {
  CreateLike,
  GetLikes,
  GetLikeById,
  UpdateLikeStatus,
  DeleteLikeByNIdandUId,
  ToggleLike,
};
