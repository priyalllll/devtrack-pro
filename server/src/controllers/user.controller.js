// server/src/controllers/user.controller.js
import prisma from '../lib/prisma.js'
import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'

export async function searchUsers(req, res, next) {
  try {
    const q = req.query.q || ''
    if (!q || q.length < 2) {
      return res.status(HTTP.OK).json({ success: true, data: { users: [] } })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name:  { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      take: 10,
    })

    return res.status(HTTP.OK).json({ success: true, data: { users } })
  } catch (err) {
    next(err)
  }
}
