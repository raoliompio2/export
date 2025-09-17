import { NextRequest, NextResponse } from 'next/server'
import { requireVendedor, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const produtoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  preco: z.number().min(0, 'Preço deve ser positivo'),
  precoPromocional: z.number().min(0).optional(),
  unidade: z.string().default('UN'),
  estoque: z.number().int().min(0).default(0),
  estoqueMinimo: z.number().int().min(0).default(0),
  peso: z.number().min(0).optional(),
  dimensoes: z.string().optional(),
  imagens: z.array(z.string()).default([]),
  status: z.enum(['ATIVO', 'INATIVO', 'DESCONTINUADO']).default('ATIVO'),
  destaque: z.boolean().default(false),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const produto = await prisma.produto.findUnique({
      where: { id: params.id },
      include: {
        categoria: true,
        empresa: true
      }
    })

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(produto)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = produtoSchema.parse(body)

    // Verificar se produto existe
    const existingProduto = await prisma.produto.findUnique({
      where: { id: params.id }
    })

    if (!existingProduto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se código já existe em outro produto
    const produtoComMesmoCodigo = await prisma.produto.findFirst({
      where: { 
        codigo: validatedData.codigo,
        id: { not: params.id }
      }
    })

    if (produtoComMesmoCodigo) {
      return NextResponse.json(
        { error: 'Código do produto já existe' },
        { status: 400 }
      )
    }

    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        categoria: true,
        empresa: true
      }
    })

    return NextResponse.json(produto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se produto existe
    const existingProduto = await prisma.produto.findUnique({
      where: { id: params.id }
    })

    if (!existingProduto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar se produto está em orçamentos
    const orcamentosComProduto = await prisma.orcamentoItem.findFirst({
      where: { produtoId: params.id }
    })

    if (orcamentosComProduto) {
      return NextResponse.json(
        { error: 'Produto não pode ser excluído pois está vinculado a orçamentos' },
        { status: 400 }
      )
    }

    await prisma.produto.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
