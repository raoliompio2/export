import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de filtro da URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoriaId = searchParams.get('categoriaId') || ''
    const empresaId = searchParams.get('empresaId') || ''
    const destaque = searchParams.get('destaque')

    // Apenas produtos ativos para clientes públicos
    let whereCondition: any = {
      status: 'ATIVO'
    }

    // Aplicar filtros
    if (search) {
      whereCondition.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoriaId) {
      whereCondition.categoriaId = categoriaId
    }

    if (empresaId) {
      whereCondition.empresaId = empresaId
    }

    if (destaque !== null && destaque !== '') {
      whereCondition.destaque = destaque === 'true'
    }

    const produtos = await prisma.produto.findMany({
      where: whereCondition,
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            ativa: true
          }
        },
        empresa: {
          select: {
            id: true,
            nome: true,
            nomeFantasia: true
          }
        }
      },
      orderBy: [
        { destaque: 'desc' },
        { nome: 'asc' }
      ]
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos públicos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
