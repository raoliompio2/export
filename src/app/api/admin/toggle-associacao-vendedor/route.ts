import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const toggleSchema = z.object({
  associacaoId: z.string().min(1, 'ID da associação é obrigatório'),
  ativo: z.boolean()
})

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { associacaoId, ativo } = toggleSchema.parse(body)

    // Atualizar status da associação
    const associacao = await prisma.vendedorEmpresa.update({
      where: { id: associacaoId },
      data: { ativo },
      include: {
        vendedor: {
          include: {
            user: {
              select: {
                nome: true
              }
            }
          }
        },
        empresa: {
          select: {
            nome: true
          }
        }
      }
    })

    console.log(`${ativo ? '✅ Ativada' : '❌ Desativada'} associação: ${associacao.vendedor.user.nome} → ${associacao.empresa.nome}`)

    return NextResponse.json({
      success: true,
      message: `Associação ${ativo ? 'ativada' : 'desativada'} com sucesso`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao alterar associação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
