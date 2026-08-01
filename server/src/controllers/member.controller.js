// server/src/controllers/member.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Member HTTP handlers.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import * as memberService from '../services/member.service.js'

function getUserId(req) {
  const id = req.user?.id || req.user?.userId
  if (!id) throw new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  return id
}

// ── GET /projects/:projectId/members ──────────────────────────────────────────
export async function listMembers(req, res, next) {
  try {
    const members = await memberService.listProjectMembers(req.params.projectId, getUserId(req))
    return res.status(HTTP.OK).json({ success: true, data: { members } })
  } catch (err) {
    next(err)
  }
}

// ── POST /projects/:projectId/members ─────────────────────────────────────────
export async function addMember(req, res, next) {
  try {
    const { email, role } = req.body
    if (!email) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'Email is required.' })
    }

    const member = await memberService.addProjectMember(req.params.projectId, getUserId(req), { email, role })
    return res.status(HTTP.CREATED).json({
      success: true,
      message: 'Member added successfully.',
      data: { member },
    })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /projects/:projectId/members/:memberId ──────────────────────────────
export async function updateMemberRole(req, res, next) {
  try {
    const { role } = req.body
    if (!role) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'Role is required.' })
    }

    const member = await memberService.updateMemberRole(req.params.projectId, getUserId(req), req.params.memberId, role)
    return res.status(HTTP.OK).json({
      success: true,
      message: 'Member role updated.',
      data: { member },
    })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /projects/:projectId/members/:memberId ─────────────────────────────
export async function removeMember(req, res, next) {
  try {
    await memberService.removeProjectMember(req.params.projectId, getUserId(req), req.params.memberId)
    return res.status(HTTP.NO_CONTENT).send()
  } catch (err) {
    next(err)
  }
}
