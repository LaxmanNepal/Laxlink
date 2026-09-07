'use client'

import { FormEvent, useMemo, useState } from 'react'

export default function Home(){
  const [url,setUrl]=useState('')
  const [slug,setSlug]=useState('')
  const [title,setTitle]=useState('')
  const [creating,setCreating]=useState(false)
  const [generated,setGenerated]=useState('')
  const [error,setError]=useState('')
  const [copied,setCopied]=useState(false)
  const origin=typeof window==='undefined'?'':window.location.origin
  const cleanSlug=useMemo(()=>slug.replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase(),[slug])
  const preview=cleanSlug&&origin?`${origin}/r/${cleanSlug}`:''

  async function generate(e:FormEvent){
    e.preventDefault(); setCreating(true); setError(''); setGenerated('')
    try{
      const response=await fetch('/api/links',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url,slug:cleanSlug||undefined,title:title||undefined})})
      const data=await response.json()
      if(!response.ok) throw new Error(data.error||'Could not generate link')
      setGenerated(`${origin}/r/${data.link.slug}`)
    }catch(err){setError(err instanceof Error?err.message:'Could not generate link')}
    finally{setCreating(false)}
  }

  async function copy(){
    if(!generated) return
    await navigator.clipboard.writeText(generated)
    setCopied(true); setTimeout(()=>setCopied(false),1800)
  }

  return <><header className="container nav"><a className="brand" href="/">Lax<span>Link</span></a><nav className="navlinks"><a href="#generator">Generator</a><a href="#features">Features</a><a href="/dashboard">Dashboard</a></nav><a className="navcta" href="#generator">Create link</a></header>
  <main>
    <section className="hero"><div className="container">
      <span className="eyebrow">FAST · LIVE · TRACKABLE</span>
      <h1>Short links that are actually ready to share.</h1>
      <p>Paste a destination, generate a secure short URL, and start tracking visits immediately.</p>
      <div className="actions"><a className="btn primary" href="#generator">Create free link →</a><a className="btn secondary" href="/dashboard">Open dashboard</a></div>
      <div className="stats"><div className="stat"><strong>Instant</strong><span>Live generation</span></div><div className="stat"><strong>Smart</strong><span>Device routing</span></div><div className="stat"><strong>Tracked</strong><span>Click analytics</span></div><div className="stat"><strong>QR</strong><span>Ready to scan</span></div></div>
    </div></section>

    <section className="section" id="generator"><div className="container"><div className="card generator">
      <div className="generator-title"><div className="icon">↗</div><div><span className="eyebrow">LIVE LINK GENERATOR</span><h2>Create your LaxLink</h2><p className="muted">Leave the short name empty and LaxLink creates a unique random URL automatically.</p></div></div>
      <form onSubmit={generate}>
        <div className="generator-main">
          <label>Destination URL <span className="required">*</span><input required className="input input-lg" type="url" placeholder="https://example.com/page" value={url} onChange={e=>setUrl(e.target.value)}/><small>Where visitors go after opening your link.</small></label>
          <label>Custom short name <input className="input input-lg" placeholder="Optional: summer-sale" value={slug} onChange={e=>setSlug(e.target.value)}/><small>Leave empty for an automatic short code.</small></label>
        </div>
        <label>Link title <input className="input" placeholder="Optional: My campaign" value={title} onChange={e=>setTitle(e.target.value)}/></label>
        {preview&&<div className="url-preview"><span>Preview</span><strong>{preview}</strong></div>}
        {error&&<p className="error">{error}</p>}
        <div className="generator-footer"><div className="muted small">✓ Live immediately &nbsp; ✓ Analytics &nbsp; ✓ QR-ready</div><button className="btn primary createbtn" disabled={creating||!url}>{creating?'Generating…':'Generate Live Link →'}</button></div>
      </form>
      {generated&&<div className="successbox"><div><span className="successcheck">✓</span><div><strong>Your LaxLink is live</strong><p>{generated}</p></div></div><div className="success-actions"><button className="btn secondary" onClick={copy}>{copied?'Copied ✓':'Copy link'}</button><a className="btn primary" href={generated} target="_blank" rel="noreferrer">Open link ↗</a></div></div>}
    </div></div></section>

    <section className="section" id="features"><div className="container"><span className="eyebrow">BUILT FOR SHARING</span><h2>One link. More control.</h2><div className="grid" style={{marginTop:28}}>{[['01','Automatic short codes','Unique random URLs when you do not need a custom slug.'],['02','Smart routing','Send Android and iPhone users to different destinations.'],['03','Analytics','Track clicks and link activity from your dashboard.'],['04','QR ready','Create a scannable QR code for every LaxLink.']].map(([n,t,d])=><article className="card" key={n}><div className="icon">{n}</div><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>
  </main><footer className="footer"><div className="container">© 2026 LaxLink · Built by Laxman Nepal</div></footer></>
}