import axios from "./axios";

export const getProjectContext = async (projectId) => {
  const response = await axios.get(`/context/project/${projectId}`);
  return response.data;
};

export const regenerateContext = async (projectId) => {
  const response = await axios.post(`/context/project/${projectId}/regenerate`);
  return response.data;
};
