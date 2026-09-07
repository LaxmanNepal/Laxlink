import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validateTargetUrl } from '@/lib/url-security'

const patch = z.object({
  targetUrl: z.url().optional(),
  active: z.boolean().optional(),
  title: z.string().max(120).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  androidUrl: z.url().nullable().optional(),
  iosUrl: z.url().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
}).refine(v => Object.keys(v).length > 0)

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const link = await prisma.link.findUnique({ where: { slug } })
  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  return NextResponse.json({ link })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = patch.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 })
  try {
    const d = parsed.data
    const expiresAt = d.expiresAt === undefined ? undefined : d.expiresAt === null ? null : new Date(d.expiresAt)
    if (expiresAt && expiresAt.getTime() <= Date.now()) return NextResponse.json({ error: 'Expiration must be in the future' }, { status: 400 })
    const data: Record<string, unknown> = { ...d, expiresAt }
    if (d.targetUrl) data.targetUrl = validateTargetUrl(d.targetUrl)
    if (d.androidUrl) data.androidUrl = validateTargetUrl(d.androidUrl)
    if (d.iosUrl) data.iosUrl = validateTargetUrl(d.iosUrl)
    const link = await prisma.link.update({ where: { slug }, data })
    return NextResponse.json({ link })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Link not found' }, { status: 404 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try { await prisma.link.delete({ where: { slug } }); return NextResponse.json({ ok: true }) }
  catch { return NextResponse.json({ error: 'Link not found' }, { status: 404 }) }
}
