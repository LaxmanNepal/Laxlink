import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDevice, isBot } from '@/lib/security'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const link = await prisma.link.findUnique({ where: { slug }, include: { rules: { where: { active: true }, orderBy: { priority: 'asc' } } } })
  if (!link || !link.active) return new NextResponse('Link not found', { status: 404 })
  const ua = req.headers.get('user-agent'); const referer = req.headers.get('referer'); const device = getDevice(ua); const bot = isBot(ua)
  let target = link.targetUrl
  const rule = link.rules.find(r => (r.type === 'device' && r.match === device) || (r.type === 'user-agent' && ua?.toLowerCase().includes(r.match.toLowerCase())))
  if (rule) target = rule.targetUrl
  if (!bot) await prisma.$transaction([prisma.link.update({ where: { id: link.id }, data: { clicks: { increment: 1 } } }), prisma.clickEvent.create({ data: { linkId: link.id, userAgent: ua, referer, device, isBot: bot } })])
  return NextResponse.redirect(target, 302)
}
