import axios, { AxiosRequestConfig } from "axios";
import { UsersInterface ,SignInInterface,InterfaceStatusWriter,InterfaceIncome} from "../../../interface/user_interface/IUser";

const apiUrl = "http://localhost:8000";

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// User Functions
async function SignIn(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/signin`, data, requestOptions)
  
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateUser(data: UsersInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


export async function CreateAdmin(formData: FormData) {
  return await axios
    .post(`${apiUrl}/create-admin`, formData)
    .then(res => res)
    .catch(e => e.response);
}


async function GetUsers() {
  return await axios
    .get(`${apiUrl}/users`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetUsersById(id: string) {
  return await axios
    .get(`${apiUrl}/user/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function UpdateUsersById(
  id: string,
  formData: FormData,
  config?: AxiosRequestConfig
) {
  try {
    const response = await axios.put(
      `${apiUrl}/user/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
          ...config?.headers, // รวม headers ที่ส่งมาเพิ่มเติม
        },
        ...config, // รวม config อื่น ๆ เช่น params, timeout
      }
    );
    return response;
  } catch (error: any) {
    return error.response;
  }
}


async function UpdateStatusWriterById(id: string, data: InterfaceStatusWriter) {
  return await axios
    .put(`${apiUrl}/user/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateIncomeById(id: string, data: InterfaceIncome) {
  return await axios
    .put(`${apiUrl}/user/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function updateIncome(
  x: number,
  userId: string,
  setIncome: React.Dispatch<React.SetStateAction<number>>
) {
  try {
    const getResponse = await GetUsersById(userId);

    if (getResponse.status !== 200) {
      throw new Error("Failed to fetch income data.");
    }

    const currentIncome = getResponse.data.income;

    // Add x to the current income
    const newIncome = currentIncome + x;

    // Ensure that the object matches InterfaceIncome, not UsersInterface
    const updateIncomeData: InterfaceIncome = {
      income: newIncome, // This matches InterfaceIncome
    };

    // Update the income
    const updateResponse = await UpdateIncomeById(userId, updateIncomeData);

    if (updateResponse.status !== 200) {
      throw new Error("Failed to update income.");
    }

    // Update the state with the new income value
    setIncome(newIncome);

    return updateResponse.data; // Return updated income data
  } catch (error) {
    console.error("Error updating income:", error);
    return null;
  }
}


async function updateIncomeReduce(
  x: number,
  userId: string,
  setIncome: React.Dispatch<React.SetStateAction<number | null>>
) {
  try {
    const getResponse = await GetUsersById(userId);

    if (getResponse.status !== 200) {
      throw new Error("Failed to fetch income data.");
    }

    const currentIncome = getResponse.data.income;

    // Add x to the current income
    const newIncome = currentIncome - x;

    // Ensure that the object matches InterfaceIncome, not UsersInterface
    const updateIncomeData: InterfaceIncome = {
      income: newIncome, // This matches InterfaceIncome
    };

    // Update the income
    const updateResponse = await UpdateIncomeById(userId, updateIncomeData);

    if (updateResponse.status !== 200) {
      throw new Error("Failed to update income.");
    }

    // Update the state with the new income value
    setIncome(newIncome);

    return updateResponse.data; // Return updated income data
  } catch (error) {
    console.error("Error updating income:", error);
    return null;
  }
}


async function DeleteUsersById(id: string) {
  return await axios
    .delete(`${apiUrl}/user/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  SignIn,
  CreateUser,
  GetUsers,
  GetUsersById,
  DeleteUsersById,
  UpdateStatusWriterById,
  UpdateIncomeById,
  updateIncome,
  updateIncomeReduce
};
