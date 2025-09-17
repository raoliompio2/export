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

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const usuarios = await prisma.user.findMany({
      include: {
        clienteProfile: true,
        vendedorProfile: true,
        _count: {
          select: {
            orcamentos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
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
    const validatedData = usuarioSchema.parse(body)

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

    // Criar usuário
    const novoUsuario = await prisma.user.create({
      data: {
        ...validatedData,
        clerkId: `temp_${Date.now()}` // Temporário até integração com Clerk
      },
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

    // Criar perfil baseado no role
    if (validatedData.role === 'CLIENTE') {
      await prisma.cliente.create({
        data: {
          userId: novoUsuario.id
        }
      })
    } else if (validatedData.role === 'VENDEDOR') {
      await prisma.vendedor.create({
        data: {
          userId: novoUsuario.id
        }
      })
    }

    return NextResponse.json(novoUsuario, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
