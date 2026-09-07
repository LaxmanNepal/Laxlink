import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiKey } from '@/lib/security'

export async function POST() {
  const key = createApiKey()
  const record = await prisma.apiKey.create({ data: { name: 'Default API key', prefix: key.prefix, keyHash: key.hash } })
  return NextResponse.json({ id: record.id, prefix: record.prefix, key: key.raw }, { status: 201 })
}
export async function GET() { return NextResponse.json({ keys: await prisma.apiKey.findMany({ select: { id: true, name: true, prefix: true, createdAt: true, lastUsedAt: true }, orderBy: { createdAt: 'desc' } }) }) }
