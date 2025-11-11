import { NextRequest, NextResponse } from 'next/server'
import { getCurrentExchangeRate } from '@/utils/currency-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'BRL'
    const to = searchParams.get('to') || 'USD'
    const amount = parseFloat(searchParams.get('amount') || '1')
    const customRate = searchParams.get('customRate')

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Se foi fornecida uma cotação customizada via parâmetro, usar ela
    // Caso contrário, buscar cotação atual (considera configuração salva ou cotação do dia)
    let usdToBrlRate: number
    let source: string
    
    if (customRate) {
      // Prioridade 1: Cotação customizada via parâmetro
      const parsedCustomRate = parseFloat(customRate)
      if (isNaN(parsedCustomRate) || parsedCustomRate <= 0) {
        return NextResponse.json(
          { error: 'Cotação customizada inválida' },
          { status: 400 }
        )
      }
      usdToBrlRate = parsedCustomRate
      source = 'custom-param'
    } else {
      // Prioridade 2: Buscar cotação atual (já considera configuração salva ou cotação do dia)
      const currentRate = await getCurrentExchangeRate()
      usdToBrlRate = currentRate.rate
      source = currentRate.source
    }
    
    let convertedAmount: number
    let exchangeRate: number
    
    if (from === 'BRL' && to === 'USD') {
      // Converter Real para Dólar
      exchangeRate = 1 / usdToBrlRate
      convertedAmount = amount * exchangeRate
    } else if (from === 'USD' && to === 'BRL') {
      // Converter Dólar para Real
      exchangeRate = usdToBrlRate
      convertedAmount = amount * exchangeRate
    } else {
      // Mesma moeda
      exchangeRate = 1
      convertedAmount = amount
    }

    return NextResponse.json({
      from,
      to,
      originalAmount: amount,
      convertedAmount: Number(convertedAmount.toFixed(2)),
      exchangeRate: Number(exchangeRate.toFixed(4)),
      usdToBrlRate: Number(usdToBrlRate.toFixed(4)),
      lastUpdated: new Date().toISOString(),
      source: source,
      isCustom: !!customRate
    })

  } catch (error) {
    console.error('Erro na conversão de moeda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para forçar atualização da cotação
export async function POST() {
  try {
    // Buscar cotação atual (força atualização)
    const currentRate = await getCurrentExchangeRate()

    return NextResponse.json({
      message: 'Cotação atualizada com sucesso',
      rate: currentRate.rate,
      timestamp: new Date().toISOString(),
      source: currentRate.source
    })
  } catch (error) {
    console.error('Erro ao atualizar cotação:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cotação' },
      { status: 500 }
    )
  }
}
