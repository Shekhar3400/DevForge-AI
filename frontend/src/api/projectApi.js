import axios from "./axios";

export const getProjects = async () => {
  const response = await axios.get("/api/projects");
  return response.data;
};

export const createProject = async (project) => {
  const response = await axios.post(
    "/api/projects",
    project
  );

  return response.data;
};

export const deleteProject = async (id) => {
  await axios.delete(`/api/projects/${id}`);
};