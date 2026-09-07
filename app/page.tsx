'use client'

import { FormEvent, useMemo, useState } from 'react'

function makeSlug(value:string){
  const cleaned=value.toLowerCase().trim().replace(/https?:\/\//,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
  return cleaned.slice(0,40)||'link'
}

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
      <h1>Generate your LaxLink instantly.</h1>
      <p>Paste any destination and create a live, shareable smart link directly from this page.</p>
      <div className="actions"><a className="btn primary" href="#generator">Generate a link →</a><a className="btn secondary" href="/dashboard">Open dashboard</a></div>
    </div></section>

    <section className="section" id="generator"><div className="container"><div className="card generator">
      <span className="eyebrow">LIVE LINK GENERATOR</span><h2>Create a short link now</h2><p className="muted">No dashboard required. Your link is created through the LaxLink backend and becomes active immediately.</p>
      <form onSubmit={generate}>
        <div className="generator-main">
          <label>Destination URL <span className="required">*</span><input required className="input input-lg" type="url" placeholder="https://example.com/page" value={url} onChange={e=>{setUrl(e.target.value);if(!slug)setSlug(makeSlug(e.target.value))}}/></label>
          <label>Custom slug <input className="input input-lg" placeholder="my-link" value={slug} onChange={e=>setSlug(e.target.value)}/></label>
        </div>
        <label>Link title <input className="input" placeholder="My campaign link (optional)" value={title} onChange={e=>setTitle(e.target.value)}/></label>
        {preview&&<div className="url-preview"><span>Live preview</span><strong>{preview}</strong></div>}
        {error&&<p className="error">{error}</p>}
        <div className="generator-footer"><div className="muted small">✓ Smart redirect &nbsp; ✓ Analytics &nbsp; ✓ QR-ready</div><button className="btn primary createbtn" disabled={creating||!url}>{creating?'Generating…':'Generate Live Link →'}</button></div>
      </form>
      {generated&&<div className="successbox"><div><span className="successcheck">✓</span><div><strong>Your LaxLink is live</strong><p>{generated}</p></div></div><div className="success-actions"><button className="btn secondary" onClick={copy}>{copied?'Copied ✓':'Copy link'}</button><a className="btn primary" href={generated} target="_blank" rel="noreferrer">Open link ↗</a></div></div>}
    </div></div></section>

    <section className="section" id="features"><div className="container"><span className="eyebrow">BUILT IN</span><h2>More than a URL shortener.</h2><div className="grid" style={{marginTop:28}}>{[['01','Live generation','Create links instantly through the production API.'],['02','Smart routing','Route visitors with device-aware destinations.'],['03','Analytics','Track clicks and link activity.'],['04','QR ready','Generate a QR code for every LaxLink.']].map(([n,t,d])=><article className="card" key={n}><div className="icon">{n}</div><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>
  </main><footer className="footer"><div className="container">© 2026 LaxLink · Built by Laxman Nepal</div></footer></>
}