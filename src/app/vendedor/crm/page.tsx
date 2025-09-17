'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  Star,
  MessageCircle
} from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import CrmForm from '@/components/forms/crm-form'

interface CrmItem {
  id: string
  titulo: string
  descricao?: string
  tipo: string
  prioridade: string
  status: string
  dataVencimento?: string
  createdAt: string
  cliente: {
    user: {
      nome: string
      email: string
    }
    empresa?: string
  }
}

export default function VendedorCrm() {
  const [crmItems, setCrmItems] = useState<CrmItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<CrmItem | null>(null)
  const [filterStatus, setFilterStatus] = useState('TODOS')
  const [filterPrioridade, setFilterPrioridade] = useState('TODAS')
  const { success, error } = useToast()

  useEffect(() => {
    fetchCrmItems()
  }, [])

  const fetchCrmItems = async () => {
    try {
      const response = await fetch('/api/crm')
      if (!response.ok) throw new Error('Erro ao carregar CRM')
      
      const data = await response.json()
      setCrmItems(Array.isArray(data) ? data : [])
      success('CRM carregado', `${data.length} itens encontrados`)
    } catch (err: any) {
      error('Erro ao carregar', err.message)
      setCrmItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: CrmItem) => {
    if (!confirm(`Excluir ${item.titulo}?`)) return

    try {
      const response = await fetch(`/api/crm/${item.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir')
      
      setCrmItems(prev => prev.filter(i => i.id !== item.id))
      success('Item excluído', `${item.titulo} foi removido`)
    } catch (err: any) {
      error('Erro ao excluir', err.message)
    }
  }

  const handleEdit = (item: CrmItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE': return 'danger'
      case 'ALTA': return 'warning'
      case 'MEDIA': return 'default'
      case 'BAIXA': return 'success'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVIDO': return 'success'
      case 'FECHADO': return 'success'
      case 'EM_ANDAMENTO': return 'warning'
      case 'AGUARDANDO_CLIENTE': return 'warning'
      case 'ABERTO': return 'default'
      default: return 'default'
    }
  }

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'ALTA': return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'MEDIA': return <Clock className="h-4 w-4 text-blue-500" />
      case 'BAIXA': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Filtrar itens
  const filteredItems = crmItems.filter(item => {
    const statusMatch = filterStatus === 'TODOS' || item.status === filterStatus
    const prioridadeMatch = filterPrioridade === 'TODAS' || item.prioridade === filterPrioridade
    return statusMatch && prioridadeMatch
  })

  // Estatísticas
  const stats = {
    total: crmItems.length,
    abertos: crmItems.filter(i => i.status === 'ABERTO').length,
    urgentes: crmItems.filter(i => i.prioridade === 'URGENTE').length,
    vencidos: crmItems.filter(i => {
      if (!i.dataVencimento) return false
      return new Date(i.dataVencimento) < new Date()
    }).length
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'item',
      label: 'Item',
      render: (item: CrmItem) => (
        <div className="flex items-start gap-3">
          {getPrioridadeIcon(item.prioridade)}
          <div>
            <div className="font-medium text-gray-900">{item.titulo}</div>
            <div className="text-sm text-gray-500 line-clamp-2">{item.descricao}</div>
          </div>
        </div>
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (item: CrmItem) => (
        <AvatarCell
          name={item.cliente.user.nome}
          subtitle={item.cliente.empresa || 'Pessoa Física'}
        />
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (item: CrmItem) => (
        <div className="flex items-center gap-2">
          {item.tipo === 'LIGACAO' && <Phone className="h-4 w-4 text-blue-500" />}
          {item.tipo === 'EMAIL' && <Mail className="h-4 w-4 text-green-500" />}
          {item.tipo === 'REUNIAO' && <Users className="h-4 w-4 text-purple-500" />}
          {item.tipo === 'FOLLOW_UP' && <MessageCircle className="h-4 w-4 text-orange-500" />}
          <span className="text-sm">{item.tipo}</span>
        </div>
      )
    },
    {
      key: 'prioridade',
      label: 'Prioridade',
      render: (item: CrmItem) => (
        <StatusBadge
          status={item.prioridade}
          variant={getPrioridadeColor(item.prioridade) as any}
        />
      )
    },
    {
      key: 'vencimento',
      label: 'Vencimento',
      render: (item: CrmItem) => (
        item.dataVencimento ? (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
            </div>
            {new Date(item.dataVencimento) < new Date() && (
              <div className="text-red-600 text-xs font-medium">Vencido</div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Sem prazo</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: CrmItem) => (
        <StatusBadge
          status={item.status.replace('_', ' ')}
          variant={getStatusColor(item.status) as any}
        />
      )
    }
  ]

  // Ações da tabela
  const actions = [
    {
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'primary' as const,
      onClick: handleEdit
    },
    {
      label: 'Excluir',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger' as const,
      onClick: handleDelete
    }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="h-8 w-8 text-emerald-600" />
            CRM - Relacionamento
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus contatos e atividades com clientes
          </p>
        </div>
        
        <ModernButton
          onClick={() => setShowForm(true)}
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          Nova Atividade
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Atividades"
          value={stats.total}
          subtitle="No pipeline"
          icon={<Heart className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Atividades Abertas"
          value={stats.abertos}
          subtitle="Pendentes"
          icon={<Clock className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Urgentes"
          value={stats.urgentes}
          subtitle="Requer atenção"
          icon={<AlertTriangle className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Vencidas"
          value={stats.vencidos}
          subtitle="Atrasadas"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: -12.5, label: 'vs semana anterior' }}
          loading={loading}
        />
      </div>

      {/* Filtros */}
      <ModernCard className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos</option>
              <option value="ABERTO">Aberto</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              <option value="RESOLVIDO">Resolvido</option>
              <option value="FECHADO">Fechado</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Prioridade:</label>
            <select
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="TODAS">Todas</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>

          <div className="ml-auto">
            <span className="text-sm text-gray-500">
              {filteredItems.length} de {crmItems.length} atividades
            </span>
          </div>
        </div>
      </ModernCard>

      {/* Tabela Moderna */}
      <ModernTable
        data={filteredItems}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        emptyState={
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece organizando seus contatos e follow-ups
            </p>
            <ModernButton 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Criar Primeira Atividade
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(filteredItems.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Agenda do Dia</h3>
              <p className="text-sm text-gray-600">Atividades programadas</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatório de Atividades</h3>
              <p className="text-sm text-gray-600">Performance do CRM</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Clientes Especiais</h3>
              <p className="text-sm text-gray-600">Relacionamento VIP</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Formulário de CRM */}
      {showForm && (
        <CrmForm
          crmItem={editingItem}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchCrmItems()
            handleFormClose()
          }}
        />
      )}
    </div>
  )
}