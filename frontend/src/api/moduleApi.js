import axios from "./axios";

export const getModules = async (projectId) => {
  const response = await axios.get(
    `/api/modules/project/${projectId}`
  );
  return response.data;
};

export const createModule = async (data) => {
  const response = await axios.post(
    "/api/modules",
    data
  );
  return response.data;
};