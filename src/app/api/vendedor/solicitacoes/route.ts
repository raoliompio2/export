import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const solicitacaoSchema = z.object({
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  mensagem: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN') || !user.vendedorProfile) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = solicitacaoSchema.parse(body)

    // Verificar se empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: validatedData.empresaId }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se já existe uma relação ativa
    const existingRelation = await prisma.vendedorEmpresa.findUnique({
      where: {
        vendedorId_empresaId: {
          vendedorId: user.vendedorProfile.id,
          empresaId: validatedData.empresaId
        }
      }
    })

    if (existingRelation) {
      if (existingRelation.ativo) {
        return NextResponse.json({ error: 'Você já representa esta empresa' }, { status: 400 })
      } else {
        // Reativar relação existente
        await prisma.vendedorEmpresa.update({
          where: { id: existingRelation.id },
          data: { ativo: true }
        })
        
        return NextResponse.json({ message: 'Representação reativada com sucesso' })
      }
    }

    // Criar nova relação (aprovação automática por enquanto)
    const vendedorEmpresa = await prisma.vendedorEmpresa.create({
      data: {
        vendedorId: user.vendedorProfile.id,
        empresaId: validatedData.empresaId,
        ativo: true,
        comissao: 0,
        meta: 0
      },
      include: {
        empresa: true,
        vendedor: {
          include: { user: true }
        }
      }
    })

    return NextResponse.json(vendedorEmpresa, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar solicitação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN') || !user.vendedorProfile) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const solicitacoes = await prisma.vendedorEmpresa.findMany({
      where: {
        vendedorId: user.vendedorProfile.id
      },
      include: {
        empresa: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(solicitacoes)
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
