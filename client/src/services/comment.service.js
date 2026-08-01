// client/src/services/comment.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Task comments API wrappers.
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'

export const getTaskComments  = (taskId)           => api.get(`/tasks/${taskId}/comments`)
export const createTaskComment = (taskId, content)  => api.post(`/tasks/${taskId}/comments`, { content })
export const deleteTaskComment = (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`)
