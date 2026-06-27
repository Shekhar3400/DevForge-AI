import axios from "./axios";

export const getModules = async (projectId) => {
  const response = await axios.get(`/modules/project/${projectId}`);
  return response.data;
};

export const createModule = async (module) => {
  const response = await axios.post("/modules", module);
  return response.data;
};

export const updateModule = async (id, module) => {
  const response = await axios.put(`/modules/${id}`, module);
  return response.data;
};

export const deleteModule = async (id) => {
  await axios.delete(`/modules/${id}`);
};