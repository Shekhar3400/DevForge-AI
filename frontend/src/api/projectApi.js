import axios from "./axios";

export const getProjects = async () => {
  const response = await axios.get("/projects");
  return response.data;
};

export const createProject = async (project) => {
  const response = await axios.post("/projects", project);
  return response.data;
};

export const updateProject = async (id, project) => {
  const response = await axios.put(`/projects/${id}`, project);
  return response.data;
};

export const deleteProject = async (id) => {
  await axios.delete(`/projects/${id}`);
};