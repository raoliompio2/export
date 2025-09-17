import { NextResponse } from 'next/server'
import { getCurrentUser, getPendingUsers } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    
    // Verificar se é admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const pendingUsers = await getPendingUsers()

    return NextResponse.json({
      users: pendingUsers.map(user => ({
        id: user.id,
        email: user.email,
        nome: user.nome,
        telefone: user.telefone,
        avatar: user.avatar,
        status: user.aprovadoEm ? (user.motivoRejeicao ? 'REJEITADO' : 'APROVADO') : 'PENDENTE',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      count: pendingUsers.length
    })

  } catch (error) {
    console.error('Erro ao buscar usuários pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
