import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
const schema=z.object({linkId:z.string(),type:z.enum(['device','user-agent']),match:z.string().min(1).max(120),targetUrl:z.url(),priority:z.number().int().min(0).max(999).optional()})
export async function GET(req:Request){const linkId=new URL(req.url).searchParams.get('linkId');if(!linkId)return NextResponse.json({error:'linkId is required'},{status:400});return NextResponse.json({rules:await prisma.smartRule.findMany({where:{linkId},orderBy:{priority:'asc'}})})}
export async function POST(req:Request){const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Invalid rule'},{status:400});const rule=await prisma.smartRule.create({data:p.data});return NextResponse.json({rule},{status:201})}
