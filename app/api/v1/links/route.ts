import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashApiKey } from '@/lib/security'
import { normalizeSlug, validateTargetUrl } from '@/lib/url-security'

async function authenticate(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  return prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(auth.slice(7).trim()) } })
}

export async function GET(request: NextRequest) {
  const key = await authenticate(request)
  if (!key) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const links = await prisma.link.findMany({ where: key.workspaceId ? { workspaceId: key.workspaceId } : { ownerId: key.userId || undefined }, orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json({ data: links })
}

export async function POST(request: NextRequest) {
  const key = await authenticate(request)
  if (!key) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  try {
    const targetUrl = validateTargetUrl(String(body.targetUrl))
    const slug = normalizeSlug(String(body.slug || crypto.randomUUID().slice(0, 8)))
    const link = await prisma.link.create({ data: { targetUrl, slug, title: body.title ? String(body.title) : undefined, ownerId: key.userId || undefined, workspaceId: key.workspaceId || undefined } })
    await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    return NextResponse.json({ data: link }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 400 })
  }
}
