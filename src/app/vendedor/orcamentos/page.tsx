'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Globe
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import OrcamentoForm from '@/components/forms/orcamento-form'
import CurrencyConverter from '@/components/ui/currency-converter'
import ExportInvoiceView from '@/components/views/export-invoice-view'

interface Orcamento {
  id: string
  numero: string
  titulo: string
  status: string
  total: number
  validadeAte?: string
  createdAt: string
  cliente: {
    user: {
      nome: string
      email: string
    }
    empresa?: string
  }
  empresa: {
    nome: string
  }
  _count?: {
    items: number
  }
}

export default function VendedorOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | undefined>(undefined)
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | null>(null)
  // Vendedor sempre vê em BRL, orçamento é gerado em USD
  const { success, error } = useToast()
  const t = useTranslations('orcamentos')
  const tc = useTranslations('common')

  useEffect(() => {
    fetchOrcamentos()
  }, [])

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch('/api/orcamentos')
      if (!response.ok) throw new Error('Erro ao carregar orçamentos')
      
      const data = await response.json()
      setOrcamentos(Array.isArray(data) ? data : [])
      success('Orçamentos carregados', `${data.length} orçamentos encontrados`)
    } catch (err: unknown) {
      error('Erro ao carregar', err instanceof Error ? err.message : "Erro desconhecido")
      setOrcamentos([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (orcamento: Orcamento) => {
    if (!confirm(`Excluir orçamento ${orcamento.numero}?`)) return

    try {
      const response = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir')
      
      setOrcamentos(prev => prev.filter(o => o.id !== orcamento.id))
      success('Orçamento excluído', `${orcamento.numero} foi removido`)
    } catch (err: unknown) {
      error('Erro ao excluir', err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  const handleEdit = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento)
    setShowForm(true)
  }

  const handleView = (orcamento: Orcamento) => {
    setViewingOrcamento(orcamento)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingOrcamento(undefined)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'success'
      case 'REJEITADO': return 'danger'
      case 'ENVIADO': return 'warning'
      case 'EXPIRADO': return 'danger'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADO': return <CheckCircle className="h-4 w-4" />
      case 'REJEITADO': return <XCircle className="h-4 w-4" />
      case 'ENVIADO': return <Clock className="h-4 w-4" />
      case 'EXPIRADO': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // Estatísticas
  const stats = {
    total: orcamentos.length,
    aprovados: orcamentos.filter(o => o.status === 'APROVADO').length,
    pendentes: orcamentos.filter(o => o.status === 'ENVIADO').length,
    valorTotal: orcamentos.reduce((sum, o) => sum + o.total, 0)
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'orcamento',
      label: 'Orçamento',
      render: (orcamento: Orcamento) => (
        <AvatarCell
          name={orcamento.numero}
          subtitle={orcamento.titulo}
        />
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (orcamento: Orcamento) => (
        <div>
          <div className="font-medium text-gray-900">{orcamento.cliente.user.nome}</div>
          <div className="text-sm text-gray-500">{orcamento.cliente.empresa || 'Pessoa Física'}</div>
        </div>
      )
    },
    {
      key: 'empresa.nome',
      label: 'Empresa',
      sortable: true
    },
    {
      key: 'valor',
      label: 'Valor',
      sortable: true,
      render: (orcamento: Orcamento) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            R$ {orcamento.total.toLocaleString('pt-BR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <div className="text-sm text-gray-500">
            {orcamento._count?.items || 0} itens
          </div>
        </div>
      )
    },
    {
      key: 'validade',
      label: 'Validade',
      render: (orcamento: Orcamento) => (
        orcamento.validadeAte ? (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              {new Date(orcamento.validadeAte).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Sem validade</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (orcamento: Orcamento) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(orcamento.status)}
          <StatusBadge
            status={orcamento.status}
            variant={getStatusColor(orcamento.status) as any}
          />
        </div>
      )
    }
  ]

  // Ações da tabela
  const actions = [
    {
      label: t('acoes.ver'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView
    },
    {
      label: t('acoes.editar'),
      icon: <Edit className="h-4 w-4" />,
      variant: 'primary' as const,
      onClick: handleEdit,
      show: (orcamento: Orcamento) => orcamento.status !== 'APROVADO'
    },
    {
      label: tc('excluir'),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger' as const,
      onClick: handleDelete,
      show: (orcamento: Orcamento) => orcamento.status !== 'APROVADO'
    }
  ]

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
            Gerencie suas propostas comerciais e vendas
          </p>
        </div>
        
        <ModernButton
          onClick={() => setShowForm(true)}
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          {t('novoOrcamento')}
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Orçamentos"
          value={stats.total}
          subtitle="Propostas criadas"
          icon={<FileText className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Orçamentos Aprovados"
          value={stats.aprovados}
          subtitle="Vendas confirmadas"
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{ value: 25.3, label: 'conversão' }}
          loading={loading}
        />
        
        <StatsCard
          title="Aguardando Resposta"
          value={stats.pendentes}
          subtitle="Em análise"
          icon={<Clock className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Valor Total"
          value={`R$ ${Math.round(stats.valorTotal / 1000)}k`}
          subtitle="Em propostas"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 18.7, label: 'vs mês anterior' }}
          loading={loading}
        />
      </div>

      {/* Tabela Moderna */}
      <ModernTable
        data={orcamentos}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        filterable
        emptyState={
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum orçamento criado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando sua primeira proposta comercial
            </p>
            <ModernButton 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Criar Primeiro Orçamento
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(orcamentos.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatório de Vendas</h3>
              <p className="text-sm text-gray-600">Performance mensal</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Follow-up Pendente</h3>
              <p className="text-sm text-gray-600">Propostas em aberto</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Metas e Comissões</h3>
              <p className="text-sm text-gray-600">Acompanhe ganhos</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Formulário de Orçamento */}
      {showForm && (
        <OrcamentoForm
          orcamento={editingOrcamento}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchOrcamentos()
            handleFormClose()
          }}
        />
      )}

      {/* Modal de Visualização Profissional */}
      {viewingOrcamento && (
        <ExportInvoiceView
          orcamento={viewingOrcamento as any}
          onClose={() => setViewingOrcamento(null)}
        />
      )}
    </div>
  )
}
