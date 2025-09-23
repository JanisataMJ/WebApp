import axios from "axios";
import { ArticleInterface } from "../../../interface/article_interface/article";

const apiUrl = "http://localhost:8000"; // เปลี่ยนตาม backend จริง

// ====== Utils ======
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

const postOrPutRequestOptions = (body: any) => {
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


// CREATE Article
export const createArticle = async (
  id: number,
  article: FormData
): Promise<ArticleInterface> => {
  const token = localStorage.getItem("token");
  const type = localStorage.getItem("token_type"); // e.g., "Bearer"

  const response = await fetch(`${apiUrl}/create-article/${id}`, {
    method: "POST",
    body: article, // FormData
    headers: token ? { Authorization: `${type} ${token}` } : undefined,
    // ❌ ไม่ต้องตั้ง Content-Type เอง
  });

  if (!response.ok) {
    const errorText = await response.text(); // อ่าน error จาก backend
    throw new Error("Error creating article: " + errorText);
  }

  const data: ArticleInterface = await response.json();
  return data;
};




// GET All Articles
/*export const getAllArticles = async (): Promise<ArticleInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<ArticleInterface[]>(`${apiUrl}/list-article`, requestOptions);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching articles: " + (error as Error).message);
  }
};*/

export const getAllArticles = async (): Promise<ArticleInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<ArticleInterface[]>(
      `${apiUrl}/list-article`,
      requestOptions
    );

    return response.data; // ใช้ข้อมูลตรง ๆ เลย
  } catch (error: any) {
    throw new Error("Error fetching articles: " + error.message);
  }
};


// PUT update order
/* export const updateArticleOrder = async (
  updatedArticles: ArticleInterface[]
): Promise<void> => {
  try {
    const requestOptions = getRequestOptions();
    await axios.put(`${apiUrl}/order-articles`, updatedArticles, requestOptions);
  } catch (error: any) {
    throw new Error("Error updating article order: " + error.message);
  }
}; */


// GET Article by ID
export const getArticleByID = async (id: number): Promise<ArticleInterface> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<ArticleInterface>(`${apiUrl}/article/${id}`, requestOptions);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching article: " + (error as Error).message);
  }
};

// UPDATE Article
export const updateArticle = async (
  id: number,
  formData: FormData
): Promise<ArticleInterface> => {
  try {
    const Authorization = localStorage.getItem("token");
    const Bearer = localStorage.getItem("token_type");

    const response = await axios.put<ArticleInterface>(
      `${apiUrl}/update-article/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${Bearer} ${Authorization}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Error updating article: " + (error as Error).message);
  }
};


// PUBLISH Article Now
export const publishArticleNow = async (id: number): Promise<ArticleInterface> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.put<ArticleInterface>(
      `${apiUrl}/article/${id}/publishArticleNow`,
      {}, // body ว่าง
      requestOptions
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error publishing article: " + error.message);
  }
};

// UNPUBLISH Article
export const unpublishArticle = async (id: number): Promise<ArticleInterface> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.put<ArticleInterface>(
      `${apiUrl}/article/${id}/unpublishArticle`,
      {}, // body ว่าง
      requestOptions
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Error unpublishing article: " + error.message);
  }
};


// DELETE Article
export const deleteArticle = async (id: number): Promise<void> => {
  try {
    const requestOptions = getRequestOptions();
    await axios.delete(`${apiUrl}/delete-article/${id}`, requestOptions);
  } catch (error) {
    throw new Error("Error deleting article: " + (error as Error).message);
  }
};
