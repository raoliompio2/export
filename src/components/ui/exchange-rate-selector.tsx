'use client'

import { useState, useEffect } from 'react'
import { Globe, TrendingUp, RefreshCw, Edit2, Check, X } from 'lucide-react'

interface ExchangeRateSelectorProps {
  value?: number
  onChange?: (rate: number, isCustom: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ExchangeRateSelector({ 
  value,
  onChange,
  className = '', 
  size = 'md',
  showLabel = true
}: ExchangeRateSelectorProps) {
  const [currentRate, setCurrentRate] = useState<{
    usdToBrl: number
    lastUpdated: string
    loading: boolean
  }>({
    usdToBrl: value || 5.87,
    lastUpdated: new Date().toISOString(),
    loading: false
  })
  
  const [isCustom, setIsCustom] = useState(false)
  const [customRate, setCustomRate] = useState<string>(value?.toFixed(4) || '5.8700')
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('')

  const fetchCurrentRate = async () => {
    setCurrentRate(prev => ({ ...prev, loading: true }))
    try {
      const response = await fetch('/api/currency?from=USD&to=BRL&amount=1')
      if (response.ok) {
        const data = await response.json()
        const newRate = {
          usdToBrl: data.convertedAmount,
          lastUpdated: data.lastUpdated,
          loading: false
        }
        setCurrentRate(newRate)
        
        // Se não está em modo customizado, atualizar o valor
        if (!isCustom && onChange) {
          onChange(newRate.usdToBrl, false)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cotação:', error)
      setCurrentRate(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    if (value) {
      if (!isCustom) {
        setCurrentRate(prev => ({ ...prev, usdToBrl: value }))
      } else {
        setCustomRate(value.toFixed(4))
      }
    }
  }, [value, isCustom])

  useEffect(() => {
    // Buscar cotação atual ao montar
    fetchCurrentRate()
    // Atualizar a cada 5 minutos se não estiver em modo customizado
    if (!isCustom) {
      const interval = setInterval(fetchCurrentRate, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isCustom])

  const handleToggleMode = () => {
    const newIsCustom = !isCustom
    setIsCustom(newIsCustom)
    
    if (newIsCustom) {
      // Mudando para customizado
      setCustomRate(currentRate.usdToBrl.toFixed(4))
      setEditValue(currentRate.usdToBrl.toFixed(4))
      if (onChange) {
        onChange(currentRate.usdToBrl, true)
      }
    } else {
      // Mudando para atual
      fetchCurrentRate()
      if (onChange) {
        onChange(currentRate.usdToBrl, false)
      }
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditValue(customRate)
  }

  const handleSaveCustom = () => {
    const numValue = parseFloat(editValue.replace(',', '.'))
    if (!isNaN(numValue) && numValue > 0) {
      setCustomRate(numValue.toFixed(4))
      setIsEditing(false)
      if (onChange) {
        onChange(numValue, true)
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditValue(customRate)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          icon: 'h-3 w-3',
          input: 'text-xs px-2 py-1'
        }
      case 'lg':
        return {
          container: 'px-4 py-3',
          text: 'text-base',
          icon: 'h-5 w-5',
          input: 'text-base px-3 py-2'
        }
      default:
        return {
          container: 'px-3 py-2',
          text: 'text-sm',
          icon: 'h-4 w-4',
          input: 'text-sm px-2 py-1'
        }
    }
  }

  const sizeClasses = getSizeClasses()
  const displayRate = isCustom ? parseFloat(customRate) : currentRate.usdToBrl

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label className={`font-medium text-gray-700 ${sizeClasses.text}`}>
          Cotação do Dólar
        </label>
      )}
      
      <div className={`flex items-center gap-2 bg-white border ${isCustom ? 'border-blue-300' : 'border-emerald-200'} rounded-lg ${sizeClasses.container} shadow-sm`}>
        <Globe className={`${sizeClasses.icon} ${isCustom ? 'text-blue-600' : 'text-emerald-600'}`} />
        
        <div className="flex items-center gap-2 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={`border border-gray-300 rounded px-2 py-1 ${sizeClasses.input} w-20 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="5.8700"
                autoFocus
              />
              <button
                onClick={handleSaveCustom}
                className={`${sizeClasses.icon} text-green-600 hover:text-green-700 transition-colors`}
                title="Salvar"
              >
                <Check className={sizeClasses.icon} />
              </button>
              <button
                onClick={handleCancelEdit}
                className={`${sizeClasses.icon} text-red-600 hover:text-red-700 transition-colors`}
                title="Cancelar"
              >
                <X className={sizeClasses.icon} />
              </button>
            </div>
          ) : (
            <>
              <span className={`font-medium ${isCustom ? 'text-blue-700' : 'text-emerald-700'} ${sizeClasses.text}`}>
                US$ 1 = R$ {displayRate.toFixed(4)}
              </span>
              {isCustom && (
                <button
                  onClick={handleEditClick}
                  className={`${sizeClasses.icon} text-blue-500 hover:text-blue-700 transition-colors`}
                  title="Editar cotação customizada"
                >
                  <Edit2 className={sizeClasses.icon} />
                </button>
              )}
              {!isCustom && currentRate.loading && (
                <RefreshCw className={`${sizeClasses.icon} animate-spin text-emerald-500`} />
              )}
              {!isCustom && (
                <button
                  onClick={fetchCurrentRate}
                  className={`${sizeClasses.icon} text-emerald-500 hover:text-emerald-700 transition-colors`}
                  title="Atualizar cotação"
                >
                  <TrendingUp className={sizeClasses.icon} />
                </button>
              )}
            </>
          )}
        </div>
        
        <button
          onClick={handleToggleMode}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            isCustom 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
          title={isCustom ? 'Usar cotação atual' : 'Usar cotação customizada'}
        >
          {isCustom ? 'Atual' : 'Custom'}
        </button>
      </div>
      
      {isCustom && (
        <p className={`text-gray-500 ${sizeClasses.text}`}>
          💡 Você está usando uma cotação customizada. Clique em "Atual" para voltar à cotação em tempo real.
        </p>
      )}
    </div>
  )
}

