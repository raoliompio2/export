import { prisma } from '@/lib/prisma'

const CONFIG_KEY = 'cotacao_dolar_config'

// Cache em memória para evitar muitas chamadas à API externa
// Nota: Em ambiente serverless (Vercel, etc), o cache pode não persistir entre requisições
let cachedRates: { rate: number; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para limpar cache (útil para testes ou forçar atualização)
export function clearCurrencyCache() {
  cachedRates = null
}

/**
 * Busca a configuração de cotação salva no banco de dados
 */
export async function getSavedCurrencyConfig(): Promise<{ 
  cotacaoDolar: number | null
  usarCotacaoCustomizada: boolean 
} | null> {
  try {
    const config = await prisma.configuracao.findUnique({
      where: { chave: CONFIG_KEY }
    })

    if (!config) {
      return null
    }

    const configData = JSON.parse(config.valor)
    return {
      cotacaoDolar: configData.cotacaoDolar || null,
      usarCotacaoCustomizada: configData.usarCotacaoCustomizada || false
    }
  } catch (error) {
    console.error('Erro ao buscar configuração de cotação:', error)
    return null
  }
}

/**
 * Busca a cotação real do dia de uma API externa
 */
export async function getRealExchangeRate(): Promise<number> {
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

/**
 * Retorna a cotação atual a ser usada, considerando:
 * 1. Configuração salva no banco (se usarCotacaoCustomizada = true)
 * 2. Cotação real do dia (se não houver configuração customizada)
 * 
 * @returns { rate: number, source: string }
 */
export async function getCurrentExchangeRate(): Promise<{ 
  rate: number
  source: string 
}> {
  // Verificar configuração salva no banco
  const savedConfig = await getSavedCurrencyConfig()
  
  if (savedConfig?.usarCotacaoCustomizada && savedConfig.cotacaoDolar) {
    return {
      rate: savedConfig.cotacaoDolar,
      source: 'custom-saved'
    }
  }
  
  // Buscar cotação real do dia
  const realRate = await getRealExchangeRate()
  return {
    rate: realRate,
    source: 'exchangerate-api.com'
  }
}

