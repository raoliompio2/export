import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const crmItemSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  status: z.enum(['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO']).default('ABERTO'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  dataVencimento: z.string().optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Se for vendedor, buscar apenas seus itens CRM
    // Se for admin, buscar todos
    const whereCondition = user.role === 'VENDEDOR' && user.vendedorProfile 
      ? { vendedorId: user.vendedorProfile.id }
      : {}

    const crmItems = await prisma.crmItem.findMany({
      where: whereCondition,
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        interacoes: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { user: true }
        }
      },
      orderBy: [
        { prioridade: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(crmItems)
  } catch (error) {
    console.error('Erro ao buscar itens CRM:', error)
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
    const validatedData = crmItemSchema.parse(body)

    // Verificar se cliente existe e pertence ao vendedor
    const cliente = await prisma.cliente.findUnique({
      where: { id: validatedData.clienteId }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    if (user.role === 'VENDEDOR' && cliente.vendedorId !== user.vendedorProfile.id) {
      return NextResponse.json({ error: 'Cliente não pertence a este vendedor' }, { status: 403 })
    }

    // Criar item CRM
    const crmItem = await prisma.crmItem.create({
      data: {
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        clienteId: validatedData.clienteId,
        vendedorId: user.vendedorProfile.id,
        status: validatedData.status,
        prioridade: validatedData.prioridade,
        dataVencimento: validatedData.dataVencimento ? new Date(validatedData.dataVencimento) : null,
      },
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } }
      }
    })

    return NextResponse.json(crmItem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar item CRM:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
