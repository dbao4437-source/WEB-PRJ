import jwt from 'jsonwebtoken'
import { findUserById, userDTO } from '../services/userService.js'

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục.' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await findUserById(payload.sub)
    if (!user) return res.status(401).json({ message: 'Tài khoản không còn hoạt động.' })
    req.user = userDTO(user)
    return next()
  } catch {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' })
  }
}

export const authorize = (...roles) => (req, res, next) => req.user && roles.includes(req.user.role)
  ? next()
  : res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' })
