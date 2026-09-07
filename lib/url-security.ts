const BLOCKED_PROTOCOLS = new Set(['javascript:', 'data:', 'vbscript:', 'file:'])

export function validateTargetUrl(value: string) {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are allowed')
  if (BLOCKED_PROTOCOLS.has(url.protocol)) throw new Error('Blocked URL protocol')
  if (url.username || url.password) throw new Error('Credential-bearing URLs are not allowed')
  return url.toString()
}

export function normalizeSlug(value: string) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (!slug || slug.length > 80) throw new Error('Invalid slug')
  return slug
}
