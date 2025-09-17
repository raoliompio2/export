'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Eye, 
  Check, 
  X, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Package,
  Search,
  Filter,
  TrendingUp,
  Download,
  Globe
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import { StatusBadge } from '@/components/ui/modern-table'
import CurrencyConverter from '@/components/ui/currency-converter'

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat(
    currency === 'BRL' ? 'pt-BR' : 'en-US',
    {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }
  ).format(value)
}
import ExportInvoiceView from '@/components/views/export-invoice-view'

interface Orcamento {
  id: string
  numero: string
  titulo: string
  descricao?: string
  status: string
  subtotal: number
  desconto: number
  total: number
  frete: number
  validadeAte?: string
  createdAt: string
  observacoes?: string
  condicoesPagamento?: string
  prazoEntrega?: string
  
  // Campos de exportação
  incoterm?: string
  portoDestino?: string
  tipoFrete?: string
  diasTransito?: number
  pesoBruto?: number
  volume?: number
  medidas?: string
  numeroCaixas?: number
  freteInternacional?: number
  seguroInternacional?: number
  taxasDesaduanagem?: number
  
  cliente: {
    user: {
      nome: string
      email: string
      telefone?: string
    }
    empresa?: string
    cnpj?: string
    cpf?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  vendedor: {
    user: {
      nome: string
      email: string
    }
  }
  empresa: {
    nome: string
    cnpj: string
    endereco: string
    numero?: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
    email: string
    telefone?: string
    logo?: string
  }
  itens: Array<{
    id: string
    produto: {
      nome: string
      descricao?: string
      codigo: string
      unidade: string
      imagens?: string[]
      origem?: string
    }
    quantidade: number
    precoUnit: number
    desconto: number
    total: number
    observacoes?: string
  }>
}

export default function ClienteOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('TODOS')
  // Cliente sempre vê em USD
  const { success, error } = useToast()
  const t = useTranslations('orcamentos')
  const tc = useTranslations('common')
  const tt = useTranslations('toast')

  useEffect(() => {
    fetchOrcamentos()
  }, [])

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch('/api/orcamentos')
      if (!response.ok) throw new Error('Erro ao carregar orçamentos')
      
