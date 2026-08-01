// client/src/components/layout/Sidebar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed collapsible sidebar.
// Desktop: 260px (expanded) ↔ 72px (icon-only), persisted in localStorage.
// Mobile:  hidden by default, slides in as a drawer overlay when mobileOpen=true.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import clsx from 'clsx'

// ── Navigation Items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    to: '/tasks',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Kanban',
    to: '/kanban',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const BOTTOM_ITEMS = [
  {
    label: 'Profile',
    to: '/profile',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'text-sm font-medium transition-all duration-150 cursor-pointer',
          isActive
            ? 'bg-primary-500/15 text-primary-400'
            : 'text-slate-400 hover:bg-surface-700/60 hover:text-slate-200',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-r-full" />
          )}

          <span className={clsx(isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-slate-200')}>
            {item.icon}
          </span>

          <span
            className={clsx(
              'whitespace-nowrap transition-all duration-300 overflow-hidden',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            {item.label}
          </span>

          {/* Tooltip on collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-700 text-white text-xs rounded-lg
                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150
                            whitespace-nowrap shadow-lg border border-surface-600 z-50">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { logout, isPending } = useAuth()

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* ── Logo + Collapse Button ── */}
      <div className={clsx(
        'flex items-center h-16 px-3 border-b border-surface-700/50 flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between',
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-glow flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm tracking-tight truncate">
              DevTrack <span className="text-primary-400">Pro</span>
            </span>
          </div>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-glow">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        )}

        {/* Desktop collapse toggle */}
        {!collapsed && (
          <button
            id="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-500
                       hover:bg-surface-700 hover:text-slate-300 transition-all duration-150 flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        {collapsed && (
          <button
            id="sidebar-expand-btn"
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-surface-700 border border-surface-600
                       rounded-full items-center justify-center text-slate-400 hover:text-white
                       hover:bg-surface-600 transition-all duration-150 shadow-md"
            aria-label="Expand sidebar"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Main Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-widest">
            Menu
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onClick={onCloseMobile}
          />
        ))}
      </nav>

      {/* ── Bottom: Profile, Settings, Logout ── */}
      <div className="border-t border-surface-700/50 py-3 px-2 space-y-0.5 flex-shrink-0">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-widest">
            Account
          </p>
        )}
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onClick={onCloseMobile}
          />
        ))}

        {/* Logout */}
        <button
          id="sidebar-logout-btn"
          onClick={logout}
          disabled={isPending}
          title={collapsed ? 'Logout' : undefined}
          className={clsx(
            'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full',
            'text-sm font-medium transition-all duration-150 cursor-pointer',
            'text-slate-400 hover:bg-red-500/10 hover:text-red-400',
          )}
        >
          <svg className="w-5 h-5 flex-shrink-0 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={clsx(
            'whitespace-nowrap transition-all duration-300 overflow-hidden',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}>
            {isPending ? 'Logging out…' : 'Logout'}
          </span>
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-700 text-white text-xs rounded-lg
                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150
                            whitespace-nowrap shadow-lg border border-surface-600 z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col relative flex-shrink-0',
          'bg-surface-900 border-r border-surface-700/50',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      {/* Drawer */}
      <aside
        className={clsx(
          'lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-surface-900 border-r border-surface-700/50 w-[260px]',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
