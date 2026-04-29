import api from "./axios";

export const createExecutiveApi = async (payload) => {
  const response = await api.post("/executives", payload);
  return response.data;
};

export const getAllExecutivesApi = async (params = {}) => {
  const response = await api.get("/executives", { params });
  return response.data;
};

export const assignExecutiveAreaApi = async (payload) => {
  const response = await api.post("/executives/assign-area", payload);
  return response.data;
};

export const getExecutiveAreaMappingsApi = async () => {
  const response = await api.get("/executives/area-mappings");
  return response.data;
};

export const getExecutivePerformanceListApi = async (params = {}) => {
  const response = await api.get("/executives/performance", { params });
  return response.data;
};

export const getExecutiveDetailsForAdminApi = async (id) => {
  const response = await api.get(`/executives/${id}/details`);
  return response.data;
};