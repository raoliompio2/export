import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, approveUser, rejectUser } from '@/lib/auth'
import { UserRole, UserStatus } from '@prisma/client'
import { z } from 'zod'

const approveUserSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  action: z.enum(['APPROVE', 'REJECT']),
  role: z.enum(['CLIENTE', 'VENDEDOR']).optional(),
  motivo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    // Verificar se é admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = approveUserSchema.parse(body)

    const { userId, action, role, motivo } = validatedData

    if (action === 'APPROVE') {
      if (!role) {
        return NextResponse.json(
          { error: 'Role é obrigatório para aprovação' },
          { status: 400 }
        )
      }

      const user = await approveUser(
        userId,
        role as UserRole,
        currentUser.id
      )

      return NextResponse.json({
        success: true,
        message: `Usuário aprovado como ${role}`,
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: user.role,
          status: UserStatus.APROVADO,
        }
      })

    } else if (action === 'REJECT') {
      if (!motivo) {
        return NextResponse.json(
          { error: 'Motivo é obrigatório para rejeição' },
          { status: 400 }
        )
      }

      const user = await rejectUser(
        userId,
        motivo,
        currentUser.id
      )

      return NextResponse.json({
        success: true,
        message: 'Usuário rejeitado',
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          status: UserStatus.REJEITADO,
          motivoRejeicao: motivo,
        }
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao processar aprovação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
