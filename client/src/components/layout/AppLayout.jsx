// client/src/components/layout/AppLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root layout shell for all protected app pages.
//
// - Sidebar (collapsible desktop / drawer mobile)
// - TopBar (fixed top navigation)
// - <Outlet /> for nested page content
//
// Collapsed state is persisted in localStorage so it survives page refreshes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@components/layout/Sidebar'
import TopBar  from '@components/layout/TopBar'

const STORAGE_KEY = 'devtrack:sidebar-collapsed'

export default function AppLayout() {
  const [collapsed,   setCollapsed]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) === true }
    catch { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed))
  }, [collapsed])

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* ── Main area: TopBar + page content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setMobileOpen((o) => !o)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
