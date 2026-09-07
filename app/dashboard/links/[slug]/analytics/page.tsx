'use client'

import { useEffect, useMemo, useState } from 'react'

type Analytics={totalClicks:number;humanClicks:number;botClicks:number;uniqueVisitors:number;byDevice:Record<string,number>;byCountry:Record<string,number>;byBrowser:Record<string,number>;byReferrer:Record<string,number>;byDay:Record<string,number>}
type LinkData={slug:string;targetUrl:string;clicks:number;active:boolean}

function BarList({title,data}:{title:string;data:Record<string,number>}){
 const rows=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,8)
 const max=Math.max(1,...rows.map(x=>x[1]))
 return <section className="panel analytics-list"><h2>{title}</h2>{rows.length?rows.map(([name,value])=><div className="metric-row" key={name}><div className="metric-label"><span>{name}</span><strong>{value}</strong></div><div className="metric-bar"><i style={{width:`${Math.max(4,value/max*100)}%`}}/></div></div>):<p className="muted">No data yet.</p>}</section>
}

export default function AnalyticsPage({params}:{params:{slug:string}}){
 const [link,setLink]=useState<LinkData|null>(null),[data,setData]=useState<Analytics|null>(null),[days,setDays]=useState(30),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{let live=true;setLoading(true);fetch(`/api/analytics?slug=${encodeURIComponent(params.slug)}&days=${days}`,{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to load analytics');if(live){setLink(d.link);setData(d.analytics);setError('')}}).catch(e=>live&&setError(e.message)).finally(()=>live&&setLoading(false));return()=>{live=false}},[params.slug,days])
 const dayRows=useMemo(()=>{if(!data)return [];return Object.entries(data.byDay).sort((a,b)=>a[0].localeCompare(b[0])).slice(-14)},[data])
 return <main className="page"><a href="/dashboard/links">← Back to links</a><div className="page-head"><div><small className="muted">ANALYTICS</small><h1>{link?.slug||params.slug}</h1><p className="muted">Performance for the last {days} days.</p></div><select className="input range-select" value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>365 days</option></select></div>{loading?<section className="panel"><p className="muted">Loading analytics…</p></section>:error?<section className="panel"><p className="error">{error}</p></section>:data&&<><div className="stats"><div className="stat"><strong>{data.totalClicks}</strong><span>Total clicks</span></div><div className="stat"><strong>{data.humanClicks}</strong><span>Human clicks</span></div><div className="stat"><strong>{data.uniqueVisitors}</strong><span>Unique visitors</span></div><div className="stat"><strong>{data.botClicks}</strong><span>Bot clicks</span></div></div><section className="panel analytics-chart"><div className="sectionhead"><div><h2>Clicks by day</h2><p className="muted">Daily activity in the selected range.</p></div><a className="btn secondary" href={`/r/${params.slug}`} target="_blank">Open link</a></div><div className="bars">{dayRows.length?dayRows.map(([day,value])=><div className="daybar" key={day}><span style={{height:`${Math.max(5,value/Math.max(1,...dayRows.map(x=>x[1]))*150)}px`}}/><small>{day.slice(5)}</small><b>{value}</b></div>):<p className="muted">No clicks recorded in this period.</p>}</div></section><div className="analytics-grid"><BarList title="Devices" data={data.byDevice}/><BarList title="Countries" data={data.byCountry}/><BarList title="Browsers" data={data.byBrowser}/><BarList title="Referrers" data={data.byReferrer}/></div></>}</main>
}
