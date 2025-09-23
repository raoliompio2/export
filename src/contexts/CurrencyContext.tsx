'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

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
    loading: false, // Começar sem loading
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
    } catch (error) {
      console.error('Erro ao buscar cotação:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }, [])

  // Memoizar funções para evitar re-renders
  const convertCurrency = useCallback((amount: number, from: 'BRL' | 'USD', to: 'BRL' | 'USD'): number => {
    if (from === to) return amount
    
    if (from === 'BRL' && to === 'USD') {
      return amount * data.brlToUsd
    } else if (from === 'USD' && to === 'BRL') {
      return amount * data.usdToBrl
    }
    
    return amount
  }, [data.brlToUsd, data.usdToBrl])

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

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const value = useMemo(() => ({
    ...data,
    convertCurrency,
    formatCurrency,
    refresh: fetchRate
  }), [data, convertCurrency, formatCurrency, fetchRate])

  useEffect(() => {
    // Fetch inicial apenas se não tiver dados
    if (!data.lastUpdated || data.lastUpdated === new Date(0).toISOString()) {
      fetchRate()
    }
    
    // Atualizar a cada 10 minutos (reduzido de 5)
    const interval = setInterval(fetchRate, 10 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchRate, data.lastUpdated])

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