import api from "./axios";

export const createAreaApi = async (payload) => {
  const response = await api.post("/areas", payload);
  return response.data;
};

export const getAllAreasApi = async () => {
  const response = await api.get("/areas");
  return response.data;
};

export const getAreaCoverageStatsApi = async () => {
  const response = await api.get("/areas/admin/stats");
  return response.data;
};