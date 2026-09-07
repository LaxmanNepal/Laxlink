import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const buckets=new Map<string,{count:number;reset:number}>()
export function middleware(req:NextRequest){if(!req.nextUrl.pathname.startsWith('/api/'))return NextResponse.next();if(req.nextUrl.pathname==='/api/health')return NextResponse.next();const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';const now=Date.now();const windowMs=60_000;const limit=Number(process.env.API_RATE_LIMIT||120);const b=buckets.get(ip);if(!b||b.reset<now){buckets.set(ip,{count:1,reset:now+windowMs});return NextResponse.next()}b.count++;if(b.count>limit)return NextResponse.json({error:'Rate limit exceeded'},{status:429,headers:{'Retry-After':'60'}});return NextResponse.next()}
export const config={matcher:['/api/:path*']}
