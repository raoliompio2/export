import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const [
      totalUsuarios,
      totalVendedores,
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      orcamentosAprovados,
      usuariosAtivos
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VENDEDOR' } }),
      prisma.user.count({ where: { role: 'CLIENTE' } }),
      prisma.produto.count(),
      prisma.orcamento.count(),
      prisma.orcamento.count({ where: { status: 'APROVADO' } }),
      prisma.user.count({ where: { ativo: true } })
    ])

    const taxaConversao = totalOrcamentos > 0 ? (orcamentosAprovados / totalOrcamentos * 100) : 0

    return NextResponse.json({
      totalUsuarios,
      totalVendedores,
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      orcamentosAprovados,
      usuariosAtivos,
      taxaConversao
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    )
  }
}
