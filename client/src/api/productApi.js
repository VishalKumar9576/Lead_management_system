import api from "./axios";

export const getExecutiveProductsApi = async (params = {}) => {
  const response = await api.get("/products/executive", { params });
  return response.data;
};