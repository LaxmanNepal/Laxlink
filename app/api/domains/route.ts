import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
const schema=z.object({hostname:z.string().trim().toLowerCase().regex(/^[a-z0-9.-]+$/)})
export async function GET(){return NextResponse.json({domains:await prisma.domain.findMany({orderBy:{createdAt:'desc'}})})}
export async function POST(req:Request){const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Invalid hostname'},{status:400});try{const domain=await prisma.domain.create({data:{hostname:p.data.hostname}});return NextResponse.json({domain,verification:{type:'TXT',name:`_laxlink.${domain.hostname}`,value:`laxlink-verify-${domain.id}` }},{status:201})}catch{return NextResponse.json({error:'Domain already exists'},{status:409})}}
