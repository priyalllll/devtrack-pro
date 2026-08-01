// client/src/services/member.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Member management API wrappers.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'

export const getProjectMembers  = (projectId)                => api.get(`/projects/${projectId}/members`)
export const addProjectMember   = (projectId, data)           => api.post(`/projects/${projectId}/members`, data)
export const updateMemberRole   = (projectId, memberId, role) => api.patch(`/projects/${projectId}/members/${memberId}`, { role })
export const removeProjectMember = (projectId, memberId)       => api.delete(`/projects/${projectId}/members/${memberId}`)
