import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/Auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/Auth/login", userData);
  return response.data;
};