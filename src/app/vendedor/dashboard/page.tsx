'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Package, 
  FileText, 
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Award,
  Phone,
  Mail,
  MapPin,
  Plus,
  Eye,
  MessageCircle
} from 'lucide-react'
import ModernCard, { StatsCard, ActionCard } from '@/components/ui/modern-card'
import ModernButton from '@/components/ui/modern-button'

export default function ModernVendedorDashboard() {
  const [data, setData] = useState({
    totalClientes: 0,
    totalProdutos: 0,
    totalOrcamentos: 0,
    totalVendas: 0,
    orcamentosRecentes: [],
    clientesRecentes: [],
    vendedorData: { 
      user: { nome: 'Vendedor' },
      vendedorProfile: { meta: 0 } 
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Carregando dados do dashboard...')
      const response = await fetch('/api/vendedor/dashboard')
      if (!response.ok) throw new Error('Erro ao carregar dados')
      
      const dashboardData = await response.json()
      console.log('📊 Dados do dashboard carregados:', dashboardData)
      setData(dashboardData)
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular progresso da meta
  const meta = data.vendedorData?.vendedorProfile?.meta || 0
  const vendas = data.totalVendas || 0
  const progressoMeta = meta > 0 ? (vendas / meta * 100) : 0

  console.log('📈 Progresso da meta:', {
    meta,
    vendas,
    progressoMeta: progressoMeta.toFixed(1) + '%'
  })

  const dashboardStats = [
    {
      title: 'Clientes Ativos',
      value: data.totalClientes,
      change: 15.3,
      changeLabel: 'este mês',
      icon: <Users className="h-5 w-5" />,
      color: 'blue' as const
    },
    {
      title: 'Produtos Disponíveis',
      value: data.totalProdutos,
      change: 8.7,
      changeLabel: 'catálogo',
      icon: <Package className="h-5 w-5" />,
      color: 'green' as const
    },
    {
      title: 'Orçamentos',
      value: data.totalOrcamentos,
      change: 22.1,
      changeLabel: 'propostas',
      icon: <FileText className="h-5 w-5" />,
      color: 'purple' as const
    },
    {
      title: 'Meta do Mês',
      value: `${progressoMeta.toFixed(1)}%`,
      change: progressoMeta,
      changeLabel: 'atingido',
      icon: <Target className="h-5 w-5" />,
      color: 'orange' as const
    }
  ]

  const handleNavigateToOrcamentos = useCallback(() => {
    window.location.href = '/vendedor/orcamentos'
  }, [])

  const handleNavigateToClientes = useCallback(() => {
    window.location.href = '/vendedor/clientes'
  }, [])

  const quickActions = [
    {
      title: 'Novo Orçamento',
      description: 'Criar proposta para cliente',
      icon: <Plus className="h-5 w-5" />,
      action: handleNavigateToOrcamentos,
      color: 'blue' as const
    },
    {
      title: 'Cadastrar Cliente',
      description: 'Adicionar novo cliente à base',
      icon: <Users className="h-5 w-5" />,
      action: handleNavigateToClientes,
      color: 'green' as const
    },
    {
      title: 'Relatório de Vendas',
      description: 'Visualizar performance',
      icon: <TrendingUp className="h-5 w-5" />,
      action: handleNavigateToOrcamentos,
      color: 'purple' as const
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Vendas</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Bem-vindo de volta, {data.vendedorData?.user?.nome || 'Vendedor'}! Vamos aumentar suas vendas hoje.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ModernButton 
            variant="secondary" 
            size="sm" 
            icon={<Calendar className="h-4 w-4" />}
            onClick={() => window.location.href = '/vendedor/crm'}
          >
            Agenda
          </ModernButton>
          <ModernButton 
            size="sm" 
            icon={<Plus className="h-4 w-4" />}
            onClick={() => window.location.href = '/vendedor/orcamentos'}
          >
            Novo Orçamento
          </ModernButton>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const isPositive = stat.change > 0
          
          return (
            <div
              key={index}
              className="transform transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ModernCard variant="elevated" className="group hover:scale-105">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br text-white shadow-sm ${
                        stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        stat.color === 'green' ? 'from-green-500 to-green-600' :
                        stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        stat.color === 'orange' ? 'from-orange-500 to-orange-600' : 'from-gray-500 to-gray-600'
                      }`}>
                        {stat.icon}
                      </div>
                      <h3 className="font-medium text-gray-600 text-sm">{stat.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform">
                        {stat.value}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          <span>{isPositive ? '↗' : '↘'} {Math.abs(stat.change)}%</span>
                        </div>
                        <span className="text-xs text-gray-500">{stat.changeLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>
          )
        })}
      </div>

      {/* Ações Rápidas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              action={action.action}
              color={action.color}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Orçamentos Recentes */}
        <ModernCard variant="glass" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Orçamentos Recentes</h3>
            </div>
            <ModernButton 
              variant="ghost" 
              size="sm" 
              icon={<Eye className="h-4 w-4" />}
              onClick={() => window.location.href = '/vendedor/orcamentos'}
            >
              Ver todos
            </ModernButton>
          </div>
          
          <div className="space-y-4">
            {data.orcamentosRecentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>Nenhum orçamento ainda</p>
                <ModernButton 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.location.href = '/vendedor/orcamentos'}
                >
                  Criar primeiro orçamento
                </ModernButton>
              </div>
            ) : (
              data.orcamentosRecentes.map((orcamento) => (
                <div key={orcamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {orcamento.cliente?.nome?.slice(0, 2).toUpperCase() || 'OR'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{orcamento.cliente?.nome || 'Cliente'}</div>
                      <div className="text-sm text-gray-500">{orcamento.empresa?.nome || 'Empresa'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      R$ {orcamento.total?.toLocaleString('pt-BR') || '0'}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      orcamento.status === 'APROVADO' ? 'bg-green-100 text-green-700' :
                      orcamento.status === 'REJEITADO' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {orcamento.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModernCard>

        {/* Clientes Recentes */}
        <ModernCard variant="elevated">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clientes Recentes</h3>
            </div>
            <ModernButton 
              variant="ghost" 
              size="sm" 
              icon={<Plus className="h-4 w-4" />}
              onClick={() => window.location.href = '/vendedor/clientes'}
            >
              Novo cliente
            </ModernButton>
          </div>
          
          <div className="space-y-4">
            {data.clientesRecentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>Nenhum cliente cadastrado</p>
                <ModernButton 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.location.href = '/vendedor/clientes'}
                >
                  Cadastrar primeiro cliente
                </ModernButton>
              </div>
            ) : (
              data.clientesRecentes.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                      {cliente.user?.nome?.slice(0, 2).toUpperCase() || 'CL'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{cliente.user?.nome || 'Cliente'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        {cliente.user?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cliente.user.email}
                          </span>
                        )}
                        {cliente.user?.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.user.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ModernButton 
                    variant="ghost" 
                    size="sm" 
                    icon={<MessageCircle className="h-4 w-4" />}
                    onClick={() => window.location.href = '/vendedor/crm'}
                  >
                    Contatar
                  </ModernButton>
                </div>
              ))
            )}
          </div>
        </ModernCard>
      </div>

      {/* Performance Card */}
      <ModernCard variant="gradient" className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Performance do Mês
            </h3>
            <p className="text-gray-600 mb-6">
              {progressoMeta >= 100 
                ? 'Parabéns! Você atingiu sua meta! 🎉'
                : progressoMeta >= 75
                ? 'Você está quase lá! Continue assim para atingir sua meta.'
                : 'Vamos acelerar as vendas para atingir sua meta.'
              }
            </p>
            
            {/* Progresso da Meta */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Progresso da Meta</span>
                <span className="text-sm font-semibold text-gray-900">{progressoMeta.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>R$ {vendas.toLocaleString('pt-BR')}</span>
                <span>R$ {meta.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{progressoMeta.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Meta Atingida</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{data.totalOrcamentos}</div>
                <div className="text-sm text-gray-500">Orçamentos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{data.totalClientes}</div>
                <div className="text-sm text-gray-500">Clientes</div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block ml-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              progressoMeta >= 100 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-br from-emerald-400 to-teal-500'
            }`}>
              <Award className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  )
}