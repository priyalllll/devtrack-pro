// client/src/components/layout/TopBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed top navigation bar with Notification System dropdown & user profile menu.
// Handles real-time notifications: TASK_ASSIGNED, TASK_COMPLETED,
// DEADLINE_APPROACHING, PROJECT_INVITED, PROJECT_UPDATED.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { useAuth }      from '@hooks/useAuth'
import * as notifService from '@services/notification.service'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/kanban':    'Kanban Board',
  '/analytics': 'Analytics',
  '/profile':   'Profile',
  '/settings':  'Settings',
}

const NOTIF_ICONS = {
  TASK_ASSIGNED:        { icon: '📋', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  TASK_COMPLETED:       { icon: '✅', bg: 'bg-green-500/15 text-green-400 border-green-500/30' },
  DEADLINE_APPROACHING: { icon: '⏰', bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
  PROJECT_INVITED:      { icon: '👥', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  PROJECT_UPDATED:      { icon: '📂', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
}

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function TopBar({ onToggleSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user }  = useAuthStore()
  const { logout, isPending } = useAuth()

  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const notifRef = useRef(null)

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'DevTrack Pro'

  // Fetch real notifications from API
  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true)
    try {
      const res = await notifService.getNotifications()
      const list = res.data.data.notifications ?? []
      const count = res.data.data.unreadCount ?? 0
      setNotifications(list)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoadingNotifs(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle notification panel
  const handleToggleNotif = () => {
    setNotifOpen((prev) => !prev)
    if (!notifOpen) {
      fetchNotifications()
    }
  }

  // Mark single as read & navigate
  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notifService.markAsRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch (err) {
        console.error('Failed to mark notification read:', err)
      }
    }
    if (notif.link) {
      setNotifOpen(false)
      navigate(notif.link)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notifService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications read:', err)
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 sm:px-6
                       bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50
                       flex-shrink-0">

      {/* ── Mobile sidebar toggle ── */}
      <button
        id="topbar-menu-btn"
        onClick={onToggleSidebar}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
                   text-slate-400 hover:bg-surface-700 hover:text-slate-200
                   transition-all duration-150"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Page title ── */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base font-semibold text-white truncate">{pageTitle}</h1>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Search (decorative) ── */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl
                      bg-surface-800 border border-surface-700/50 w-56
                      text-slate-500 text-sm cursor-text hover:border-surface-600
                      transition-colors duration-150">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-slate-600 select-none">Search… </span>
        <span className="ml-auto text-xs text-slate-700 hidden md:block">⌘K</span>
      </div>

      {/* ── Notification Bell with Unread Badge & Dropdown ── */}
      <div className="relative" ref={notifRef}>
        <button
          id="topbar-notif-btn"
          onClick={handleToggleNotif}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl
                     text-slate-400 hover:bg-surface-700 hover:text-slate-200
                     transition-all duration-150"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-900 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700 bg-surface-900/40">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/20 text-primary-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-surface-700/50">
              {loadingNotifs ? (
                <p className="text-xs text-slate-500 p-4 text-center">Loading notifications…</p>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="text-2xl mb-1 block">🔔</span>
                  <p className="text-xs font-medium text-slate-400">All caught up!</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">No notifications at the moment.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const cfg = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.PROJECT_UPDATED
                  let timeAgo = ''
                  try { timeAgo = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) } catch { timeAgo = '' }

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={clsx(
                        'p-3.5 flex items-start gap-3 cursor-pointer transition-colors duration-150',
                        notif.isRead ? 'opacity-70 hover:bg-surface-700/30' : 'bg-surface-700/40 hover:bg-surface-700/60',
                      )}
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-surface-700 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-slate-200 truncate">{notif.title}</span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-400 leading-snug break-words">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{timeAgo}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-2 border-t border-surface-700 text-center bg-surface-900/40">
              <span className="text-[11px] text-slate-500">
                DevTrack Pro Live Notification System
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── User avatar + dropdown ── */}
      <div className="relative group">
        <button
          id="topbar-avatar-btn"
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl
                     hover:bg-surface-700 transition-all duration-150"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center text-white text-xs font-bold
                          shadow-glow flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white leading-none truncate max-w-[120px]">
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs text-slate-500 leading-none mt-0.5 truncate max-w-[120px]">
              {user?.email ?? ''}
            </p>
          </div>
          <svg className="w-4 h-4 text-slate-500 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 top-full mt-2 w-48
                        bg-surface-800 border border-surface-700 rounded-xl shadow-modal
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-150 z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-surface-700">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <a href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-surface-700 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profile
            </a>
            <a href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-surface-700 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </a>
          </div>
          <div className="border-t border-surface-700 py-1">
            <button
              id="topbar-logout-btn"
              onClick={logout}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {isPending ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
