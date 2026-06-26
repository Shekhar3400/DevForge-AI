import axios from "./axios";

export const getEdges = async (architectureId) => {
  const response = await axios.get(
    `/api/edges/architecture/${architectureId}`
  );

  return response.data;
};

export const createEdge = async (data) => {
  const response = await axios.post(
    "/api/edges",
    data
  );

  return response.data;
};

export const deleteEdge = async (id) => {
  await axios.delete(`/api/edges/${id}`);
};