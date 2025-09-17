import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para atualizar item do carrinho
const updateItemSchema = z.object({
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  observacoes: z.string().optional()
})

// PUT - Atualizar item do carrinho
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user || !user.clienteProfile) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas clientes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)

    // Verificar se o item pertence ao cliente
    const item = await prisma.carrinhoItem.findFirst({
      where: {
        id: id,
        clienteId: user.clienteProfile.id
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      )
    }

    // Atualizar item
    const itemAtualizado = await prisma.carrinhoItem.update({
      where: { id: id },
      data: {
        quantidade: validatedData.quantidade,
        observacoes: validatedData.observacoes
      },
      include: {
        produto: {
          include: {
            categoria: true,
            empresa: true
          }
        }
      }
    })

    return NextResponse.json(itemAtualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('❌ Erro ao atualizar item do carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover item do carrinho
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user || !user.clienteProfile) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas clientes' },
        { status: 403 }
      )
    }

    // Verificar se o item pertence ao cliente
    const item = await prisma.carrinhoItem.findFirst({
      where: {
        id: id,
        clienteId: user.clienteProfile.id
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      )
    }

    // Remover item
    await prisma.carrinhoItem.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Item removido do carrinho' })
  } catch (error) {
    console.error('❌ Erro ao remover item do carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
