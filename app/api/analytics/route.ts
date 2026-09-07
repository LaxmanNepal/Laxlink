import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  const link = await prisma.link.findUnique({ where: { slug }, include: { events: { orderBy: { createdAt: 'desc' }, take: 500 } } })
  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  const byDevice = link.events.reduce<Record<string, number>>((a, e) => { const k = e.device || 'unknown'; a[k] = (a[k] || 0) + 1; return a }, {})
  const byReferer = link.events.reduce<Record<string, number>>((a, e) => { const k = e.referer || 'direct'; a[k] = (a[k] || 0) + 1; return a }, {})
  const byDay = link.events.reduce<Record<string, number>>((a, e) => { const k = e.createdAt.toISOString().slice(0, 10); a[k] = (a[k] || 0) + 1; return a }, {})
  return NextResponse.json({ link: { slug: link.slug, targetUrl: link.targetUrl, clicks: link.clicks, active: link.active }, analytics: { byDevice, byReferer, byDay } })
}
