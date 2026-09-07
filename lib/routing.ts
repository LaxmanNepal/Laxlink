import type { SmartRule } from '@prisma/client'

export type RoutingContext = { device: string; os: string; browser: string; country: string }

export function selectSmartDestination(link: { targetUrl: string; androidUrl: string | null; iosUrl: string | null; fallbackUrl: string | null; rules: SmartRule[] }, ctx: RoutingContext) {
  const rules = [...link.rules].filter(r => r.active).sort((a, b) => b.priority - a.priority)
  for (const rule of rules) {
    const matches = rule.match.split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
    const actual = String(ctx[rule.type as keyof RoutingContext] ?? '').toLowerCase()
    if (matches.includes(actual) || matches.includes('*')) return rule.targetUrl
  }
  if (ctx.os === 'android' && link.androidUrl) return link.androidUrl
  if (ctx.os === 'ios' && link.iosUrl) return link.iosUrl
  return link.fallbackUrl || link.targetUrl
}

export function detectClient(userAgent: string | null): RoutingContext {
  const ua = (userAgent || '').toLowerCase()
  const device = /ipad|tablet/.test(ua) ? 'tablet' : /mobile|android|iphone|ipod/.test(ua) ? 'mobile' : 'desktop'
  const os = /android/.test(ua) ? 'android' : /iphone|ipad|ipod/.test(ua) ? 'ios' : /windows/.test(ua) ? 'windows' : /mac os/.test(ua) ? 'macos' : /linux/.test(ua) ? 'linux' : 'other'
  const browser = /edg\//.test(ua) ? 'edge' : /chrome\//.test(ua) ? 'chrome' : /firefox\//.test(ua) ? 'firefox' : /safari\//.test(ua) && !/chrome\//.test(ua) ? 'safari' : 'other'
  return { device, os, browser, country: 'unknown' }
}
