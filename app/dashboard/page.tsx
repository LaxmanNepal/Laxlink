'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type LinkItem = { id:string; slug:string; targetUrl:string; title?:string|null; clicks:number; active:boolean }

export default function Dashboard() {
  const [url,setUrl]=useState('')
  const [slug,setSlug]=useState('')
  const [title,setTitle]=useState('')
  const [androidUrl,setAndroidUrl]=useState('')
  const [iosUrl,setIosUrl]=useState('')
  const [links,setLinks]=useState<LinkItem[]>([])
  const [loading,setLoading]=useState(true)
  const [creating,setCreating]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')
  const [generated,setGenerated]=useState<string|null>(null)
  const [selected,setSelected]=useState<LinkItem|null>(null)
  const [copied,setCopied]=useState(false)

  const load=()=>fetch('/api/links',{cache:'no-store'}).then(r=>r.json()).then(d=>setLinks(d.links||[])).catch(()=>setError('Could not load links')).finally(()=>setLoading(false))
  useEffect(()=>{void load()},[])

  const total=useMemo(()=>links.reduce((a,b)=>a+b.clicks,0),[links])
  const origin=typeof window==='undefined'?'':window.location.origin
  const previewSlug=slug.trim().replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase()
  const previewUrl=previewSlug&&origin?`${origin}/r/${previewSlug}`:null

  async function submit(e:FormEvent){
    e.preventDefault(); setError(''); setSuccess(''); setGenerated(null); setCreating(true)
    try {
      const r=await fetch('/api/links',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url,slug:previewSlug||undefined,title:title||undefined,androidUrl:androidUrl||undefined,iosUrl:iosUrl||undefined})})
      const d=await r.json()
      if(!r.ok) throw Error(d.error||'Could not create link')
      const created=d.link as LinkItem
      setLinks(current=>[created,...current]); setGenerated(`${origin}/r/${created.slug}`); setSuccess('Your smart URL is ready')
      setUrl(''); setSlug(''); setTitle(''); setAndroidUrl(''); setIosUrl('')
    } catch(e) { setError(e instanceof Error?e.message:'Could not create link') }
    finally { setCreating(false) }
  }

  async function copy(value:string){await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1600)}
  async function toggle(l:LinkItem){const r=await fetch(`/api/links/${l.slug}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({active:!l.active})});if(r.ok){const d=await r.json();setLinks(current=>current.map(x=>x.slug===l.slug?d.link:x))}}
  async function remove(l:LinkItem){if(!confirm(`Delete /${l.slug}?`))return;const r=await fetch(`/api/links/${l.slug}`,{method:'DELETE'});if(r.ok)setLinks(current=>current.filter(x=>x.slug!==l.slug))}

  return <div className="dash">
    <aside className="sidebar"><a className="brand" href="/">Lax<span>Link</span></a><nav>
      <a className="sideactive" href="/dashboard">⌂ Overview</a><a href="/dashboard/links">↗ Links</a><a href="/dashboard/analytics">◒ Analytics</a><a href="/dashboard/campaigns">◎ Campaigns</a><a href="/dashboard/qr">▣ QR Studio</a><a href="/dashboard/domains">◇ Domains</a><a href="/dashboard/team">♙ Team</a><a href="/dashboard/billing">◈ Billing</a><a href="/dashboard/settings">⚙ Settings</a>
    </nav><div className="sidebottom">LaxLink Cloud<br/><small>Smart links platform</small></div></aside>
    <div className="dashbody"><header className="dashnav"><span className="mobilebrand">Lax<span>Link</span></span><div><span className="statusdot"/> All systems operational</div></header>
      <main className="dashmain">
        <div className="dashhead"><div><span className="eyebrow">SMART URL BUILDER</span><h1>Create a link in seconds</h1><p className="muted">Paste your destination, choose a short name, and LaxLink generates a trackable URL instantly.</p></div><a className="btn secondary" href="/">← Home</a></div>

        <form className="card generator" onSubmit={submit}>
          <div className="generator-title"><div className="icon">↗</div><div><h2>Generate your LaxLink</h2><p className="muted">Your destination stays private behind one clean, shareable URL.</p></div></div>
          <div className="generator-main">
            <label>Destination URL <span className="required">*</span><input required className="input input-lg" type="url" placeholder="https://example.com/product" value={url} onChange={e=>setUrl(e.target.value)}/><small>Where visitors should go when they open your link.</small></label>
            <label>Custom slug <input className="input input-lg" placeholder="summer-sale" value={slug} onChange={e=>setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g,''))}/><small>Optional. Use letters, numbers, hyphens or underscores.</small></label>
          </div>
          <div className="generator-extra">
            <details><summary>Advanced routing <span>Android / iPhone destinations</span></summary><div className="advanced-grid"><label>Android URL<input className="input" type="url" placeholder="https://play.google.com/store/apps/..." value={androidUrl} onChange={e=>setAndroidUrl(e.target.value)}/></label><label>iPhone URL<input className="input" type="url" placeholder="https://apps.apple.com/app/..." value={iosUrl} onChange={e=>setIosUrl(e.target.value)}/></label><label>Link title<input className="input" placeholder="Summer campaign" value={title} onChange={e=>setTitle(e.target.value)}/></label></div></details>
          </div>
          {previewUrl&&<div className="url-preview"><span>Preview</span><strong>{previewUrl}</strong></div>}
          {error&&<p className="error">{error}</p>}
          <div className="generator-footer"><div className="muted small">✓ Analytics &nbsp; ✓ QR-ready &nbsp; ✓ Device routing</div><button className="btn primary createbtn" disabled={creating||!url}>{creating?'Generating…':'Generate smart URL →'}</button></div>
        </form>

        {generated&&<section className="successbox"><div><span className="successcheck">✓</span><div><strong>{success}</strong><p>{generated}</p></div></div><div className="success-actions"><button className="btn secondary" onClick={()=>copy(generated)}>{copied?'Copied ✓':'Copy URL'}</button><a className="btn primary" href={generated} target="_blank">Open link ↗</a></div></section>}

        <div className="stats"><div className="stat"><strong>{links.length}</strong><span>Total links</span></div><div className="stat"><strong>{total}</strong><span>Total clicks</span></div><div className="stat"><strong>{links.filter(x=>x.active).length}</strong><span>Active links</span></div><div className="stat"><strong>∞</strong><span>Smart routing</span></div></div>

        <section className="card" id="links"><div className="sectionhead"><div><h2>Your links</h2><p className="muted">Every URL you generate is saved to your backend and ready for analytics.</p></div><span className="pill">{loading?'Loading…':'Live'}</span></div>{!links.length&&!loading?<div className="empty"><div className="icon">+</div><h3>No links yet</h3><p className="muted">Generate your first LaxLink above.</p></div>:<div className="tablewrap"><table className="table"><thead><tr><th>Smart URL</th><th>Destination</th><th>Clicks</th><th>Status</th><th>Actions</th></tr></thead><tbody>{links.map(l=><tr key={l.id}><td><a className="linkurl" href={`/r/${l.slug}`} target="_blank">{origin}/r/{l.slug}</a><small>{l.title||'Untitled link'}</small></td><td className="truncate">{l.targetUrl}</td><td><strong>{l.clicks}</strong></td><td><span className={l.active?'pill':'pill off'}>{l.active?'Active':'Paused'}</span></td><td><div className="rowactions"><button onClick={()=>setSelected(l)}>Analytics</button><button onClick={()=>toggle(l)}>{l.active?'Pause':'Resume'}</button><button onClick={()=>remove(l)}>Delete</button></div></td></tr>)}</tbody></table></div>}</section>
      </main>
    </div>
    {selected&&<div className="modal" onClick={()=>setSelected(null)}><div className="modalcard" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><h2>/{selected.slug}</h2><p className="muted">{selected.targetUrl}</p><div className="stats"><div className="stat"><strong>{selected.clicks}</strong><span>Clicks</span></div><div className="stat"><strong>{selected.active?'Live':'Paused'}</strong><span>Status</span></div></div><img className="qr" src={`/api/qr?url=${encodeURIComponent(`${origin}/r/${selected.slug}`)}`} alt="QR code"/><a className="btn primary" href={`/api/analytics?slug=${selected.slug}`} target="_blank">Open analytics JSON</a></div></div>}
  </div>
}
