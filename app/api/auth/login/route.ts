import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession, verifyPassword } from '@/lib/auth'
const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
export async function POST(req: Request) {
 try {
  const { email, password } = schema.parse(await req.json())
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
 } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
}
