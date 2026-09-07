import { createHash, randomBytes } from 'node:crypto'

export function hashApiKey(value: string) { return createHash('sha256').update(value).digest('hex') }
export function createApiKey() { const raw = `lx_${randomBytes(24).toString('base64url')}`; return { raw, hash: hashApiKey(raw), prefix: raw.slice(0, 10) } }
export function isBot(userAgent: string | null) { return /bot|crawler|spider|slurp|headless|preview/i.test(userAgent || '') }
export function getDevice(userAgent: string | null) { const ua = userAgent || ''; if (/ipad|tablet/i.test(ua)) return 'tablet'; if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'; return 'desktop' }
