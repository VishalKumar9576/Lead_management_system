import api from "./axios";

export const getExecutiveProductsApi = async (params = {}) => {
  const response = await api.get("/products/executive", { params });
  return response.data;
};

export const getAdminProductsApi = async (params = {}) => {
  const response = await api.get("/products/admin", { params });
  return response.data;
};

export const createProductApi = async (payload) => {
  const response = await api.post("/products/admin", payload);
  return response.data;
};

export const updateProductApi = async (id, payload) => {
  const response = await api.put(`/products/admin/${id}`, payload);
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await api.delete(`/products/admin/${id}`);
  return response.data;
};