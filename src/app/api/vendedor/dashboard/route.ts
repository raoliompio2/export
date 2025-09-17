import { NextRequest, NextResponse } from 'next/server'
import { requireVendedor } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireVendedor()
    
    // Buscar dados do vendedor
    const vendedorData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        vendedorProfile: {
          include: {
            empresas: {
              include: {
                empresa: true
              }
            }
          }
        }
      }
    })

    if (!vendedorData?.vendedorProfile) {
      return NextResponse.json(
        { error: 'Perfil de vendedor não encontrado' },
        { status: 404 }
      )
    }

    const vendedorId = vendedorData.vendedorProfile.id

    // Buscar estatísticas
    const [
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      orcamentosRecentes,
      clientesRecentes,
      vendasAprovadas
    ] = await Promise.all([
      prisma.cliente.count({
        where: { vendedorId }
      }),
      prisma.produto.count({
        where: {
          empresa: {
            vendedores: {
              some: { vendedorId }
            }
          }
        }
      }),
      prisma.orcamento.count({
        where: { vendedorId }
      }),
      prisma.orcamento.findMany({
        where: { vendedorId },
        include: {
          cliente: {
            include: {
              user: true
            }
          },
          empresa: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.cliente.findMany({
        where: { vendedorId },
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Buscar total de vendas aprovadas do mês atual
      prisma.orcamento.aggregate({
        where: {
          vendedorId,
          status: 'APROVADO',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          total: true
        }
      })
    ])

    const totalVendas = vendasAprovadas._sum.total || 0

    return NextResponse.json({
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      totalVendas,
      orcamentosRecentes,
      clientesRecentes,
      vendedorData
    })

  } catch (error) {
    console.error('Erro no dashboard vendedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
