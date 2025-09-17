import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      vendedorProfile: user.vendedorProfile,
      clienteProfile: user.clienteProfile
    })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
