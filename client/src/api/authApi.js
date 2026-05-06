import api from "./axios";

export const adminLoginApi = async (payload) => {
  const response = await api.post("/auth/admin/login", payload);
  return response.data;
};

export const executiveLoginApi = async (payload) => {
  const response = await api.post("/auth/executive/login", payload);
  return response.data;
};

export const executiveRegisterApi = async (payload) => {
  const response = await api.post("/auth/executive/register", payload);
  return response.data;
};

export const registerApi = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const getMyProfileApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