      const data = await response.json()
      setOrcamentos(Array.isArray(data) ? data : [])
      success(tt('orcamentosCarregados'), `${data.length} orçamentos encontrados`)
    } catch (err: any) {
      error(tt('erro'), err.message)
      setOrcamentos([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orcamentoId: string, novoStatus: string) => {
    setUpdatingStatus(orcamentoId)
    try {
      const response = await fetch(`/api/orcamentos/${orcamentoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar orçamento')
      }

      // Atualizar lista local
      setOrcamentos(prev => prev.map(orc => 
        orc.id === orcamentoId 
          ? { ...orc, status: novoStatus }
          : orc
      ))

      success(
        `Orçamento ${novoStatus === 'APROVADO' ? 'aprovado' : 'rejeitado'}!`,
        `Sua decisão foi registrada com sucesso`
      )
    } catch (err: any) {
      error('Erro ao atualizar', err.message)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleViewOrcamento = (orcamento: Orcamento) => {
    setViewingOrcamento(orcamento)
  }

  const handleViewClose = () => {
    setViewingOrcamento(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'success'
      case 'ENVIADO': return 'warning'
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
      case 'REJEITADO': return <XCircle className="h-4 w-4" />
      case 'EXPIRADO': return <AlertTriangle className="h-4 w-4" />
      case 'RASCUNHO': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // Filtrar orçamentos
  const filteredOrcamentos = orcamentos.filter(orcamento => {
    const matchSearch = orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       orcamento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       orcamento.vendedor.user.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'TODOS' || orcamento.status === filterStatus
    return matchSearch && matchStatus
  })

  // Estatísticas
  const stats = {
    total: orcamentos.length,
    enviados: orcamentos.filter(o => o.status === 'ENVIADO').length,
    aprovados: orcamentos.filter(o => o.status === 'APROVADO').length,
    valorTotal: orcamentos.reduce((sum, o) => sum + o.total, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 text-lg">Carregando seus orçamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-emerald-600" />
            {t('meusOrcamentos')}
          </h1>
          <p className="text-gray-600 mt-2">
            Acompanhe suas propostas e tome decisões sobre os orçamentos
          </p>
        </div>
        
        <ModernButton
          variant="outline"
          icon={<Download className="h-4 w-4" />}
        >
          {t('acoes.exportar')} Relatório
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Orçamentos"
          value={stats.total}
          subtitle="Propostas recebidas"
          icon={<FileText className="h-5 w-5" />}
        />
        
        <StatsCard
          title="Aguardando Análise"
          value={stats.enviados}
          subtitle="Pendentes de decisão"
          icon={<Clock className="h-5 w-5" />}
        />
        
        <StatsCard
          title="Orçamentos Aprovados"
          value={stats.aprovados}
          subtitle="Confirmados"
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{ value: 85.2, label: 'taxa de aprovação' }}
        />
        
        <StatsCard
          title="Valor Total"
          value={formatCurrency(stats.valorTotal / 5.5, 'USD')}
          subtitle="Em propostas"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Filtros */}
      <ModernCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por número, título ou vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="TODOS">Todos os status</option>
              <option value="ENVIADO">Enviados</option>
              <option value="APROVADO">Aprovados</option>
              <option value="REJEITADO">Rejeitados</option>
              <option value="EXPIRADO">Expirados</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500 self-center">
            {filteredOrcamentos.length} de {orcamentos.length} orçamentos
          </div>
        </div>
      </ModernCard>

      {/* Lista de orçamentos */}
      {filteredOrcamentos.length > 0 ? (
        <div className="space-y-6">
          {filteredOrcamentos.map((orcamento) => (
            <ModernCard key={orcamento.id} variant="bordered" interactive className="p-6">
              
              {/* Header do Orçamento */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {orcamento.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Orçamento #{orcamento.numero}
                    </p>
                    {orcamento.descricao && (
                      <p className="text-gray-600 max-w-2xl">
                        {orcamento.descricao}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(orcamento.status)}
                  <StatusBadge
                    status={orcamento.status}
                    variant={getStatusColor(orcamento.status) as any}
                  />
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Valor Total</p>
                    <div className="text-xl font-bold text-emerald-900">
{formatCurrency(orcamento.total / 5.5, 'USD')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Data de Criação</p>
                    <p className="text-blue-900 font-semibold">
                      {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {orcamento.validadeAte && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                    <div className="p-2 rounded-lg bg-orange-500 text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-700 font-medium">Válido até</p>
                      <p className="text-orange-900 font-semibold">
                        {new Date(orcamento.validadeAte).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Vendedor: {orcamento.vendedor.user.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>{orcamento.itens.length} item(s)</span>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex items-center gap-3">
                  <ModernButton
                    variant="outline"
                    onClick={() => handleViewOrcamento(orcamento)}
                    icon={<Eye className="h-4 w-4" />}
                  >
                    {t('acoes.ver')} Detalhes
                  </ModernButton>
                  
                  {orcamento.status === 'ENVIADO' && (
                    <>
                      <ModernButton
                        variant="success"
                        onClick={() => handleStatusUpdate(orcamento.id, 'APROVADO')}
                        loading={updatingStatus === orcamento.id}
                        icon={<Check className="h-4 w-4" />}
                      >
                        {t('acoes.aprovar')}
                      </ModernButton>
                      
                      <ModernButton
                        variant="danger"
                        onClick={() => handleStatusUpdate(orcamento.id, 'REJEITADO')}
                        loading={updatingStatus === orcamento.id}
                        icon={<X className="h-4 w-4" />}
                      >
                        {t('acoes.rejeitar')}
                      </ModernButton>
                    </>
                  )}
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      ) : (
        <ModernCard className="text-center py-16">
          {searchTerm || filterStatus !== 'TODOS' ? (
            <>
              <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros para encontrar o que procura
              </p>
              <ModernButton
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('TODOS')
                }}
              >
                Limpar Filtros
              </ModernButton>
            </>
          ) : (
            <>
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não possui orçamentos. Entre em contato com nossa equipe de vendas para solicitar propostas.
              </p>
              <ModernButton
                variant="primary"
                onClick={() => {
                  window.location.href = "/cliente/produtos"
                }}
              >
                Explorar Produtos
              </ModernButton>
            </>
          )}
        </ModernCard>
      )}

      {/* Modal de Visualização Profissional */}
      {viewingOrcamento && (
        <ExportInvoiceView
          orcamento={viewingOrcamento as any}
          onClose={handleViewClose}
        />
      )}
    </div>
  )
}