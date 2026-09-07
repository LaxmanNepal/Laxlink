import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { normalizeSlug, validateTargetUrl } from '@/lib/url-security'

const optionalUrl = z.string().trim().optional()
const schema = z.object({
  url: z.string().trim().min(1),
  slug: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  title: z.string().trim().max(120).optional(),
  androidUrl: optionalUrl,
  iosUrl: optionalUrl,
  expiresAt: z.string().datetime().optional(),
})

const alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function randomSlug(length=7){const bytes=crypto.getRandomValues(new Uint8Array(length));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('')}
async function uniqueSlug(){for(let i=0;i<8;i++){const slug=randomSlug();const exists=await prisma.link.findUnique({where:{slug},select:{id:true}});if(!exists)return slug}return crypto.randomUUID().replace(/-/g,'').slice(0,10)}
function safeOptionalUrl(value?: string){return value?validateTargetUrl(value):undefined}

export async function GET(){const links=await prisma.link.findMany({orderBy:{createdAt:'desc'},take:100});return NextResponse.json({links})}

export async function POST(req:Request){
 try{
  const parsed=schema.safeParse(await req.json())
  if(!parsed.success)return NextResponse.json({error:'Invalid link data'},{status:400})
  const expiresAt=parsed.data.expiresAt?new Date(parsed.data.expiresAt):undefined
  if(expiresAt&&expiresAt.getTime()<=Date.now())return NextResponse.json({error:'Expiration must be in the future'},{status:400})
  const link=await prisma.link.create({data:{
   slug:parsed.data.slug?normalizeSlug(parsed.data.slug):await uniqueSlug(),
   targetUrl:validateTargetUrl(parsed.data.url),
   title:parsed.data.title||undefined,
   androidUrl:safeOptionalUrl(parsed.data.androidUrl),
   iosUrl:safeOptionalUrl(parsed.data.iosUrl),
   expiresAt,
  }})
  return NextResponse.json({link},{status:201})
 }catch(e){
  if(e instanceof TypeError||e instanceof Error&&/URL|protocol|credential|Invalid slug/i.test(e.message))return NextResponse.json({error:e instanceof Error?e.message:'Invalid URL'},{status:400})
  if((e as {code?:string}).code==='P2002')return NextResponse.json({error:'Slug already exists. Please choose another one.'},{status:409})
  return NextResponse.json({error:'Unable to create link'},{status:500})
 }
}