import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const solicitacoes = await prisma.solicitacaoRepresentacao.findMany({
      include: {
        vendedor: {
          include: {
            user: {
              select: {
                nome: true,
                email: true,
                telefone: true
              }
            }
          }
        },
        empresa: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            logo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ solicitacoes })
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
