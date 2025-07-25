// bookshelfListService.tsx
import axios, { AxiosResponse } from "axios";
import { NCardPropsv,createboklist } from "../../../interface/bookey_interface/bookshelfs";

// Set up the base API URL and authorization tokens from local storage
const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

// Configure request headers with content type and authorization
const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// Type definitions for Axios responses
type ApiResponse<T> = AxiosResponse<T>;

// Function to create a new Bookshelf_List entry
export const CreateBookshelfList = async (
  data: createboklist
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(`${apiUrl}/bookshelf_list`, data, requestOptions);
    return response;
  } catch (error: any) {
    return error.response;
  }
};

// Function to fetch all Bookshelf_List entries
export const GetBookshelfLists = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`${apiUrl}/bookshelf_list`, requestOptions);
    return response;
  } catch (error: any) {
    return error.response;
  }
};

export const CountUniqueNovelsByBookshelfID = async (bookshelfId: string | null): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`${apiUrl}/bookshelves/${bookshelfId}/novelcount`, requestOptions);
    return response;
  } catch (error: any) {
    return error.response;
  }
};

// Function to fetch a single Bookshelf_List entry by ID
export const GetBookshelfListById = async (
  id: string | null
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`${apiUrl}/bookshelf_list/${id}`, requestOptions);
    return response;
  } catch (error: any) {
    return error.response;
  }
};

// Fetch a list of novels by their IDs
// src/services/https/Bookshelf/bookshelf.ts
export async function GetListofnovelID(bookshelfID: string | null): Promise<number[]> {
  try {
    const response = await axios.get(`${apiUrl}/booknovel/${bookshelfID}`, requestOptions);
    return response.data.novel_ids; // Ensure this is an array of numbers
  } catch (error) {
    console.error("Error fetching novel IDs", error);
    throw error;
  }
}

export async function GetNovelById(novelID: number): Promise<NCardPropsv> {
  try {
    const response = await axios.get(`${apiUrl}/novel/${novelID}`, requestOptions);
    const data = response.data.novel; // Adjust if the response structure differs

    return {
      id: data.ID,
      name: data.novel_name,
      content: data.content,
      description: data.description,
      type_1: data.novel_type1,
      type_2: data.novel_type2,
      rate: data.rate,
      writer_name: data.writername,
      cover: data.cover,
      price: data.price,
      likes: data.novel_like,
      buyAmount: data.buyAmount,
      writer_id: data.writer_id,
    };
  } catch (error) {
    console.error("Error fetching novel details", error);
    throw error;
  }
}



// Function to update a Bookshelf_List entry by ID
export const UpdateBookshelfListById = async (
  id: string,
  data: NCardPropsv
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(`${apiUrl}/bookshelf_list/${id}`, data, requestOptions);
    return response;
  } catch (error: any) {
    return error.response;
  }
};

// Function to delete a Bookshelf_List entry by ID
export const DeleteBookshelfListById = async (
  id: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete(`${apiUrl}/bookshelf_list/${id}`, requestOptions);
    return response;
  } catch (error: any) {
    return error.response;
  }
};



const hasNovelId = (data: NovelData[], targetId: number): string => {
    const hasId = data.some(item => item.novel_id === targetId);
    return hasId ? 'true' : 'false';
  };
  
type NovelData = {
    novel_id: number;
  };

export const checkNovelIdInBookshelf = async (id: string | null, targetId: number): Promise<string> => {
    try {
      const response = await GetBookshelfListById(id);
      if (response.status === 200) {
        const data: NovelData[] = response.data;
        return hasNovelId(data, targetId);
      } else {
        return "เกิดข้อผิดพลาดในการดึงข้อมูล";
      }
    } catch (error) {
      return "เกิดข้อผิดพลาดในการดึงข้อมูล";
    }
  };