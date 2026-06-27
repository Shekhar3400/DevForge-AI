import axios from "./axios";

export const getArchitectures = async (projectId) => {
  const response = await axios.get(`/architectures/project/${projectId}`);
  return response.data;
};

export const createArchitecture = async (data) => {
  const response = await axios.post("/architectures", data);
  return response.data;
};
