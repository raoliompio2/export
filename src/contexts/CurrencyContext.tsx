'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface CurrencyRateData {
  usdToBrl: number
  brlToUsd: number
  lastUpdated: string
  loading: boolean
  error: string | null
}

interface CurrencyContextType extends CurrencyRateData {
  convertCurrency: (amount: number, from: 'BRL' | 'USD', to: 'BRL' | 'USD') => number
  formatCurrency: (amount: number, currency: 'BRL' | 'USD') => string
  refresh: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CurrencyRateData>({
    usdToBrl: 5.85, // Fallback
    brlToUsd: 0.1709,
    lastUpdated: new Date().toISOString(),
    loading: true,
    error: null
  })

  const fetchRate = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/currency?from=BRL&to=USD&amount=1')
      
      if (!response.ok) {
        throw new Error('Falha ao buscar cotação')
      }
      
      const result = await response.json()
      
      setData({
        usdToBrl: result.usdToBrlRate,
        brlToUsd: result.exchangeRate,
        lastUpdated: result.lastUpdated,
        loading: false,
        error: null
      })
      
      console.log('💰 Taxa de câmbio carregada globalmente:', {
        usdToBrl: result.usdToBrlRate,
        brlToUsd: result.exchangeRate
      })
    } catch (error) {
      console.error('Erro ao buscar cotação:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }, [])

  useEffect(() => {
    fetchRate()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRate, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchRate])

  const convertCurrency = useCallback((amount: number, from: 'BRL' | 'USD', to: 'BRL' | 'USD'): number => {
    if (from === to) return amount
    
    if (from === 'BRL' && to === 'USD') {
      return amount * data.brlToUsd
    } else if (from === 'USD' && to === 'BRL') {
      return amount * data.usdToBrl
    }
    
    return amount
  }, [data])

  const formatCurrency = useCallback((amount: number, currency: 'BRL' | 'USD'): string => {
    return new Intl.NumberFormat(
      currency === 'BRL' ? 'pt-BR' : 'en-US',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(amount)
  }, [])

  const value: CurrencyContextType = {
    ...data,
    convertCurrency,
    formatCurrency,
    refresh: fetchRate
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency deve ser usado dentro de um CurrencyProvider')
  }
  return context
}
