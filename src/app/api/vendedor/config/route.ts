import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const configSchema = z.object({
  comissao: z.number().min(0, 'Comissão deve ser positiva').max(100, 'Comissão não pode ser maior que 100%'),
  meta: z.number().min(0, 'Meta deve ser positiva'),
})

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 PUT /api/vendedor/config - Iniciando...')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário:', user?.id, user?.role)
    
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      console.log('❌ Acesso negado - Role:', user?.role)
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (!user.vendedorProfile) {
      console.log('❌ Perfil de vendedor não encontrado')
      return NextResponse.json({ error: 'Perfil de vendedor não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    console.log('📝 Dados recebidos:', body)
    
    const validatedData = configSchema.parse(body)
    console.log('✅ Dados validados:', validatedData)

    // Atualizar configurações do vendedor
    const updatedVendedor = await prisma.vendedor.update({
      where: { id: user.vendedorProfile.id },
      data: {
        comissao: validatedData.comissao,
        meta: validatedData.meta,
      }
    })

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      vendedor: updatedVendedor
    })

  } catch (error) {
    console.log('❌ Erro capturado:', error)
    
    if (error instanceof z.ZodError) {
      console.log('🔍 Erro de validação Zod:', error.errors)
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
