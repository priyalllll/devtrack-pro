// client/src/store/dashboardStore.js
// ─────────────────────────────────────────────────────────────────────────────
// Zustand dashboard invalidation store.
//
// Any page (Tasks, Projects) imports { useDashboardStore } and calls
// invalidate() after a CRUD mutation. The DashboardPage listens via a
// version counter and re-fetches when it increments.
//
// This avoids prop-drilling and duplicated API calls. The dashboard
// only refetches when something has actually changed.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'

export const useDashboardStore = create((set) => ({
  // Incremented every time a Task or Project mutation occurs.
  // DashboardPage useEffect depends on this value.
  version: 0,

  invalidate: () => set((state) => ({ version: state.version + 1 })),
}))
