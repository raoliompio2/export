import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const usuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  role: z.enum(['ADMIN', 'VENDEDOR', 'CLIENTE']),
  ativo: z.boolean().default(true)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        clienteProfile: true,
        vendedorProfile: true,
        _count: {
          select: {
            orcamentos: true
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = usuarioSchema.parse(body)

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se email já está em uso (exceto pelo próprio usuário)
    if (validatedData.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.user.update({
      where: { id: id },
      data: validatedData,
      include: {
        clienteProfile: true,
        vendedorProfile: true,
        _count: {
          select: {
            orcamentos: true
          }
        }
      }
    })

    // Se mudou o role, criar/remover perfis
    if (validatedData.role !== existingUser.role) {
      // Remover perfis antigos
      if (existingUser.role === 'CLIENTE') {
        await prisma.cliente.deleteMany({
          where: { userId: id }
        })
      } else if (existingUser.role === 'VENDEDOR') {
        await prisma.vendedor.deleteMany({
          where: { userId: id }
        })
      }

      // Criar novo perfil
      if (validatedData.role === 'CLIENTE') {
        await prisma.cliente.create({
          data: {
            userId: id
          }
        })
      } else if (validatedData.role === 'VENDEDOR') {
        await prisma.vendedor.create({
          data: {
            userId: id
          }
        })
      }
    }

    return NextResponse.json(usuarioAtualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Não permitir deletar o próprio usuário
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Não é possível deletar seu próprio usuário' },
        { status: 400 }
      )
    }

    // Deletar usuário (cascade vai deletar os perfis)
    await prisma.user.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Usuário deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
