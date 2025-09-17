import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.vendedorProfile) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar apenas empresas que o vendedor representa (mesmo sendo admin)
    const empresas = await prisma.empresa.findMany({
      where: {
        vendedores: {
          some: {
            vendedorId: user.vendedorProfile.id,
            ativo: true
          }
        }
      },
      include: {
        vendedores: {
          where: {
            vendedorId: user.vendedorProfile.id
          },
          include: {
            vendedor: {
              include: {
                user: true
              }
            }
          }
        },
        _count: {
          select: {
            vendedores: true,
            orcamentos: true,
            produtos: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Erro ao buscar empresas do vendedor:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
