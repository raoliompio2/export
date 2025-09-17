import { NextRequest, NextResponse } from 'next/server'
import { requireVendedor, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  ativa: z.boolean().default(true),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const categorias = await prisma.categoria.findMany({
      where: {
        ativa: true  // Só categorias ativas
      },
      include: {
        _count: {
          select: {
            produtos: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = categoriaSchema.parse(body)

    // Verificar se nome já existe
    const existingCategoria = await prisma.categoria.findUnique({
      where: { nome: validatedData.nome }
    })

    if (existingCategoria) {
      return NextResponse.json(
        { error: 'Nome da categoria já existe' },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoria.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            produtos: true
          }
        }
      }
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
