import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const associacoes = await prisma.vendedorEmpresa.findMany({
      include: {
        vendedor: {
          include: {
            user: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        },
        empresa: {
          select: {
            nome: true,
            cnpj: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ associacoes })
  } catch (error) {
    console.error('Erro ao buscar associações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
