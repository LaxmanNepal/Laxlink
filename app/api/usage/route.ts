import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET(){const user=await getSessionUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const memberships=await prisma.membership.findMany({where:{userId:user.id},select:{workspaceId:true}});const ids=memberships.map(x=>x.workspaceId);const [links,clicks,members]=await Promise.all([prisma.link.count({where:{workspaceId:{in:ids}}}),prisma.clickEvent.count({where:{link:{workspaceId:{in:ids}}}}),prisma.membership.count({where:{workspaceId:{in:ids}}})]);return NextResponse.json({links,clicks,members})}
