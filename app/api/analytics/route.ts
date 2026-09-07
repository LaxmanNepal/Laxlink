import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

const countBy = (items: Array<{ value: string | null }>) => items.reduce<Record<string,number>>((out,item)=>{const k=item.value||'unknown';out[k]=(out[k]||0)+1;return out}, {})

export async function GET(req: Request) {
  const params=new URL(req.url).searchParams
  const slug=params.get('slug')
  const days=Math.min(365,Math.max(1,Number(params.get('days')||30)))
  const since=new Date(Date.now()-days*86400000)
  if(slug){
    const link=await prisma.link.findUnique({where:{slug},include:{events:{where:{createdAt:{gte:since}},orderBy:{createdAt:'desc'},take:5000}}})
    if(!link)return NextResponse.json({error:'Link not found'},{status:404})
    const events=link.events
    return NextResponse.json({link:{slug:link.slug,targetUrl:link.targetUrl,clicks:link.clicks,active:link.active},analytics:{totalClicks:events.length,humanClicks:events.filter(e=>!e.isBot).length,botClicks:events.filter(e=>e.isBot).length,uniqueVisitors:new Set(events.map(e=>e.ipHash).filter(Boolean)).size,byDevice:countBy(events.map(e=>({value:e.device}))),byCountry:countBy(events.map(e=>({value:e.country}))),byBrowser:countBy(events.map(e=>({value:e.browser}))),byReferrer:countBy(events.map(e=>({value:e.referer}))),byDay:events.reduce<Record<string,number>>((a,e)=>{const k=e.createdAt.toISOString().slice(0,10);a[k]=(a[k]||0)+1;return a},{})}})
  }
  const user=await getSessionUser()
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401})
  const ids=(await prisma.membership.findMany({where:{userId:user.id},select:{workspaceId:true}})).map(x=>x.workspaceId)
  const events=await prisma.clickEvent.findMany({where:{link:{workspaceId:{in:ids}},createdAt:{gte:since}},select:{ipHash:true,isBot:true,device:true,country:true,browser:true,referer:true}})
  return NextResponse.json({range:{days,since},totalClicks:events.length,humanClicks:events.filter(e=>!e.isBot).length,botClicks:events.filter(e=>e.isBot).length,uniqueVisitors:new Set(events.map(e=>e.ipHash).filter(Boolean)).size,byDevice:countBy(events.map(e=>({value:e.device}))),byCountry:countBy(events.map(e=>({value:e.country}))),byBrowser:countBy(events.map(e=>({value:e.browser}))),byReferrer:countBy(events.map(e=>({value:e.referer})))})
}
