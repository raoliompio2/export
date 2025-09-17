import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clienteUpdateSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        user: true,
        vendedor: { include: { user: true } },
        orcamentos: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este cliente
    if (user.role === 'VENDEDOR' && cliente.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = clienteUpdateSchema.parse(body)

    // Verificar se cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingCliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este cliente
    if (user.role === 'VENDEDOR' && existingCliente.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se email já existe (se está sendo alterado)
    if (validatedData.email && validatedData.email !== existingCliente.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Atualizar dados do usuário
    const userUpdateData: any = {}
    if (validatedData.nome) userUpdateData.nome = validatedData.nome
    if (validatedData.email) userUpdateData.email = validatedData.email
    if (validatedData.telefone !== undefined) userUpdateData.telefone = validatedData.telefone

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: existingCliente.userId },
        data: userUpdateData
      })
    }

    // Atualizar dados do cliente
    const clienteUpdateData: any = {}
    if (validatedData.empresa !== undefined) clienteUpdateData.empresa = validatedData.empresa
    if (validatedData.cnpj !== undefined) clienteUpdateData.cnpj = validatedData.cnpj
    if (validatedData.cpf !== undefined) clienteUpdateData.cpf = validatedData.cpf
    if (validatedData.endereco !== undefined) clienteUpdateData.endereco = validatedData.endereco
    if (validatedData.cidade !== undefined) clienteUpdateData.cidade = validatedData.cidade
    if (validatedData.estado !== undefined) clienteUpdateData.estado = validatedData.estado
    if (validatedData.cep !== undefined) clienteUpdateData.cep = validatedData.cep
    if (validatedData.observacoes !== undefined) clienteUpdateData.observacoes = validatedData.observacoes

    const updatedCliente = await prisma.cliente.update({
      where: { id },
      data: clienteUpdateData,
      include: {
        user: true,
        vendedor: { include: { user: true } }
      }
    })

    return NextResponse.json(updatedCliente)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    // Verificar se cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orcamentos: true
          }
        }
      }
    })

    if (!existingCliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este cliente
    if (user.role === 'VENDEDOR' && existingCliente.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se cliente tem orçamentos
    if (existingCliente._count.orcamentos > 0) {
      return NextResponse.json(
        { error: 'Cliente não pode ser excluído pois possui orçamentos vinculados' },
        { status: 400 }
      )
    }

    // Excluir cliente (o usuário será excluído automaticamente por cascade)
    await prisma.cliente.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cliente excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
