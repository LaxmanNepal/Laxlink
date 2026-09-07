'use client'

import { useEffect, useState } from 'react'

type LinkItem = { id: string; slug: string; targetUrl: string; clicks: number; status?: string; active?: boolean }

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [targetUrl, setTargetUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/links', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setLinks(data.links || data.data || [])
  }
  useEffect(() => { void load() }, [])

  async function create() {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/links', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: targetUrl, slug: slug || undefined }) })
      const data = await response.json()
      if (!response.ok) setMessage(data.error || 'Could not create link')
      else { setTargetUrl(''); setSlug(''); setMessage('Link created'); await load() }
    } catch { setMessage('Network error') }
    finally { setBusy(false) }
  }

  return <main className="dashmain">
    <div className="dashhead"><div><small className="muted">LAXLINK</small><h1>Links</h1><p className="muted">Create, manage and optimize every smart link.</p></div></div>
    <section className="card createbox"><div className="creategrid">
      <label>Destination<input className="input" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://example.com/product" /></label>
      <label>Custom slug<input className="input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="summer-sale" /></label>
      <button className="btn primary createbtn" disabled={busy || !targetUrl} onClick={create}>{busy ? 'Creating…' : 'Create link'}</button>
    </div>{message && <p className="muted">{message}</p>}</section>
    <section className="card tablewrap"><table className="table"><thead><tr><th>Short link</th><th>Destination</th><th>Clicks</th><th>Status</th></tr></thead><tbody>
      {links.map(link => <tr key={link.id}><td><a className="linkurl" href={`/r/${link.slug}`}>/r/{link.slug}</a></td><td><div className="truncate">{link.targetUrl}</div></td><td>{link.clicks}</td><td><span className="pill">{link.status || (link.active ? 'ACTIVE' : 'PAUSED')}</span></td></tr>)}
      {!links.length && <tr><td colSpan={4} className="empty muted">No links yet.</td></tr>}
    </tbody></table></section>
  </main>
}
