import api from "./axios";

export const createOrderApi = async (payload) => {
  const response = await api.post("/orders", payload);
  return response.data;
};

export const getMyOrdersApi = async (params = {}) => {
  const response = await api.get("/orders/my", { params });
  return response.data;
};

export const getAllOrdersForAdminApi = async (params = {}) => {
  const response = await api.get("/orders/admin/all", { params });
  return response.data;
};

export const approveOrderApi = async (id) => {
  const response = await api.patch(`/orders/admin/${id}/approve`);
  return response.data;
};

export const rejectOrderApi = async (id, payload) => {
  const response = await api.patch(`/orders/admin/${id}/reject`, payload);
  return response.data;
};

export const assignOrderApi = async (id) => {
  const response = await api.patch(`/orders/admin/${id}/assign`);
  return response.data;
};

export const markDeliveredApi = async (id) => {
  const response = await api.patch(`/orders/my/${id}/deliver`);
  return response.data;
};


export const getOrderItemsApi = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/items`);
  return response.data;
};

export const getOrderInvoiceApi = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/invoice`);
  return response.data;
};