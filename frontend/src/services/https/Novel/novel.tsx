import axios from "axios";
import { NovelBuy } from "../../../interface/novel_interface/INovel";
import { NovelCre } from "../../../interface/novel_interface/INovelCre";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};


// Transaction Functions
async function CreateNovel(data: NovelCre) {
  console.log('Data being sent to backend:', data); 
    return await axios
      .post(`${apiUrl}/novel`, data, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
 
  async function GetNovels() {
    return await axios
      .get(`${apiUrl}/novels`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }

  async function GetPublicNovels() {
    return await axios
      .get(`${apiUrl}/public-novels`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }

  

  async function GetNovelByUser(id: string) {
    return await axios
      .get(`${apiUrl}/novels/writer/${id}`, requestOptions) // ตรวจสอบว่า URL ตรงกับที่ backend กำหนดไว้
      .then((res) => res)
      .catch((e) => {
        console.error("Error response:", e.response);
        return e.response;
      });
  }
  


  async function UpdateNovelById(id: string, data: NovelBuy) {
    return await axios
    .put(`${apiUrl}/novel_update/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
  }
  
  
  async function DeleteNovelById(id: string) {
    return await axios
      .delete(`${apiUrl}/novel/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }

  async function GetNovelById(id: string) {
    return await axios
      .get(`${apiUrl}/novel/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }

  async function GetNovelByIdd(id: string) {
    return await axios
      .get(`${apiUrl}/novel/${id}`, requestOptions)
      .then((res) => res.data) // Assuming the novel data is in `res.data`
      .catch((e) => e.response);
  }

  async function IncrementNovelBuyAmount(id: string) {
   
      const response = await GetNovelByIdd(id);
  
      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (!response || !response.novel) {
        throw new Error("Novel data is undefined or incorrect structure");
      }
  
      const novel = response.novel;
      const BuyAmount = novel.buy_amount + 1 ;
      const ID =novel.ID;
      
    
      const updateData: NovelBuy = {
        ...response.novel, 
        buy_amount: BuyAmount, 
      };
      UpdateNovelById( ID, updateData);
  
    
}
  
  export {
    CreateNovel,
    GetNovels,
    GetNovelById,
    GetNovelByUser,
    UpdateNovelById,
    DeleteNovelById,
    GetPublicNovels,
    IncrementNovelBuyAmount,
    GetNovelByIdd
  };