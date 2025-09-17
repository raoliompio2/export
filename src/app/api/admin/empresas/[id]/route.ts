import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    
    const { observacaoDesaduanagem, observacaoMercosul, observacaoValidade } = body

    // Atualizar empresa
    const empresaAtualizada = await prisma.empresa.update({
      where: { id },
      data: {
        observacaoDesaduanagem,
        observacaoMercosul,
        observacaoValidade,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(empresaAtualizada)
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        observacaoDesaduanagem: true,
        observacaoMercosul: true,
        observacaoValidade: true
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
