import { NextRequest, NextResponse } from 'next/server'

// Cache em memória para evitar muitas chamadas à API externa
let cachedRates: { rate: number; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

async function getRealExchangeRate(): Promise<number> {
  // Verificar cache
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates.rate
  }

  try {
    // API gratuita e confiável para cotação do dólar
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: {
        'User-Agent': 'Painel-Exportacao/1.0'
      }
    })

    if (!response.ok) {
      throw new Error('Falha na API de cotação')
    }

    const data = await response.json()
    const usdToBrl = data.rates.BRL

    if (!usdToBrl || isNaN(usdToBrl)) {
      throw new Error('Taxa de câmbio inválida')
    }

    // Atualizar cache
    cachedRates = {
      rate: usdToBrl,
      timestamp: Date.now()
    }

    return usdToBrl
  } catch (error) {
    console.error('Erro ao buscar cotação real:', error)
    
    // Fallback: buscar de fonte alternativa
    try {
      const fallbackResponse = await fetch('https://api.fixer.io/latest?base=USD&symbols=BRL')
      const fallbackData = await fallbackResponse.json()
      return fallbackData.rates.BRL
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError)
      // Último recurso: taxa estimada (atualizar conforme mercado)
      return 5.85
    }
  }
}

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

    // Se foi fornecida uma cotação customizada, usar ela; caso contrário, buscar cotação real
    let usdToBrlRate: number
    let source: string
    
    if (customRate) {
      const parsedCustomRate = parseFloat(customRate)
      if (isNaN(parsedCustomRate) || parsedCustomRate <= 0) {
        return NextResponse.json(
          { error: 'Cotação customizada inválida' },
          { status: 400 }
        )
      }
      usdToBrlRate = parsedCustomRate
      source = 'custom'
    } else {
      usdToBrlRate = await getRealExchangeRate()
      source = 'exchangerate-api.com'
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
    // Limpar cache e buscar nova cotação
    cachedRates = null
    const newRate = await getRealExchangeRate()

    return NextResponse.json({
      message: 'Cotação atualizada com sucesso',
      rate: newRate,
      timestamp: new Date().toISOString(),
      source: 'exchangerate-api.com'
    })
  } catch (error) {
    console.error('Erro ao atualizar cotação:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cotação' },
      { status: 500 }
    )
  }
}
