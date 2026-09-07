import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patch = z.object({ targetUrl: z.url().optional(), active: z.boolean().optional(), title: z.string().max(120).nullable().optional(), androidUrl: z.url().nullable().optional(), iosUrl: z.url().nullable().optional() }).refine(v => Object.keys(v).length > 0)
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const parsed = patch.safeParse(await req.json()); if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 }); try { const link = await prisma.link.update({ where: { slug }, data: parsed.data }); return NextResponse.json({ link }) } catch { return NextResponse.json({ error: 'Link not found' }, { status: 404 }) } }
export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; try { await prisma.link.delete({ where: { slug } }); return NextResponse.json({ ok: true }) } catch { return NextResponse.json({ error: 'Link not found' }, { status: 404 }) } }
