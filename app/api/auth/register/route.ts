import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession, hashPassword } from '@/lib/auth'

const schema = z.object({ email: z.string().email().max(160), password: z.string().min(8).max(128), name: z.string().trim().min(1).max(80).optional() })
export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json())
    const email = input.email.toLowerCase()
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    const user = await prisma.user.create({ data: { email, name: input.name, passwordHash: hashPassword(input.password) } })
    await prisma.workspace.create({ data: { name: `${input.name || 'My'} Workspace`, slug: `${email.split('@')[0]}-${user.id.slice(-6)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'), ownerId: user.id, memberships: { create: { userId: user.id, role: 'OWNER' } }, subscription: { create: { plan: 'FREE' } } } })
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 }) }
}
