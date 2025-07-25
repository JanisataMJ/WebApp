import axios from "axios";
import {  PackageInterface  } from "../../../../แดนโค้ดมรณา/interface"; 

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetPackages () {
  return await axios
    .get(`${apiUrl}/packages`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

  async function GetPackageById(id: string) {
    return await axios
      .get(`${apiUrl}/package/${id}`, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
  }

  
export {
    GetPackages,
    GetPackageById,
  };
  