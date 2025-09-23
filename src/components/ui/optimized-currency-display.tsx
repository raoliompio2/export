'use client'

import { useCurrency } from '@/contexts/CurrencyContext'
import { RefreshCw } from 'lucide-react'

interface OptimizedCurrencyDisplayProps {
  amount: number
  fromCurrency?: 'BRL' | 'USD'
  toCurrency?: 'BRL' | 'USD'
  showBothValues?: boolean
  className?: string
}

export default function OptimizedCurrencyDisplay({ 
  amount, 
  fromCurrency = 'BRL', 
  toCurrency = 'USD',
  showBothValues = false,
  className = ''
}: OptimizedCurrencyDisplayProps) {
  const { convertCurrency, formatCurrency, loading, error } = useCurrency()

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-gray-500">Convertendo...</span>
      </span>
    )
  }

  if (error) {
    return (
      <span className={`text-red-500 ${className}`}>
        {formatCurrency(amount, fromCurrency)}
      </span>
    )
  }

  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency)

  if (showBothValues) {
    return (
      <span className={className}>
        <span className="font-semibold">{formatCurrency(convertedAmount, toCurrency)}</span>
        <span className="text-sm text-gray-500 ml-2">
          ({formatCurrency(amount, fromCurrency)})
        </span>
      </span>
    )
  }

  return (
    <span className={className}>
      {formatCurrency(convertedAmount, toCurrency)}
    </span>
  )
}
