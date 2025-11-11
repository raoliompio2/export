import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const configSchema = z.object({
  cotacaoDolar: z.number().positive('Cotação deve ser positiva'),
  usarCotacaoCustomizada: z.boolean(),
  ultimaAtualizacao: z.string().optional()
})

const CONFIG_KEY = 'cotacao_dolar_config'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar configuração do banco
    const config = await prisma.configuracao.findUnique({
      where: { chave: CONFIG_KEY }
    })

    if (!config) {
      // Retornar configuração padrão
      return NextResponse.json({
        cotacaoDolar: null,
        usarCotacaoCustomizada: false,
        ultimaAtualizacao: null
      })
    }

    // Parsear valor JSON
    const configData = JSON.parse(config.valor)

    return NextResponse.json({
      cotacaoDolar: configData.cotacaoDolar || null,
      usarCotacaoCustomizada: configData.usarCotacaoCustomizada || false,
      ultimaAtualizacao: configData.ultimaAtualizacao || null
    })

  } catch (error) {
    console.error('Erro ao buscar configuração de cotação:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = configSchema.parse(body)

    // Preparar valor para salvar
    const configValue = {
      cotacaoDolar: validatedData.cotacaoDolar,
      usarCotacaoCustomizada: validatedData.usarCotacaoCustomizada,
      ultimaAtualizacao: validatedData.ultimaAtualizacao || new Date().toISOString()
    }

    // Salvar ou atualizar configuração
    const config = await prisma.configuracao.upsert({
      where: { chave: CONFIG_KEY },
      update: {
        valor: JSON.stringify(configValue),
        tipo: 'JSON',
        descricao: 'Configuração da cotação do dólar (USD/BRL)',
        updatedAt: new Date()
      },
      create: {
        chave: CONFIG_KEY,
        valor: JSON.stringify(configValue),
        tipo: 'JSON',
        descricao: 'Configuração da cotação do dólar (USD/BRL)'
      }
    })

    return NextResponse.json({
      message: 'Configuração salva com sucesso',
      config: configValue
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues ?? []
      return NextResponse.json(
        { error: 'Dados inválidos', details: errorDetails },
        { status: 400 }
      )
    }

    console.error('Erro ao salvar configuração de cotação:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configuração' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Remover configuração (voltar para padrão)
    await prisma.configuracao.deleteMany({
      where: { chave: CONFIG_KEY }
    })

    return NextResponse.json({
      message: 'Configuração removida. Sistema voltará a usar cotação do dia.'
    })

  } catch (error) {
    console.error('Erro ao remover configuração:', error)
    return NextResponse.json(
      { error: 'Erro ao remover configuração' },
      { status: 500 }
    )
  }
}

