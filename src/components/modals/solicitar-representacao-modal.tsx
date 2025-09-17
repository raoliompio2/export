'use client'

import { useState, useEffect } from 'react'
import { X, Building2, Search, Send, Check, AlertCircle } from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  cidade: string
  estado: string
  logo?: string
  _count?: {
    produtos: number
    vendedores: number
  }
}

interface SolicitarRepresentacaoModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function SolicitarRepresentacaoModal({
  onClose,
  onSuccess
}: SolicitarRepresentacaoModalProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const { success, error } = useToast()

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas')
      if (!response.ok) throw new Error('Erro ao carregar empresas')
      
      const data = await response.json()
      // Filtrar apenas empresas que o vendedor não representa ainda
      const empresasDisponiveis = data.filter((empresa: any) => !empresa.vendedorEmpresa?.ativo)
      setEmpresas(empresasDisponiveis)
    } catch (err: any) {
      error('Erro ao carregar empresas', err.message)
      setEmpresas([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedEmpresa) {
      error('Erro', 'Selecione uma empresa')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/vendedor/solicitacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresaId: selectedEmpresa.id,
          observacoes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar solicitação')
      }

      success('Solicitação enviada!', `Sua solicitação para ${selectedEmpresa.nome} foi enviada`)
      onSuccess()
    } catch (err: any) {
      error('Erro ao solicitar', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Solicitar Representação</h2>
              <p className="text-gray-600">Escolha uma empresa para representar</p>
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nome, nome fantasia ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Lista de Empresas */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando empresas...</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {filteredEmpresas.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma empresa encontrada
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Tente ajustar sua busca' : 'Todas as empresas já estão sendo representadas por você'}
                  </p>
                </div>
              ) : (
                filteredEmpresas.map((empresa) => (
                  <ModernCard
                    key={empresa.id}
                    variant={selectedEmpresa?.id === empresa.id ? 'gradient' : 'bordered'}
                    interactive
                    className={`p-4 cursor-pointer transition-all ${
                      selectedEmpresa?.id === empresa.id
                        ? 'ring-2 ring-emerald-500 ring-offset-2'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedEmpresa(empresa)}
                  >
                    <div className="flex items-center gap-4">
                      
                      {/* Logo/Avatar */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {empresa.logo ? (
                          <img src={empresa.logo} alt={empresa.nome} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Informações */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{empresa.nome}</h3>
                            {empresa.nomeFantasia && (
                              <p className="text-gray-600">{empresa.nomeFantasia}</p>
                            )}
                            <p className="text-sm text-gray-500">CNPJ: {empresa.cnpj}</p>
                            <p className="text-sm text-gray-500">{empresa.cidade}/{empresa.estado}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {empresa._count?.produtos || 0} produtos
                            </div>
                            <div className="text-sm text-gray-500">
                              {empresa._count?.vendedores || 0} vendedores
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Check Icon */}
                      {selectedEmpresa?.id === empresa.id && (
                        <div className="p-2 rounded-full bg-emerald-500 text-white">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </ModernCard>
                ))
              )}
            </div>
          )}

          {/* Observações */}
          {selectedEmpresa && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione informações sobre sua experiência, região de atuação, etc..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>A empresa receberá sua solicitação para análise</span>
          </div>

          <div className="flex items-center gap-3">
            <ModernButton
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </ModernButton>
            
            <ModernButton
              onClick={handleSubmit}
              disabled={!selectedEmpresa || submitting}
              loading={submitting}
              icon={<Send className="h-4 w-4" />}
            >
              Enviar Solicitação
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  )
}
