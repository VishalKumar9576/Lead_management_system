import api from "./axios";

export const adminLoginApi = async (payload) => {
  const response = await api.post("/auth/admin/login", payload);
  return response.data;
};

export const executiveLoginApi = async (payload) => {
  const response = await api.post("/auth/executive/login", payload);
  return response.data;
};

export const getMyProfileApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};