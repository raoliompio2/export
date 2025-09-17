'use client'

import { DollarSign, Calculator, Truck } from 'lucide-react'

interface InvoiceTotalsSummaryProps {
  totalBRL: number
  exchangeRate: number
  freteInternacional: number
  language?: 'pt' | 'en' | 'es'
  className?: string
}

export default function InvoiceTotalsSummary({
  totalBRL,
  exchangeRate,
  freteInternacional,
  language = 'pt',
  className = ''
}: InvoiceTotalsSummaryProps) {
  
  // Cálculos claros e corretos
  const totalProdutosUSD = totalBRL / exchangeRate
  const totalCIF = totalProdutosUSD + freteInternacional
  
  const translations = {
    pt: {
      exchange: 'Cotação do Dólar',
      products: 'Valor dos Produtos',
      freight: 'Frete Internacional',
      cifTotal: 'Total CIF',
      only: 'somente',
      included: 'incluído'
    },
    en: {
      exchange: 'Dollar Exchange Rate',
      products: 'Products Value',
      freight: 'International Freight',
      cifTotal: 'CIF Total',
      only: 'only',
      included: 'included'
    },
    es: {
      exchange: 'Cotización del Dólar',
      products: 'Valor de Productos',
      freight: 'Flete Internacional',
      cifTotal: 'Total CIF',
      only: 'solamente',
      included: 'incluido'
    }
  }
  
  const t = translations[language]
  
  const formatCurrency = (amount: number, currency: 'BRL' | 'USD') => {
    return new Intl.NumberFormat(
      currency === 'BRL' ? 'pt-BR' : 'en-US',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }
    ).format(amount)
  }
  
  const formatDate = () => {
    return new Date().toLocaleDateString(
      language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR'
    )
  }

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 ${className}`}>
      
      {/* Header com taxa de câmbio */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t.exchange}</h3>
            <p className="text-sm text-gray-600">{formatDate()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-emerald-600">
            US$ 1 = {formatCurrency(exchangeRate, 'BRL').replace('R$', 'R$')}
          </div>
        </div>
      </div>
      
      {/* Resumo visual em cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Produtos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">{t.products}</h4>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalProdutosUSD, 'USD')}
            </div>
            <div className="text-lg text-gray-600">
              ≈ {formatCurrency(totalBRL, 'BRL')}
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
              {t.only}
            </div>
          </div>
        </div>
        
        {/* Frete */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900">{t.freight}</h4>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(freteInternacional, 'USD')}
            </div>
            <div className="text-lg text-gray-600">
              ≈ {formatCurrency(freteInternacional * exchangeRate, 'BRL')}
            </div>
            <div className="text-xs text-gray-500 bg-orange-50 px-2 py-1 rounded">
              adicional
            </div>
          </div>
        </div>
        
        {/* Total CIF */}
        <div className="bg-emerald-600 rounded-xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-5 w-5 text-white" />
            <h4 className="font-semibold text-white">{t.cifTotal}</h4>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(totalCIF, 'USD')}
            </div>
            <div className="text-lg text-emerald-100">
              ≈ {formatCurrency(totalCIF * exchangeRate, 'BRL')}
            </div>
            <div className="text-xs text-emerald-200 bg-emerald-700 px-2 py-1 rounded">
              frete {t.included}
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Fórmula visual */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <div className="flex items-center justify-center gap-4 text-xl font-bold">
          <span className="text-blue-600">{formatCurrency(totalProdutosUSD, 'USD')}</span>
          <span className="text-gray-400">+</span>
          <span className="text-orange-600">{formatCurrency(freteInternacional, 'USD')}</span>
          <span className="text-gray-400">=</span>
          <span className="text-emerald-600 text-2xl">{formatCurrency(totalCIF, 'USD')}</span>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          <strong>Produtos + Frete Internacional = Total CIF (USD)</strong>
        </div>
        <div className="text-center text-xs text-gray-500 mt-1">
          Valores principais em dólares para exportação
        </div>
      </div>
      
    </div>
  )
}
