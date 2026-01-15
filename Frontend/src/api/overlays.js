import axios from 'axios';

const API_BASE_URL = '/api';

export const createOverlay = async (overlayData) => {
  const response = await axios.post(`${API_BASE_URL}/overlays`, overlayData);
  return response.data.overlay;
};

export const getOverlays = async () => {
  const response = await axios.get(`${API_BASE_URL}/overlays`);
  return response.data.overlays;
};

export const updateOverlay = async (id, updates) => {
  const response = await axios.put(`${API_BASE_URL}/overlays/${id}`, updates);
  return response.data.overlay;
};

export const deleteOverlay = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/overlays/${id}`);
  return response.data;
};

export const deleteAllOverlays = async () => {
  const response = await axios.delete(`${API_BASE_URL}/overlays`);
  return response.data;
};
