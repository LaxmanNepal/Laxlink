import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const value = url.searchParams.get('url')
  if (!value) return NextResponse.json({ error: 'url is required' }, { status: 400 })
  try { const svg = await QRCode.toString(value, { type: 'svg', margin: 1, width: 512 }); return new NextResponse(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } }) }
  catch { return NextResponse.json({ error: 'Invalid QR value' }, { status: 400 }) }
}
