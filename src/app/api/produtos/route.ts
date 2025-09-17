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
  empresaId: z.string().optional(), // Opcional para vendedores (será preenchido automaticamente)
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

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Admin vê todos, vendedor vê apenas produtos das empresas que representa, cliente vê produtos ativos
    let whereCondition: any = {}
    
    if (user.role === 'VENDEDOR' && user.vendedorProfile) {
      // Buscar produtos das empresas que o vendedor representa
      const vendedorEmpresas = await prisma.vendedorEmpresa.findMany({
        where: {
          vendedorId: user.vendedorProfile.id,
          ativo: true
        },
        select: { empresaId: true }
      })
      
      whereCondition = {
        empresaId: {
          in: vendedorEmpresas.map(ve => ve.empresaId)
        }
      }
    } else if (user.role === 'CLIENTE') {
      // Cliente vê apenas produtos ativos
      whereCondition = {
        status: 'ATIVO'
      }
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const produtos = await prisma.produto.findMany({
      where: whereCondition,
      include: {
        categoria: true,
        empresa: true
      },
      orderBy: [
        { destaque: 'desc' },
        { nome: 'asc' }
      ]
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = produtoSchema.parse(body)

    // Verificar se código já existe
    const existingProduto = await prisma.produto.findUnique({
      where: { codigo: validatedData.codigo }
    })

    if (existingProduto) {
      return NextResponse.json(
        { error: 'Código do produto já existe' },
        { status: 400 }
      )
    }

    // Para admin, empresaId é obrigatório no body
    // Para vendedor, pegar primeira empresa que representa (por enquanto)
    let empresaId = validatedData.empresaId
    
    if (user.role === 'VENDEDOR' && user.vendedorProfile && !empresaId) {
      const vendedorEmpresa = await prisma.vendedorEmpresa.findFirst({
        where: {
          vendedorId: user.vendedorProfile.id,
          ativo: true
        }
      })
      
      if (!vendedorEmpresa) {
        return NextResponse.json(
          { error: 'Vendedor não está associado a nenhuma empresa' },
          { status: 400 }
        )
      }
      
      empresaId = vendedorEmpresa.empresaId
    }

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const produto = await prisma.produto.create({
      data: {
        ...validatedData,
        empresaId
      },
      include: {
        categoria: true,
        empresa: true
      }
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
