import axios from "./axios";

export const registerUser = async (data) => {
  const response = await axios.post("/api/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axios.post("/api/auth/login", data);
  return response.data;
};