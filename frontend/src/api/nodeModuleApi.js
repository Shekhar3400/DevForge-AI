import axios from "./axios";

// ── Node Modules ────────────────────────────────────────────────────────────

export const getNodeModules = (nodeId) =>
  axios.get(`/node-modules/node/${nodeId}`).then((r) => r.data);

export const createNodeModule = (nodeId, name) =>
  axios.post(`/node-modules/node/${nodeId}`, { name }).then((r) => r.data);

export const renameNodeModule = (id, name) =>
  axios.patch(`/node-modules/${id}`, { name }).then((r) => r.data);

export const deleteNodeModule = (id) =>
  axios.delete(`/node-modules/${id}`);

// ── Node Features ───────────────────────────────────────────────────────────

export const getNodeFeatures = (moduleId) =>
  axios.get(`/node-modules/${moduleId}/features`).then((r) => r.data);

export const createNodeFeature = (moduleId, name, description = "") =>
  axios.post(`/node-modules/${moduleId}/features`, { name, description }).then((r) => r.data);

export const renameNodeFeature = (id, name, description) =>
  axios.patch(`/node-modules/features/${id}`, { name, description }).then((r) => r.data);

export const deleteNodeFeature = (id) =>
  axios.delete(`/node-modules/features/${id}`);
