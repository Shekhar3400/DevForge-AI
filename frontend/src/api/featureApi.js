import axios from "./axios";

export const getFeatures = async (moduleId) => {
  const response = await axios.get(`/features/module/${moduleId}`);
  return response.data;
};

export const createFeature = async (data) => {
  const response = await axios.post("/features", data);
  return response.data;
};

export const deleteFeature = async (id) => {
  await axios.delete(`/features/${id}`);
};