import axios from "./axios";

export const getEdges = (architectureId) =>
  axios.get(`/edges/architecture/${architectureId}`).then(r => r.data);

export const createEdge = (edge) =>
  axios.post("/edges", edge).then(r => r.data);

export const updateEdge = (id, updates) =>
  axios.patch(`/edges/${id}`, updates).then(r => r.data);

export const deleteEdge = (id) =>
  axios.delete(`/edges/${id}`);
