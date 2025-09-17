import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Buscando orçamento público:', id)
    
    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        empresa: true,
        itens: {
          include: { produto: true }
        }
      }
    })

    console.log('📄 Orçamento encontrado:', orcamento ? 'SIM' : 'NÃO')

    if (!orcamento) {
      console.log('❌ Orçamento não encontrado no banco de dados')
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    console.log('📊 Status do orçamento:', orcamento.status)

    // Permitir visualização pública para todos os status por enquanto (para debug)
    // if (!['ENVIADO', 'APROVADO'].includes(orcamento.status)) {
    //   console.log('🚫 Status não permite visualização pública')
    //   return NextResponse.json({ error: 'Orçamento não disponível para visualização pública' }, { status: 403 })
    // }

    console.log('✅ Retornando orçamento para visualização pública')

    // Adicionar headers para não indexação
    const response = NextResponse.json(orcamento)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response
  } catch (error) {
    console.error('💥 Erro ao buscar orçamento público:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
