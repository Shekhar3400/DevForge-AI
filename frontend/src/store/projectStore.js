import { create } from "zustand";

const useProjectStore = create((set) => ({
  projects: [],

  selectedProject: null,

  setProjects: (projects) =>
    set({
      projects,
    }),

  setSelectedProject: (project) =>
    set({
      selectedProject: project,
    }),
}));

export default useProjectStore;