import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET(){const user=await getSessionUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const rows=await prisma.membership.findMany({where:{userId:user.id},include:{workspace:{include:{subscription:true,_count:{select:{links:true,memberships:true}}}}}});return NextResponse.json(rows.map(x=>({id:x.workspace.id,name:x.workspace.name,slug:x.workspace.slug,role:x.role,plan:x.workspace.subscription?.plan||'FREE',links:x.workspace._count.links,members:x.workspace._count.memberships})))}
