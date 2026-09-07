import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema=z.object({url:z.url(),slug:z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/).optional()})
export async function POST(req:Request){try{const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:'Invalid URL or slug'},{status:400});const slug=parsed.data.slug||crypto.randomUUID().slice(0,8);const link=await prisma.link.create({data:{slug,targetUrl:parsed.data.url}});return NextResponse.json({link},{status:201})}catch(e){if((e as {code?:string}).code==='P2002')return NextResponse.json({error:'Slug already exists'},{status:409});return NextResponse.json({error:'Unable to create link'},{status:500})}}