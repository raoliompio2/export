'use client'

import { useState, useEffect } from 'react'

interface SimpleCurrencyDisplayProps {
  amount: number
  currency: 'BRL' | 'USD'
  className?: string
}

export default function SimpleCurrencyDisplay({ 
  amount, 
  currency,
  className = ''
}: SimpleCurrencyDisplayProps) {
  
  const formatCurrency = (value: number, curr: string) => {
    const options = {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
    
    return new Intl.NumberFormat(
      curr === 'BRL' ? 'pt-BR' : 'en-US',
      options
    ).format(value)
  }

  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  )
}
