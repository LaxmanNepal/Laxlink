'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type LinkData = {
  slug: string
  targetUrl: string
  title?: string | null
  description?: string | null
  androidUrl?: string | null
  iosUrl?: string | null
  expiresAt?: string | null
  active?: boolean
  status?: string
  clicks?: number
}

export default function LinkEditorPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = decodeURIComponent(params.slug)
  const [data, setData] = useState<LinkData | null>(null)
  const [form, setForm] = useState({ targetUrl: '', title: '', description: '', androidUrl: '', iosUrl: '', expiresAt: '', active: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/links/' + encodeURIComponent(slug), { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Link not found')
        const item = json.link || json.data || json
        setData(item)
        setForm({
          targetUrl: item.targetUrl || '',
          title: item.title || '',
          description: item.description || '',
          androidUrl: item.androidUrl || '',
          iosUrl: item.iosUrl || '',
          expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : '',
          active: item.active !== false,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load link')
      } finally { setLoading(false) }
    }
    void load()
  }, [slug])

  function update(key: keyof typeof form, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
    setMessage(''); setError('')
  }

  async function save() {
    setSaving(true); setMessage(''); setError('')
    try {
      const res = await fetch('/api/links/' + encodeURIComponent(slug), {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not save changes')
      setData(json.link || json.data || json)
      setMessage('Changes saved successfully')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save changes') }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!confirm('Delete /r/' + slug + '? This cannot be undone.')) return
    setSaving(true)
    try {
      const res = await fetch('/api/links/' + encodeURIComponent(slug), { method: 'DELETE' })
      if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Could not delete link') }
      router.push('/dashboard/links')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete link'); setSaving(false) }
  }

  if (loading) return <main className="page"><p className="muted">Loading link…</p></main>
  if (error && !data) return <main className="page"><Link href="/dashboard/links">← Back to links</Link><section className="panel"><h2>Unable to load link</h2><p className="error">{error}</p></section></main>

  return <main className="page">
    <div className="page-head">
      <div><Link href="/dashboard/links">← Back to links</Link><h1>Edit link</h1><p className="muted">Manage routing, metadata, expiration and status.</p></div>
      <div className="rowactions"><a className="btn secondary" href={'/r/' + slug} target="_blank">Open link ↗</a><button className="btn secondary" onClick={remove} disabled={saving}>Delete</button></div>
    </div>

    <section className="panel">
      <div className="edit-url"><span>Short link</span><strong>/r/{slug}</strong>{data?.clicks != null && <small>{data.clicks} clicks</small>}</div>
      <div className="edit-grid">
        <label>Destination URL<input className="input" value={form.targetUrl} onChange={e => update('targetUrl', e.target.value)} placeholder="https://example.com" /></label>
        <label>Custom slug<input className="input" value={slug} disabled /></label>
        <label>Title<input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Campaign title" /></label>
        <label>Description<textarea className="input textarea" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Optional description" rows={4} /></label>
        <label>Android destination<input className="input" value={form.androidUrl} onChange={e => update('androidUrl', e.target.value)} placeholder="https://play.google.com/store/apps/..." /></label>
        <label>iOS destination<input className="input" value={form.iosUrl} onChange={e => update('iosUrl', e.target.value)} placeholder="https://apps.apple.com/..." /></label>
        <label>Expires at<input className="input" type="datetime-local" value={form.expiresAt} onChange={e => update('expiresAt', e.target.value)} /><small className="muted">Leave empty for no expiration.</small></label>
        <label className="togglelabel"><span>Link status</span><button type="button" className={'toggle ' + (form.active ? 'on' : '')} onClick={() => update('active', !form.active)} aria-pressed={form.active}><span /></button><small>{form.active ? 'Active — visitors can open it.' : 'Paused — visitors cannot open it.'}</small></label>
      </div>
      {error && <p className="error">{error}</p>}
      {message && <p className="successmsg">✓ {message}</p>}
      <div className="edit-footer"><span className="muted small">Slug changes are disabled to keep existing URLs working.</span><button className="btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
    </section>
  </main>
}
