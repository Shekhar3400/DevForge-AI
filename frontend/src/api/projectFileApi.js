import axios from "./axios";

const base = (projectId) => `/projects/${projectId}/files`;

export const getProjectFiles      = (projectId) => axios.get(base(projectId)).then(r => r.data);
export const getFileChildren      = (projectId, parent="") => axios.get(`${base(projectId)}/children`, { params: { parent } }).then(r => r.data);
export const createProjectFile    = (projectId, payload) => axios.post(base(projectId), payload).then(r => r.data);
export const updateFileContent    = (projectId, fileId, content) => axios.patch(`${base(projectId)}/${fileId}/content`, { content }).then(r => r.data);
export const renameFile           = (projectId, fileId, name) => axios.patch(`${base(projectId)}/${fileId}/rename`, { name }).then(r => r.data);
export const deleteFile           = (projectId, fileId) => axios.delete(`${base(projectId)}/${fileId}`);
export const bulkCreateFiles      = (projectId, files) => axios.post(`${base(projectId)}/bulk`, files).then(r => r.data);

// ── AI Generator ────────────────────────────────────────────────────────────

/** Full AI workflow: analyze → design → connect nodes → generate files + code */
export const aiFullGenerate = (projectId, architectureId, prompt, projectName, existingFiles) =>
  axios.post("/ai-generator/full", { projectId, architectureId, prompt, projectName, existingFiles }).then(r => r.data);

/** Architecture-only: generate nodes + modules from description */
export const aiGenerateArchitecture = (projectId, architectureId, description) =>
  axios.post("/ai-generator/architecture", { projectId, architectureId, description }).then(r => r.data);

/** Auto-connect existing nodes with intelligent edges */
export const aiAutoConnect = (architectureId, archResult) =>
  axios.post("/ai-generator/connect", { architectureId, archResult }).then(r => r.data);

/** File structure generation */
export const aiGenerateFiles = (projectId, description, stack, existingFiles=[]) =>
  axios.post("/ai-generator/files", { projectId, description, stack, existingFiles }).then(r => r.data);

/** Analyze existing project */
export const aiAnalyzeProject = (projectId, files) =>
  axios.post("/ai-generator/analyze", { projectId, files }).then(r => r.data);

/** Smart single-file code generation (create or modify) */
export const aiGenerateFileCode = (projectId, fileId, filePath, currentContent, instruction) =>
  axios.post("/ai-generator/file-code", { projectId, fileId, filePath, currentContent, context: instruction, instruction }).then(r => r.data);
