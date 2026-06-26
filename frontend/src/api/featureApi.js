import axios from "./axios";

export const getFeatures = async (moduleId) => {
  const response = await axios.get(
    `/api/features/module/${moduleId}`
  );

  return response.data;
};

export const createFeature = async (data) => {
  const response = await axios.post(
    "/api/features",
    data
  );

  return response.data;
};

export const deleteFeature = async (id) => {
  await axios.delete(`/api/features/${id}`);
};