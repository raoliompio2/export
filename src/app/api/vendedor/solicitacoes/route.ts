import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SolicitacaoStatus } from '@prisma/client'
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

    // Verificar se já existe solicitação pendente
    const existingSolicitacao = await prisma.solicitacaoRepresentacao.findUnique({
      where: {
        vendedorId_empresaId: {
          vendedorId: user.vendedorProfile.id,
          empresaId: validatedData.empresaId
        }
      }
    })

    if (existingSolicitacao) {
      if (existingSolicitacao.status === SolicitacaoStatus.PENDENTE) {
        return NextResponse.json({ error: 'Você já tem uma solicitação pendente para esta empresa' }, { status: 400 })
      } else if (existingSolicitacao.status === SolicitacaoStatus.REJEITADA) {
        // Permitir nova solicitação se foi rejeitada
        await prisma.solicitacaoRepresentacao.update({
          where: { id: existingSolicitacao.id },
          data: {
            status: SolicitacaoStatus.PENDENTE,
            mensagem: validatedData.mensagem,
            processadoEm: null,
            processadoPor: null
          }
        })
        return NextResponse.json({ message: 'Nova solicitação enviada para análise' })
      }
    }

    // Criar nova solicitação pendente
    const solicitacao = await prisma.solicitacaoRepresentacao.create({
      data: {
        vendedorId: user.vendedorProfile.id,
        empresaId: validatedData.empresaId,
        status: SolicitacaoStatus.PENDENTE,
        mensagem: validatedData.mensagem
      },
      include: {
        empresa: true,
        vendedor: {
          include: { user: true }
        }
      }
    })

    console.log(`📨 Nova solicitação criada: ${user.nome} → ${empresa.nome}`)

    return NextResponse.json({
      message: 'Solicitação enviada com sucesso! Aguarde a aprovação do administrador.',
      solicitacao
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
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

    const solicitacoes = await prisma.solicitacaoRepresentacao.findMany({
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
