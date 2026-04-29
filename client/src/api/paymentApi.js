import api from "./axios";

export const getAdminDueOrdersApi = async (params = {}) => {
  const response = await api.get("/payments/admin/due-orders", { params });
  return response.data;
};

export const getPaymentSummaryApi = async () => {
  const response = await api.get("/payments/admin/summary");
  return response.data;
};

export const getMyDueOrdersApi = async () => {
  const response = await api.get("/payments/my-dues");
  return response.data;
};