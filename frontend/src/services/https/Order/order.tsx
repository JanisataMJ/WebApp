import axios from "axios";
import { OrderInterface } from "../../../interface/order_interface/IOrder";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// Order Functions
async function CreateOrder(data: OrderInterface) {
  return await axios
    .post(`${apiUrl}/order`, data, requestOptions)
    .then((res) => res.data)  // Access the `data` field directly
    .catch((e) => e.response?.data);  // Handle errors by returning only the error response data
}
  
  async function GetOrders() {
    return await axios
      .get(`${apiUrl}/orders`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function GetOrderById(id: string) {
    return await axios
      .get(`${apiUrl}/order/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function UpdateOrderById(id: string, data: OrderInterface) {
    return await axios
      .put(`${apiUrl}/order/${id}`, data, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function DeleteOrderById(id: string) {
    return await axios
      .delete(`${apiUrl}/order/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  export {
    CreateOrder,
    GetOrders,
    GetOrderById,
    UpdateOrderById,
    DeleteOrderById
  };
  