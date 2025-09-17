'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react'

interface CurrencyConverterProps {
  amount: number
  fromCurrency?: 'BRL' | 'USD'
  toCurrency?: 'BRL' | 'USD'
  showBothValues?: boolean
  className?: string
}

interface ConversionResult {
  from: string
  to: string
  originalAmount: number
  convertedAmount: number
  exchangeRate: number
  lastUpdated: string
}

export default function CurrencyConverter({ 
  amount, 
  fromCurrency = 'BRL', 
  toCurrency = 'USD',
  showBothValues = false,
  className = ''
}: CurrencyConverterProps) {
  const [conversion, setConversion] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchConversion = async () => {
    if (!amount || amount <= 0) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/currency?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      )
      if (response.ok) {
        const data = await response.json()
        setConversion(data)
      }
    } catch (error) {
      console.error('Erro na conversão:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversion()
  }, [amount, fromCurrency, toCurrency])

  const formatCurrency = (value: number, currency: string) => {
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
    
    return new Intl.NumberFormat(
      currency === 'BRL' ? 'pt-BR' : 'en-US',
      options
    ).format(value)
  }

  // Se não tem conversão e está carregando, mostrar loading
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-gray-500">Convertendo...</span>
      </div>
    )
  }

  // Se não tem conversão, mostrar valor original
  if (!conversion) {
    return (
      <span className={className}>
        {formatCurrency(amount, fromCurrency)}
      </span>
    )
  }

  // SEMPRE mostrar APENAS o valor convertido limpo
  return (
    <span className={className}>
      {formatCurrency(conversion.convertedAmount, toCurrency)}
    </span>
  )
}

// Hook para usar conversão de moeda com cotação real
export function useCurrencyConversion() {
  const [exchangeData, setExchangeData] = useState<{
    usdToBrl: number;
    brlToUsd: number;
    lastUpdated: string;
  }>({
    usdToBrl: 5.85,
    brlToUsd: 0.1709,
    lastUpdated: new Date().toISOString()
  })

  const [loading, setLoading] = useState(false)

  const updateRates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/currency?from=BRL&to=USD&amount=1')
      if (response.ok) {
        const data = await response.json()
        setExchangeData({
          usdToBrl: data.usdToBrlRate,
          brlToUsd: data.exchangeRate,
          lastUpdated: data.lastUpdated
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updateRates()
  }, [])

  const convert = (amount: number, from: 'BRL' | 'USD' = 'BRL', to: 'BRL' | 'USD' = 'USD') => {
    if (from === to) return amount
    
    if (from === 'BRL' && to === 'USD') {
      return amount * exchangeData.brlToUsd
    } else if (from === 'USD' && to === 'BRL') {
      return amount * exchangeData.usdToBrl
    }
    
    return amount
  }

  const formatCurrency = (amount: number, currency: 'BRL' | 'USD') => {
    return new Intl.NumberFormat(
      currency === 'BRL' ? 'pt-BR' : 'en-US',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(amount)
  }

  return { 
    convert, 
    formatCurrency, 
    exchangeData, 
    updateRates, 
    loading 
  }
}
