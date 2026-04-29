import api from "./axios";

export const createVendorApi = async (formData) => {
  const response = await api.post("/vendors", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMyVendorsApi = async (params = {}) => {
  const response = await api.get("/vendors/my", { params });
  return response.data;
};

export const getAllVendorsForAdminApi = async (params = {}) => {
  const response = await api.get("/vendors/admin/all", { params });
  return response.data;
};


export const getMyVendorByIdApi = async (id) => {
  const response = await api.get(`/vendors/my/${id}`);
  return response.data;
};

export const getMyVendorOrdersApi = async (id) => {
  const response = await api.get(`/vendors/my/${id}/orders`);
  return response.data;
};

export const getMyVendorPaymentsApi = async (id) => {
  const response = await api.get(`/vendors/my/${id}/payments`);
  return response.data;
};

export const updateMyVendorApi = async (id, formData) => {
  const response = await api.put(`/vendors/my/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteMyVendorApi = async (id) => {
  const response = await api.delete(`/vendors/my/${id}`);
  return response.data;
};