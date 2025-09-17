import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Atualizando empresa para Vibromak...')

    // Buscar empresa existente com CNPJ
    const empresaExistente = await prisma.empresa.findUnique({
      where: { cnpj: '12.345.678/0001-99' }
    })

    if (!empresaExistente) {
      return NextResponse.json({ 
        error: 'Empresa com CNPJ 12.345.678/0001-99 não encontrada' 
      }, { status: 404 })
    }

    // Atualizar empresa para Vibromak
    const vibromak = await prisma.empresa.update({
      where: { cnpj: '12.345.678/0001-99' },
      data: {
        nome: 'Vibromak Equipamentos Ltda',
        nomeFantasia: 'Vibromak',
        email: 'contato@vibromak.com.br',
        telefone: '(14) 3454-1900',
        endereco: 'Avenida Yusaburo Sasazaki, 1900',
        numero: '1900',
        bairro: 'Distrito Industrial Santo Barion',
        cidade: 'Marília',
        estado: 'SP',
        cep: '17512-031',
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        corPrimaria: '#1E40AF',
        ativa: true
      }
    })

    // Verificar orçamentos vinculados
    const orcamentosVinculados = await prisma.orcamento.count({
      where: { empresaId: vibromak.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Empresa atualizada para Vibromak com sucesso!',
      empresa: {
        nome: vibromak.nome,
        cidade: vibromak.cidade,
        estado: vibromak.estado,
        endereco: vibromak.endereco
      },
      orcamentosVinculados
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
