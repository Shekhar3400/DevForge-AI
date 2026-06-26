import axios from "./axios";

export const getNodes = async (architectureId) => {
  const response = await axios.get(
    `/api/nodes/architecture/${architectureId}`
  );

  return response.data;
};

export const createNode = async (data) => {
  const response = await axios.post(
    "/api/nodes",
    data
  );

  return response.data;
};

export const updateNode = async (
  id,
  data
) => {
  const response = await axios.put(
    `/api/nodes/${id}`,
    data
  );

  return response.data;
};

export const deleteNode = async (id) => {
  await axios.delete(`/api/nodes/${id}`);
};