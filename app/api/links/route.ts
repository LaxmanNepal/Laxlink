import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { normalizeSlug, validateTargetUrl } from '@/lib/url-security'

const optionalUrl = z.string().trim().optional()
const schema = z.object({
  url: z.string().trim().min(1),
  slug: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  title: z.string().trim().max(120).optional(),
  androidUrl: optionalUrl,
  iosUrl: optionalUrl,
})

function safeOptionalUrl(value?: string) {
  return value ? validateTargetUrl(value) : undefined
}

export async function GET() {
  const links = await prisma.link.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json({ links })
}

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid link data' }, { status: 400 })

    const targetUrl = validateTargetUrl(parsed.data.url)
    const androidUrl = safeOptionalUrl(parsed.data.androidUrl)
    const iosUrl = safeOptionalUrl(parsed.data.iosUrl)
    const slug = parsed.data.slug ? normalizeSlug(parsed.data.slug) : crypto.randomUUID().slice(0, 8)

    const link = await prisma.link.create({
      data: {
        slug,
        targetUrl,
        title: parsed.data.title || undefined,
        androidUrl,
        iosUrl,
      },
    })

    return NextResponse.json({ link }, { status: 201 })
  } catch (e) {
    if (e instanceof TypeError || e instanceof Error && /URL|protocol|credential|Invalid slug/i.test(e.message)) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid URL' }, { status: 400 })
    }
    if ((e as { code?: string }).code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Unable to create link' }, { status: 500 })
  }
}
