'use client'

import { useState } from 'react'
import { 
  X, 
  FileText, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  Calculator,
  MapPin,
  Download,
  Printer,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard from '@/components/ui/modern-card'
import { StatusBadge } from '@/components/ui/modern-table'
import { debugCalculations, formatCurrencySafe, detectarDescontoReal } from '@/utils/safe-formatting'

interface OrcamentoViewProps {
  orcamento: {
    id: string
    numero: string
    titulo: string
    status: string
    subtotal: number
    desconto: number
    total: number
    frete?: number
    createdAt?: string
    validadeAte?: string
    descricao?: string
    condicoesPagamento?: string
    prazoEntrega?: string
    observacoes?: string
    freteInternacional?: number | string
    empresa?: {
      id: string
      nome: string
      nomeFantasia?: string
      cnpj: string
      endereco: string
      numero?: string
      bairro?: string
      cidade: string
      estado: string
      cep: string
      telefone?: string
      email: string
    }
    cliente?: {
      id: string
      empresa?: string
      cnpj?: string
      endereco?: string
      cidade?: string
      estado?: string
      cep?: string
      user: {
        id: string
        nome: string
        email: string
        telefone?: string
      }
    }
    vendedor?: {
      id: string
      user: {
        id: string
        nome: string
        email: string
        telefone?: string
      }
    }
    itens?: Array<{
      id: string
      quantidade: number
      precoUnit: number
      desconto: number
      total: number
      produto?: { nome?: string; codigo?: string }
    }>
  }
  onClose: () => void
}

export default function OrcamentoView({ orcamento, onClose }: OrcamentoViewProps) {
  const [loading, setLoading] = useState(false)
  
  // DEBUG: Para investigar problemas nos cálculos E DESCONTO
  if (process.env.NODE_ENV === 'development' && orcamento) {
    debugCalculations(orcamento, 'OrcamentoView')
    console.log('🔍 DEBUG DESCONTO - OrcamentoView:', {
      itensCount: orcamento.itens?.length,
      itens: orcamento.itens?.map((item: { id: string; quantidade: number; precoUnit: number; desconto: number; total: number; produto?: { nome?: string } }) => ({
        id: item.id,
        produto: item.produto?.nome,
        quantidade: item.quantidade,
        precoUnit: item.precoUnit,
        desconto: item.desconto, // ← ESTE é o valor crítico
        total: item.total
      }))
    })
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'APROVADO': return 'success'
      case 'ENVIADO': return 'warning'
      case 'PENDENTE': return 'warning'
      case 'REJEITADO': return 'danger'
      case 'EXPIRADO': return 'danger'
      case 'RASCUNHO': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADO': return <CheckCircle className="h-4 w-4" />
      case 'ENVIADO': return <Clock className="h-4 w-4" />
      case 'PENDENTE': return <Clock className="h-4 w-4" />
      case 'REJEITADO': return <XCircle className="h-4 w-4" />
      case 'EXPIRADO': return <AlertTriangle className="h-4 w-4" />
      case 'RASCUNHO': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (!orcamento) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <ModernCard className="p-8 text-center max-w-md">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Orçamento não encontrado</h3>
          <p className="text-gray-500 mb-4">Não foi possível carregar os dados do orçamento</p>
          <ModernButton onClick={onClose}>
            Fechar
          </ModernButton>
        </ModernCard>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{orcamento.numero}</h2>
              <p className="text-gray-600">{orcamento.titulo}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(orcamento.status)}
              <StatusBadge
                status={orcamento.status}
                variant={getStatusColor(orcamento.status)}
              />
            </div>
            
            <ModernButton
              variant="ghost"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-6 w-6" />
            </ModernButton>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          
          {/* Dados da Empresa, Cliente e Vendedor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Empresa */}
            <ModernCard variant="bordered" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Empresa</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Razão Social</p>
                  <p className="font-medium text-gray-900">{orcamento.empresa?.nome || 'N/A'}</p>
                </div>

                {orcamento.empresa?.nomeFantasia && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nome Fantasia</p>
                    <p className="font-medium text-gray-900">{orcamento.empresa.nomeFantasia}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">CNPJ</p>
                  <p className="text-sm text-gray-700">{orcamento.empresa?.cnpj || 'N/A'}</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span>{orcamento.empresa?.email || 'N/A'}</span>
                </div>
                
                {orcamento.empresa?.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="h-4 w-4 text-purple-500" />
                    <span>{orcamento.empresa.telefone}</span>
                  </div>
                )}
                
                {orcamento.empresa?.endereco && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Endereço</p>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <p>{orcamento.empresa.endereco}{orcamento.empresa.numero && `, ${orcamento.empresa.numero}`}</p>
                        {orcamento.empresa.bairro && <p>{orcamento.empresa.bairro}</p>}
                        <p>{orcamento.empresa.cidade}, {orcamento.empresa.estado} - {orcamento.empresa.cep}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Cliente */}
            <ModernCard variant="bordered" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <User className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Cliente</h4>
              </div>
              
              <div className="space-y-3">
                {orcamento.cliente && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nome</p>
                      <p className="font-medium text-gray-900">{orcamento.cliente.user.nome}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span>{orcamento.cliente.user.email}</span>
                    </div>
                    
                    {orcamento.cliente.user.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span>{orcamento.cliente.user.telefone}</span>
                      </div>
                    )}
                    
                    {orcamento.cliente.empresa && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Empresa</p>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <span>{orcamento.cliente.empresa}</span>
                        </div>
                      </div>
                    )}
                    
                    {orcamento.cliente.cnpj && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">CNPJ</p>
                        <p className="text-sm text-gray-700">{orcamento.cliente.cnpj}</p>
                      </div>
                    )}
                    
                    {orcamento.cliente.endereco && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Endereço</p>
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div>
                            <p>{orcamento.cliente.endereco}</p>
                            {orcamento.cliente.cidade && (
                              <p>{orcamento.cliente.cidade}{orcamento.cliente.estado && `, ${orcamento.cliente.estado}`}</p>
                            )}
                            {orcamento.cliente.cep && <p>CEP: {orcamento.cliente.cep}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ModernCard>

            {/* Vendedor */}
            <ModernCard variant="bordered" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <User className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Vendedor</h4>
              </div>
              
              <div className="space-y-3">
                {orcamento.vendedor && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nome</p>
                      <p className="font-medium text-gray-900">{orcamento.vendedor.user.nome}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-4 w-4 text-emerald-500" />
                      <span>{orcamento.vendedor.user.email}</span>
                    </div>
                    
                    {orcamento.vendedor.user.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-emerald-500" />
                        <span>{orcamento.vendedor.user.telefone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ModernCard>
          </div>

          {/* Informações do Orçamento */}
          <ModernCard variant="bordered" className="p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Informações do Orçamento</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Data de Criação</p>
                <p className="font-medium text-gray-900">
                  {orcamento.createdAt ? new Date(orcamento.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              
              {orcamento.validadeAte && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Válido até</p>
                  <p className="font-medium text-gray-900">
                    {new Date(orcamento.validadeAte).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(orcamento.status)}
                  <StatusBadge
                    status={orcamento.status}
                    variant={getStatusColor(orcamento.status)}
                  />
                </div>
              </div>
            </div>
            
            {orcamento.descricao && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Descrição</p>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-900">{orcamento.descricao}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orcamento.condicoesPagamento && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Condições de Pagamento</p>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-900">{orcamento.condicoesPagamento}</p>
                  </div>
                </div>
              )}
              
              {orcamento.prazoEntrega && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Prazo de Entrega</p>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-900">{orcamento.prazoEntrega}</p>
                  </div>
                </div>
              )}
            </div>

            {orcamento.observacoes && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Observações</p>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-900">{orcamento.observacoes}</p>
                </div>
              </div>
            )}
          </ModernCard>

          {/* Itens do Orçamento */}
          <ModernCard variant="bordered" className="p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <Package className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Itens do Orçamento</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qtd</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Preço Unit.</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Desc.</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orcamento.itens?.map((item: { id: string; quantidade: number; precoUnit: number; desconto: number; total: number; produto?: { nome?: string; codigo?: string } }) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.produto?.nome || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Código: {item.produto?.codigo || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                          {item.quantidade}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        {formatCurrencySafe(item.precoUnit, 'BRL')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                          {detectarDescontoReal(item).toFixed(1)}%
                        </span>
                        {/* DEBUG: Mostrar valores de desconto */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-red-600 mt-1">
                            Informado: {JSON.stringify(item.desconto)} | Detectado: {detectarDescontoReal(item).toFixed(1)}%
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {formatCurrencySafe(item.total, 'BRL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>

          {/* Resumo Financeiro */}
          <ModernCard variant="gradient" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-white bg-opacity-20">
                <Calculator className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold">Resumo Financeiro</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white opacity-90">Subtotal:</span>
                <span className="font-semibold">{formatCurrencySafe(orcamento.subtotal, 'BRL')}</span>
              </div>
              
              {parseFloat(String(orcamento.desconto || 0)) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white opacity-90">Desconto:</span>
                  <span className="font-semibold text-red-200">
                    - {formatCurrencySafe(orcamento.desconto, 'BRL')}
                  </span>
                </div>
              )}
              
              {parseFloat(String(orcamento.frete || 0)) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white opacity-90">Frete Nacional:</span>
                  <span className="font-semibold">+ {formatCurrencySafe(orcamento.frete, 'BRL')}</span>
                </div>
              )}
              
              {/* Mostrar frete internacional se existir */}
              {parseFloat(String(orcamento.freteInternacional || 0)) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white opacity-90">Frete Internacional:</span>
                  <span className="font-semibold">+ ${parseFloat(String(orcamento.freteInternacional)).toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-white border-opacity-20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">TOTAL:</span>
                  <span className="text-2xl font-bold">
                    {formatCurrencySafe(orcamento.total, 'BRL')}
                  </span>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Footer com Ações */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <ModernButton
            variant="ghost"
            onClick={onClose}
          >
            Fechar
          </ModernButton>
          
          <div className="flex gap-3">
            <ModernButton
              variant="secondary"
              icon={<Download className="h-4 w-4" />}
              loading={loading}
            >
              Baixar PDF
            </ModernButton>
            
            <ModernButton
              variant="outline"
              icon={<Printer className="h-4 w-4" />}
            >
              Imprimir
            </ModernButton>
            
            <ModernButton
              icon={<Send className="h-4 w-4" />}
            >
              Enviar por Email
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  )
}
