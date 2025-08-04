import axios from "axios";
import { ITransaction,ICreTransaction } from "../../../interface/transaction_interface/ITransaction";

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
async function CreateTransaction(data: ICreTransaction) {
    return await axios
      .post(`${apiUrl}/transaction`, data, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function GetTransactions() {
    return await axios
      .get(`${apiUrl}/transactions`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function GetTransacUserID(user_id: string) {
    try {
      const response = await axios.get(`${apiUrl}/transactionbyuser/${user_id}`, requestOptions);
      return response.data; 
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error; 
    }
  }
  
  async function GetTransactionById(id: string | null) {
    try {
      const response = await axios.get(`${apiUrl}/transaction/${id}`, requestOptions);
      const data = response.data;
  
      // Extract the desired fields
      const result = {
        trans_type: data.trans_type,
        payment: data.payment,
        pack_amount: data.Package.pack_amount,
        Name: data.Order.Novel.Name,
      };
  
      return result;
    } catch (error) {
      return "ไม่มีข้อมูลจ้า";
    }
  }
  
  
  async function UpdateTransactionById(id: string, data: ITransaction) {
    return await axios
      .put(`${apiUrl}/transaction/${id}`, data, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function DeleteTransactionById(id: string) {
    return await axios
      .delete(`${apiUrl}/transaction/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }

  export {
    CreateTransaction,
    GetTransactions,
    GetTransactionById,
    UpdateTransactionById,
    DeleteTransactionById,
    GetTransacUserID,
  };
  