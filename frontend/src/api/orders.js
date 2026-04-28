import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Orders ───────────────────────────────────────────────────────────

export const getOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const updateOrder = async (id, orderData) => {
  const { data } = await api.put(`/orders/${id}`, orderData);
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await api.delete(`/orders/${id}`);
  return data;
};

// ─── Dashboard ────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getRevenueTrend = async () => {
  const { data } = await api.get('/dashboard/revenue-trend');
  return data;
};

export const getTopGarments = async () => {
  const { data } = await api.get('/dashboard/top-garments');
  return data;
};

export const getTodayStats = async () => {
  const { data } = await api.get('/dashboard/today');
  return data;
};

