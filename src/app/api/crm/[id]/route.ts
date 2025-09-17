import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCrmSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').optional(),
  descricao: z.string().optional(),
  status: z.enum(['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  dataVencimento: z.string().optional(),
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

    const crmItem = await prisma.crmItem.findUnique({
      where: { id: params.id },
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        interacoes: {
          orderBy: { createdAt: 'desc' },
          include: { user: true }
        }
      }
    })

    if (!crmItem) {
      return NextResponse.json({ error: 'Item CRM não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este item
    if (user.role === 'VENDEDOR' && crmItem.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(crmItem)
  } catch (error) {
    console.error('Erro ao buscar item CRM:', error)
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
    const validatedData = updateCrmSchema.parse(body)

    // Verificar se item existe
    const existingItem = await prisma.crmItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item CRM não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este item
    if (user.role === 'VENDEDOR' && existingItem.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Atualizar item
    const updatedItem = await prisma.crmItem.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        dataVencimento: validatedData.dataVencimento ? new Date(validatedData.dataVencimento) : undefined,
      },
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        interacoes: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { user: true }
        }
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar item CRM:', error)
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

    // Verificar se item existe
    const existingItem = await prisma.crmItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item CRM não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este item
    if (user.role === 'VENDEDOR' && existingItem.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Excluir item
    await prisma.crmItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Item CRM excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir item CRM:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
