import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const configSchema = z.object({
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  comissao: z.number().min(0).max(100, 'Comissão deve estar entre 0 e 100%'),
  meta: z.number().min(0, 'Meta deve ser positiva')
})

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'VENDEDOR' || !user.vendedorProfile) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = configSchema.parse(body)

    // Verificar se a relação existe
    const vendedorEmpresa = await prisma.vendedorEmpresa.findUnique({
      where: {
        vendedorId_empresaId: {
          vendedorId: user.vendedorProfile.id,
          empresaId: validatedData.empresaId
        }
      }
    })

    if (!vendedorEmpresa) {
      return NextResponse.json({ error: 'Você não representa esta empresa' }, { status: 404 })
    }

    if (!vendedorEmpresa.ativo) {
      return NextResponse.json({ error: 'Representação inativa' }, { status: 400 })
    }

    // Atualizar configurações
    const updatedConfig = await prisma.vendedorEmpresa.update({
      where: { id: vendedorEmpresa.id },
      data: {
        comissao: validatedData.comissao,
        meta: validatedData.meta
      },
      include: {
        empresa: true,
        vendedor: {
          include: { user: true }
        }
      }
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar configuração:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN') || !user.vendedorProfile) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const configs = await prisma.vendedorEmpresa.findMany({
      where: {
        vendedorId: user.vendedorProfile.id,
        ativo: true
      },
      include: {
        empresa: true
      },
      orderBy: { empresa: { nome: 'asc' } }
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
