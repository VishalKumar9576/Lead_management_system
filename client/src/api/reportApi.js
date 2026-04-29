import api from "./axios";

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);

  if (filters.area) params.append("area_id", filters.area);
  if (filters.area_id) params.append("area_id", filters.area_id);

  if (filters.vendor) params.append("vendor_id", filters.vendor);
  if (filters.vendor_id) params.append("vendor_id", filters.vendor_id);

  if (filters.executive_id) params.append("executive_id", filters.executive_id);

  if (filters.status) params.append("status", filters.status);
  if (filters.payment_status) params.append("payment_status", filters.payment_status);
  if (filters.payment_mode) params.append("payment_mode", filters.payment_mode);
  if (filters.settlement_status) params.append("settlement_status", filters.settlement_status);
  if (filters.search) params.append("search", filters.search);

  return params.toString();
};

export const getExecutiveReportSummary = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/summary?${query}`);
  return response.data;
};

export const getExecutiveVendorSales = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/vendors?${query}`);
  return response.data;
};

export const getExecutiveAreaSales = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/areas?${query}`);
  return response.data;
};

export const getExecutiveDueReports = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/dues?${query}`);
  return response.data;
};

export const getExecutiveCommission = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/commission?${query}`);
  return response.data;
};

export const getExecutiveTopVendors = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/top-vendors?${query}`);
  return response.data;
};

export const getExecutiveDailyTrend = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/executive/daily-trend?${query}`);
  return response.data;
};



export const getAdminReportSummary = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/summary?${query}`);
  return response.data;
};

export const getAdminExecutivePerformance = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/executives?${query}`);
  return response.data;
};

export const getAdminAreaPerformance = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/areas?${query}`);
  return response.data;
};

export const getAdminDailyTrend = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/daily-trend?${query}`);
  return response.data;
};

export const getAdminDueAlerts = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/due-alerts?${query}`);
  return response.data;
};


export const getAdminVendorDueReport = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/vendor-dues?${query}`);
  return response.data;
};

export const getAdminOrderReport = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/orders?${query}`);
  return response.data;
};

export const getAdminPaymentReport = async (filters = {}) => {
  const query = buildQuery(filters);
  const response = await api.get(`/reports/admin/payments?${query}`);
  return response.data;
};