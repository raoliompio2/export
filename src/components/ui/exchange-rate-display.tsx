'use client'

import { useState, useEffect } from 'react'
import { Globe, TrendingUp, RefreshCw } from 'lucide-react'

interface ExchangeRateDisplayProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ExchangeRateDisplay({ 
  className = '', 
  size = 'md' 
}: ExchangeRateDisplayProps) {
  const [rate, setRate] = useState<{
    usdToBrl: number
    lastUpdated: string
    loading: boolean
  }>({
    usdToBrl: 5.87,
    lastUpdated: new Date().toISOString(),
    loading: false
  })

  const fetchRate = async () => {
    setRate(prev => ({ ...prev, loading: true }))
    try {
      const response = await fetch('/api/currency?from=USD&to=BRL&amount=1')
      if (response.ok) {
        const data = await response.json()
        setRate({
          usdToBrl: data.convertedAmount,
          lastUpdated: data.lastUpdated,
          loading: false
        })
      }
    } catch (error) {
      console.error('Erro ao buscar cotação:', error)
      setRate(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchRate()
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRate, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          icon: 'h-3 w-3'
        }
      case 'lg':
        return {
          container: 'px-4 py-3',
          text: 'text-base',
          icon: 'h-5 w-5'
        }
      default:
        return {
          container: 'px-3 py-2',
          text: 'text-sm',
          icon: 'h-4 w-4'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className={`flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg ${sizeClasses.container} ${className}`}>
      <Globe className={`${sizeClasses.icon} text-emerald-600`} />
      <div className="flex items-center gap-2">
        <span className={`font-medium text-emerald-700 ${sizeClasses.text}`}>
          US$ 1 = R$ {rate.usdToBrl.toFixed(2)}
        </span>
        {rate.loading && (
          <RefreshCw className={`${sizeClasses.icon} animate-spin text-emerald-500`} />
        )}
        <button
          onClick={fetchRate}
          className={`${sizeClasses.icon} text-emerald-500 hover:text-emerald-700 transition-colors`}
          title="Atualizar cotação"
        >
          <TrendingUp className={sizeClasses.icon} />
        </button>
      </div>
    </div>
  )
}
