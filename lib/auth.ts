import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_DAYS = 30
const hash = (v: string) => createHash('sha256').update(v).digest('hex')
export const hashPassword = (password: string) => scryptSync(password, process.env.AUTH_SALT || 'laxlink-dev-salt', 32).toString('hex')
export const verifyPassword = (password: string, stored: string) => {
  const a = Buffer.from(hashPassword(password), 'hex'), b = Buffer.from(stored, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
export async function createSession(userId: string) {
  const raw = randomBytes(32).toString('base64url')
  await prisma.session.create({ data: { tokenHash: hash(raw), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000) } })
  const jar = await cookies()
  jar.set('laxlink_session', raw, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 86400 })
}
export async function getSessionUser() {
  const raw = (await cookies()).get('laxlink_session')?.value
  if (!raw) return null
  const session = await prisma.session.findUnique({ where: { tokenHash: hash(raw) }, include: { user: true } })
  if (!session || session.expiresAt < new Date()) return null
  return session.user
}
export async function destroySession() {
  const jar = await cookies(); const raw = jar.get('laxlink_session')?.value
  if (raw) await prisma.session.deleteMany({ where: { tokenHash: hash(raw) } })
  jar.delete('laxlink_session')
}
