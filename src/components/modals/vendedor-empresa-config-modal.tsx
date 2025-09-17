'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Percent, Target, Save, Building2 } from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  logo?: string
  vendedorEmpresa?: {
    id: string
    ativo: boolean
    comissao?: number
    meta?: number
  }
}

interface VendedorEmpresaConfigModalProps {
  empresa: Empresa
  onClose: () => void
  onSuccess: () => void
}

export default function VendedorEmpresaConfigModal({
  empresa,
  onClose,
  onSuccess
}: VendedorEmpresaConfigModalProps) {
  const [comissao, setComissao] = useState<string>('')
  const [meta, setMeta] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/vendedor/config-empresa?empresaId=${empresa.id}`)
      if (!response.ok) throw new Error('Erro ao carregar configurações')
      
      const data = await response.json()
      setComissao(data.comissao?.toString() || '')
      setMeta(data.meta?.toString() || '')
    } catch (err: any) {
      // Se não existir configuração, usar valores padrão
      setComissao(empresa.vendedorEmpresa?.comissao?.toString() || '')
      setMeta(empresa.vendedorEmpresa?.meta?.toString() || '')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/vendedor/config-empresa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresaId: empresa.id,
          comissao: comissao ? parseFloat(comissao) : null,
          meta: meta ? parseFloat(meta) : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar configurações')
      }

      success('Configurações salvas!', `Suas configurações para ${empresa.nome} foram atualizadas`)
      onSuccess()
    } catch (err: any) {
      error('Erro ao salvar', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = new Intl.NumberFormat('pt-BR').format(Number(numericValue))
    return formattedValue
  }

  const handleMetaChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    setMeta(numericValue)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
              <p className="text-gray-600">Ajuste suas configurações para {empresa.nome}</p>
            </div>
          </div>
          
          <ModernButton
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-6 w-6" />
          </ModernButton>
        </div>

        <div className="p-6">
          
          {/* Empresa Info */}
          <ModernCard className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {empresa.logo ? (
                  <img src={empresa.logo} alt={empresa.nome} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{empresa.nome}</h3>
                {empresa.nomeFantasia && (
                  <p className="text-gray-600">{empresa.nomeFantasia}</p>
                )}
                <p className="text-sm text-gray-500">CNPJ: {empresa.cnpj}</p>
              </div>
            </div>
          </ModernCard>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando configurações...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Comissão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-500" />
                    <span>Percentual de Comissão</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={comissao}
                    onChange={(e) => setComissao(e.target.value)}
                    placeholder="Ex: 5.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Percentual que você receberá sobre as vendas desta empresa
                </p>
              </div>

              {/* Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Meta Mensal de Vendas</span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={meta ? formatCurrency(meta) : ''}
                    onChange={(e) => handleMetaChange(e.target.value)}
                    placeholder="Ex: 50.000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Valor que você pretende vender mensalmente desta empresa
                </p>
              </div>

              {/* Preview */}
              {(comissao || meta) && (
                <ModernCard variant="bordered" className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Resumo das Configurações:</h4>
                  <div className="space-y-2 text-sm">
                    {comissao && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comissão:</span>
                        <span className="font-medium">{comissao}%</span>
                      </div>
                    )}
                    {meta && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Meta Mensal:</span>
                        <span className="font-medium">R$ {formatCurrency(meta)}</span>
                      </div>
                    )}
                    {comissao && meta && (
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Comissão na Meta:</span>
                        <span className="font-semibold text-green-600">
                          R$ {formatCurrency((Number(meta) * Number(comissao) / 100).toString())}
                        </span>
                      </div>
                    )}
                  </div>
                </ModernCard>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <ModernButton
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </ModernButton>
          
          <ModernButton
            onClick={handleSubmit}
            disabled={submitting || loading}
            loading={submitting}
            icon={<Save className="h-4 w-4" />}
          >
            Salvar Configurações
          </ModernButton>
        </div>
      </div>
    </div>
  )
}
