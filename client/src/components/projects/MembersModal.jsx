// client/src/components/projects/MembersModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Project Team Members Management Modal.
// Features: List members, invite by email with role, change roles, remove member.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from '@services/member.service'
import { useAuthStore } from '@store/authStore'

const ROLE_BADGES = {
  OWNER:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ADMIN:  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  MEMBER: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  VIEWER: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export default function MembersModal({ project, onClose }) {
  const { user: currentUser } = useAuthStore()
  const [members, setMembers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [email, setEmail]         = useState('')
  const [role, setRole]           = useState('MEMBER')
  const [inviting, setInviting]   = useState(false)
  const [removingId, setRemovingId] = useState(null)

  // Fetch members
  const fetchMembers = useCallback(async () => {
    if (!project?.id) return
    setLoading(true)
    try {
      const res = await getProjectMembers(project.id)
      setMembers(res.data.data.members ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load project members.')
    } finally {
      setLoading(false)
    }
  }, [project?.id])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Determine current user's role in this project
  const myMemberRecord = members.find((m) => m.userId === currentUser?.id)
  const isOwner = project?.ownerId === currentUser?.id || myMemberRecord?.role === 'OWNER'

  // Add / Invite Member
  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter an email address.')
      return
    }

    setInviting(true)
    try {
      const res = await addProjectMember(project.id, { email: email.trim(), role })
      toast.success('Member added to project!')
      setMembers((prev) => [...prev, res.data.data.member])
      setEmail('')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to add member.')
    } finally {
      setInviting(false)
    }
  }

  // Change Member Role
  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await updateMemberRole(project.id, memberId, newRole)
      const updated = res.data.data.member
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
      toast.success('Member role updated.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to update role.')
    }
  }

  // Remove Member
  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.user?.name ?? member.user?.email} from this project?`)) {
      return
    }
    setRemovingId(member.id)
    try {
      await removeProjectMember(project.id, member.id)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
      toast.success('Member removed.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to remove member.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-surface-800 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: project?.color || '#6366f1' }}
            >
              {project?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white truncate">
                {project?.name} — Team Members
              </h2>
              <p className="text-xs text-slate-400">Manage project access & roles</p>
            </div>
          </div>

          <button
            id="members-modal-close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-surface-700 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleAddMember} className="p-5 border-b border-surface-700 bg-surface-900/40">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Invite New Member
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="invite-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter team member's email…"
              className="input text-xs flex-1"
            />
            <select
              id="invite-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input text-xs w-full sm:w-32"
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              id="invite-submit-btn"
              type="submit"
              disabled={inviting}
              className="btn-primary text-xs whitespace-nowrap min-w-[90px]"
            >
              {inviting ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="p-5 max-h-[350px] overflow-y-auto space-y-3">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-12 rounded-xl bg-surface-700/40" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No team members yet.</p>
          ) : (
            members.map((member) => {
              const badgeClass = ROLE_BADGES[member.role] ?? ROLE_BADGES.MEMBER
              const isOwnerRow = member.isOwner || member.role === 'OWNER'

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-900/40 border border-surface-700/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full bg-primary-500/80 flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                      title={member.user?.name}
                    >
                      {member.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {member.user?.name ?? 'User'}
                        {member.userId === currentUser?.id && (
                          <span className="ml-1.5 text-[10px] text-primary-400 font-medium">(You)</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Role Selector or Badge */}
                    {isOwner && !isOwnerRow ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="input text-xs py-1 px-2 w-28 bg-surface-800 border-surface-700"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    ) : (
                      <span className={clsx('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border', badgeClass)}>
                        {member.role}
                      </span>
                    )}

                    {/* Remove button */}
                    {!isOwnerRow && (isOwner || member.userId === currentUser?.id) && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingId === member.id}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-surface-700 bg-surface-900/40">
          <button onClick={onClose} className="btn-secondary text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
