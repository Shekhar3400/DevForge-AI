import { create } from "zustand";

/**
 * Global UI state — search, notifications, activity feed.
 * Keeps these concerns out of individual page components.
 */
const useUiStore = create((set, get) => ({
  // ── Global search ──────────────────────────────────────────────────────────
  searchOpen: false,
  searchQuery: "",
  openSearch:  ()    => set({ searchOpen: true }),
  closeSearch: ()    => set({ searchOpen: false, searchQuery: "" }),
  setSearch:   (q)   => set({ searchQuery: q }),

  // ── Activity feed ─────────────────────────────────────────────────────────
  // Each entry: { id, type, message, time }
  activities: [],
  addActivity: (type, message) =>
    set((s) => ({
      activities: [
        { id: Date.now(), type, message, time: new Date().toISOString() },
        ...s.activities.slice(0, 49), // keep last 50
      ],
    })),
  clearActivities: () => set({ activities: [] }),
}));

export default useUiStore;
