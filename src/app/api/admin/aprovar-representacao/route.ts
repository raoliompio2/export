import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const aprovarSchema = z.object({
  solicitacaoId: z.string().min(1, 'ID da solicitação é obrigatório'),
  acao: z.enum(['APROVAR', 'REJEITAR'])
})

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { solicitacaoId, acao } = aprovarSchema.parse(body)

    // Buscar a solicitação
    const solicitacao = await prisma.solicitacaoRepresentacao.findUnique({
      where: { id: solicitacaoId },
      include: {
        vendedor: {
          include: {
            user: true
          }
        },
        empresa: true
      }
    })

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    if (solicitacao.status !== 'PENDENTE') {
      return NextResponse.json(
        { error: 'Solicitação já foi processada' },
        { status: 400 }
      )
    }

    if (acao === 'APROVAR') {
      // Aprovar: criar VendedorEmpresa e atualizar status
      await prisma.$transaction([
        // Criar associação
        prisma.vendedorEmpresa.create({
          data: {
            vendedorId: solicitacao.vendedorId,
            empresaId: solicitacao.empresaId,
            ativo: true,
            comissao: 5.0 // Padrão 5%
          }
        }),
        // Atualizar status da solicitação
        prisma.solicitacaoRepresentacao.update({
          where: { id: solicitacaoId },
          data: {
            status: 'APROVADA',
            processadoEm: new Date(),
            processadoPor: currentUser.id
          }
        })
      ])

      console.log(`✅ Representação aprovada: ${solicitacao.vendedor.user.nome} → ${solicitacao.empresa.nome}`)

      return NextResponse.json({
        success: true,
        message: 'Solicitação aprovada com sucesso'
      })

    } else {
      // Rejeitar: apenas atualizar status
      await prisma.solicitacaoRepresentacao.update({
        where: { id: solicitacaoId },
        data: {
          status: 'REJEITADA',
          processadoEm: new Date(),
          processadoPor: currentUser.id
        }
      })

      console.log(`❌ Representação rejeitada: ${solicitacao.vendedor.user.nome} → ${solicitacao.empresa.nome}`)

      return NextResponse.json({
        success: true,
        message: 'Solicitação rejeitada'
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao processar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
