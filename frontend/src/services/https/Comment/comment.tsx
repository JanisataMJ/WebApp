import axios from "axios";
import { CommentProps } from "../../../interface/commenty/comment";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// Create a new comment
async function CreateComment(data: Comment) {
  return await axios
    .post(`${apiUrl}/comments`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Get all comments
async function GetComments() {
  return await axios
    .get(`${apiUrl}/comments`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Get a comment by ID
async function GetCommentById(id: string) {
  return await axios
    .get(`${apiUrl}/comments/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetAllCommentByNId(id: string) {
  return await axios
    .get(`${apiUrl}/commentn/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}



// Get a list of comment IDs for a novel
export async function GetListofcommentID(novelID: string): Promise<number[]> {
  try {
    const response = await axios.get(`${apiUrl}/commentns/${novelID}`, requestOptions);
    return response.data.comment_ids; // Ensure this is an array of numbers
  } catch (error) {
    console.error("Error fetching comment IDs", error);
    throw error;
  }
}
// Count Comment by NovelID
export async function CountCommentByNovelID(novelID: string) {
  return await axios
  .get(`${apiUrl}/comments/count/${novelID}`, requestOptions)
  .then((res) => res)
  .catch((e) => e.response);
}
export async function GetCId(commentID: number): Promise<CommentProps> {
  try {
    const response = await axios.get(`${apiUrl}/comments/${commentID}`, requestOptions);
    const data = response.data.comment; // Adjust if the response structure differs

    return {
      ID: data.id,
      description: data.description,
      user_id: data.user_id,
      novel_id: data.novel_id,
      User: { // Ensure `User` is correctly populated
        user_name: data.user.user_name || "",
        profile: data.user.profile || "", // Default to empty string if not present
      },
    };
  } catch (error) {
    console.error("Error fetching novel details", error);
    throw error;
  }
}

export async function GetAllCommentByNoId(NovelID: number): Promise<CommentProps> {
  try {
    const response = await axios.get(`${apiUrl}/commentn/${NovelID}`, requestOptions);
    const data = response.data.comment; // Adjust if the response structure differs

    return {
      ID: data.id,
      description: data.description,
      user_id: data.user_id,
      novel_id: data.novel_id,
      User: { // Ensure `User` is correctly populated
        user_name: data.user.user_name || "",
        profile: data.user.profile || "", // Default to empty string if not present
      },
    };
  } catch (error) {
    console.error("Error fetching novel details", error);
    throw error;
  }
}

export async function GetCommentsByCID(commentID: number): Promise<CommentProps> {
  try {
    const response = await axios.get(`${apiUrl}/comments/${commentID}`, requestOptions);
    console.log("API Response:", response.data); // Log the response data

    const data = response.data.comment; // Assuming `response.data` is a single comment object

    return {
      ID: data.id, // Assuming `data` has an `id` field
      description: data.description,
      user_id: data.user_id,
      novel_id: data.novel_id,
      User: { // Ensure `User` is correctly populated
        user_name: data.user.user_name || "",
        profile: data.user.profile || "", // Default to empty string if not present
      },
    };
  } catch (error) {
    console.error("Error fetching comment", error);
    throw error;
  }
}


// Update a comment by ID
async function UpdateCommentById(id: string, data: Comment) {
  return await axios
    .put(`${apiUrl}/comments/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Delete a comment by ID
async function DeleteCommentById(id: string) {
  return await axios
    .delete(`${apiUrl}/comments/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  CreateComment,
  GetComments,
  GetCommentById,
  UpdateCommentById,
  DeleteCommentById,
};
