import axios from "axios";
import { CoinInterface } from "../../../../แดนโค้ดมรณา/interface";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};




// Coin Functions
async function GetCoins() {
    return await axios
      .get(`${apiUrl}/coins`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function GetCoinById(id: string | null) {
    return await axios
      .get(`${apiUrl}/coin/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function UpdateCoinById(id: string|null, data: CoinInterface) {
    return await axios
      .put(`${apiUrl}/coins/${id}`, data, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function DeleteCoinById(id: string) {
    return await axios
      .delete(`${apiUrl}/coins/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }
  
  async function updateCoinBalance(x: number, setBalance: React.Dispatch<React.SetStateAction<number>>) {
    try {
      // Step 1: Get the current coin balance
      const userId = localStorage.getItem("id");
      const getResponse = await GetCoinById(userId);
  
      if (getResponse.status !== 200) {
        throw new Error("Failed to fetch coin data.");
      }
  
      const currentBalance = getResponse.data.balance;
  
      // Step 2: Add x to the current balance
      const newBalance = currentBalance + x;
  
      // Prepare the data for updating the coin balance
      const updateData: CoinInterface = {
        ...getResponse.data, // Spread existing data
        balance: newBalance, // Update the balance with the new value
      };
  
      // Step 3: Update the coin balance
      const updateResponse = await UpdateCoinById(userId, updateData);
  
      if (updateResponse.status !== 200) {
        throw new Error("Failed to update coin balance.");
      }
  
      // Update the state with the new balance to reflect it in the UI
      setBalance(newBalance);
  
      return updateResponse.data; // Return the updated coin data
    } catch (error) {
      console.error("Error updating coin balance:", error);
      return null;
    }
  
  }

  async function updateCoinBalanceReduce(x: number, setBalance: React.Dispatch<React.SetStateAction<number>>) {
    try {
      // Step 1: Get the current coin balance
      const userId = localStorage.getItem("id");
      const getResponse = await GetCoinById(userId);
  
      if (getResponse.status !== 200) {
        throw new Error("Failed to fetch coin data.");
      }
  
      const currentBalance = getResponse.data.balance;
  
      // Step 2: Add x to the current balance
      const newBalance = currentBalance - x;
  
      // Prepare the data for updating the coin balance
      const updateData: CoinInterface = {
        ...getResponse.data, // Spread existing data
        balance: newBalance, // Update the balance with the new value
      };
  
      // Step 3: Update the coin balance
      const updateResponse = await UpdateCoinById(userId, updateData);
  
      if (updateResponse.status !== 200) {
        throw new Error("Failed to update coin balance.");
      }
  
      // Update the state with the new balance to reflect it in the UI
      setBalance(newBalance);
  
      return updateResponse.data; // Return the updated coin data
    } catch (error) {
      console.error("Error updating coin balance:", error);
      return null;
    }
  
  }


export {
    GetCoins,
    GetCoinById,
    UpdateCoinById,
    DeleteCoinById,
    updateCoinBalance,
    updateCoinBalanceReduce
};