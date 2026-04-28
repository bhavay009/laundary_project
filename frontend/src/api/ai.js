import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── AI Intelligence Engine ───────────────────────────────────────────

export const getPricingSuggestions = async () => {
  const { data } = await api.get('/ai/pricing-suggestions');
  return data;
};

export const analyzeOrder = async (orderData) => {
  const { data } = await api.post('/ai/analyze-order', orderData);
  return data;
};

export const getBusinessInsights = async () => {
  const { data } = await api.get('/ai/business-insights');
  return data;
};

export const getDeliveryEstimate = async (garments) => {
  const { data } = await api.get('/ai/delivery-estimate', {
    params: { garments: JSON.stringify(garments) },
  });
  return data;
};
