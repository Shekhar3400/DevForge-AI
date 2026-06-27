import axios from "./axios";

export const getNodes = async (architectureId) => {
  const response = await axios.get(`/nodes/architecture/${architectureId}`);
  return response.data;
};

export const createNode = async (node) => {
  const response = await axios.post("/nodes", node);
  return response.data;
};

export const updateNode = async (id, updates) => {
  const response = await axios.patch(`/nodes/${id}`, updates);
  return response.data;
};

export const deleteNode = async (id) => {
  await axios.delete(`/nodes/${id}`);
};