'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  DollarSign, 
  Save, 
  Loader2,
  Globe,
  RefreshCw,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react'
import ExchangeRateSelector from '@/components/ui/exchange-rate-selector'
import ModernButton from '@/components/ui/modern-button'
import ModernCard from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'

interface CurrencyConfig {
  currentRate: number
  customRate: number | null
  isUsingCustom: boolean
  lastUpdated: string
  source: string
}

export default function ConfigCotacaoDolarPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(5.87)
  const [isCustomRate, setIsCustomRate] = useState(false)
  const [config, setConfig] = useState<CurrencyConfig | null>(null)
  const { success, error } = useToast()

  const fetchCurrentConfig = useCallback(async () => {
    setLoading(true)
    try {
      // Buscar configuração salva no banco
      const configResponse = await fetch('/api/admin/config-cotacao')
      let savedConfig = null
      
      if (configResponse.ok) {
        savedConfig = await configResponse.json()
      }

      // Buscar cotação atual
      const response = await fetch('/api/currency?from=USD&to=BRL&amount=1')
      if (response.ok) {
        const data = await response.json()
        const currentRate = data.convertedAmount
        
        // Se há configuração salva e está usando customizada, usar ela
        if (savedConfig?.usarCotacaoCustomizada && savedConfig.cotacaoDolar) {
          setExchangeRate(savedConfig.cotacaoDolar)
          setIsCustomRate(true)
          setConfig({
            currentRate: currentRate,
            customRate: savedConfig.cotacaoDolar,
            isUsingCustom: true,
            lastUpdated: savedConfig.ultimaAtualizacao || data.lastUpdated,
            source: 'custom-saved'
          })
        } else {
          setExchangeRate(currentRate)
          setIsCustomRate(false)
          setConfig({
            currentRate: currentRate,
            customRate: null,
            isUsingCustom: false,
            lastUpdated: data.lastUpdated,
            source: data.source || 'exchangerate-api.com'
          })
        }
      }
    } catch (err) {
      console.error('Erro ao buscar configuração:', err)
      error('Erro', 'Não foi possível carregar a cotação atual')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    fetchCurrentConfig()
  }, [fetchCurrentConfig])

  const handleExchangeRateChange = (rate: number, isCustom: boolean) => {
    setExchangeRate(rate)
    setIsCustomRate(isCustom)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Salvar configuração no banco de dados
      const response = await fetch('/api/admin/config-cotacao', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cotacaoDolar: exchangeRate,
          usarCotacaoCustomizada: isCustomRate,
          ultimaAtualizacao: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar configuração')
      }

      const result = await response.json()
      
      setConfig(prev => prev ? {
        ...prev,
        currentRate: exchangeRate,
        customRate: isCustomRate ? exchangeRate : null,
        isUsingCustom: isCustomRate,
        lastUpdated: result.config.ultimaAtualizacao,
        source: isCustomRate ? 'custom-saved' : 'exchangerate-api.com'
      } : null)

      success(
        'Cotação salva com sucesso!', 
        isCustomRate 
          ? `Cotação customizada de R$ ${exchangeRate.toFixed(4)} foi configurada e será usada em todos os orçamentos.` 
          : `Sistema configurado para usar a cotação atual do dia (R$ ${exchangeRate.toFixed(4)}).`
      )
    } catch (err) {
      console.error('Erro ao salvar:', err)
      error('Erro', err instanceof Error ? err.message : 'Não foi possível salvar a configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleForceUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/currency?from=USD&to=BRL&amount=1')
      if (response.ok) {
        const data = await response.json()
        setExchangeRate(data.convertedAmount)
        setIsCustomRate(false)
        success('Cotação atualizada!', `Nova cotação: R$ ${data.convertedAmount.toFixed(4)}`)
      }
    } catch (err) {
      error('Erro', 'Não foi possível atualizar a cotação')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando cotação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuração de Cotação do Dólar</h1>
            <p className="text-gray-600">Configure a cotação do dólar para uso no sistema</p>
          </div>
        </div>
        <ModernButton
          onClick={handleForceUpdate}
          variant="outline"
          size="default"
          icon={<RefreshCw className="h-4 w-4" />}
          disabled={loading}
        >
          Atualizar Agora
        </ModernButton>
      </div>

      {/* Informações Atuais */}
      {config && (
        <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500 text-white">
              <Info className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Informações da Cotação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Cotação Atual</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {exchangeRate.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Fonte</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {isCustomRate ? 'Personalizada' : config.source}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Última Atualização</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(config.lastUpdated).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Configurador Principal */}
      <ModernCard>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configurar Cotação
            </h2>
            <p className="text-gray-600">
              Escolha entre usar a cotação atual do dia ou definir um valor personalizado
            </p>
          </div>

          {/* Seletor de Cotação */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
            <ExchangeRateSelector
              value={exchangeRate}
              onChange={handleExchangeRateChange}
              size="lg"
              showLabel={true}
            />
          </div>

          {/* Aviso sobre modo customizado */}
          {isCustomRate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Modo Personalizado Ativo</p>
                <p className="text-sm text-amber-700 mt-1">
                  Você está usando uma cotação personalizada. Esta cotação será usada em todos os orçamentos até que você altere para a cotação atual do dia.
                </p>
              </div>
            </div>
          )}

          {/* Botão Salvar */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ModernButton
              onClick={handleSave}
              variant="primary"
              size="lg"
              icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </ModernButton>
          </div>
        </div>
      </ModernCard>

      {/* Instruções */}
      <ModernCard className="bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Como Funciona
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">📊 Cotação Atual do Dia</p>
              <p>
                A cotação é buscada automaticamente de uma API externa e atualizada a cada 5 minutos. 
                Use este modo para sempre trabalhar com a cotação mais recente do mercado.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">✏️ Cotação Personalizada</p>
              <p>
                Defina um valor fixo para a cotação. Útil quando você precisa usar uma cotação específica 
                em todos os orçamentos, independente da cotação do mercado.
              </p>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  )
}

