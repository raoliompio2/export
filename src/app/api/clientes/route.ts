import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
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

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Se for vendedor, buscar apenas seus clientes
    // Se for admin, buscar todos os clientes
    const whereCondition = user.role === 'VENDEDOR' && user.vendedorProfile 
      ? { vendedorId: user.vendedorProfile.id }
      : {}

    const clientes = await prisma.cliente.findMany({
      where: whereCondition,
      include: {
        user: true,
        vendedor: { include: { user: true } },
        _count: {
          select: {
            orcamentos: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (!user.vendedorProfile) {
      return NextResponse.json({ error: 'Perfil de vendedor não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = clienteSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Criar usuário cliente
    const userCliente = await prisma.user.create({
      data: {
        clerkId: `local_${Date.now()}_${Math.random()}`, // Clerk ID temporário
        email: validatedData.email,
        nome: validatedData.nome,
        telefone: validatedData.telefone,
        role: 'CLIENTE',
        ativo: true
      }
    })

    // Criar perfil de cliente
    const cliente = await prisma.cliente.create({
      data: {
        userId: userCliente.id,
        vendedorId: user.vendedorProfile.id,
        empresa: validatedData.empresa,
        cnpj: validatedData.cnpj,
        cpf: validatedData.cpf,
        endereco: validatedData.endereco,
        cidade: validatedData.cidade,
        estado: validatedData.estado,
        cep: validatedData.cep,
        observacoes: validatedData.observacoes,
      },
      include: {
        user: true,
        vendedor: { include: { user: true } }
      }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
