'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Building2,
  UserPlus,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Eye,
  Database
} from 'lucide-react'
import ModernCard, { ActionCard } from '@/components/ui/modern-card'
import ModernButton from '@/components/ui/modern-button'

interface AdminStats {
  totalUsuarios: number
  totalVendedores: number
  totalClientes: number
  totalProdutos: number
  totalOrcamentos: number
  orcamentosAprovados: number
  usuariosAtivos: number
  taxaConversao: number
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsuarios: 0,
    totalVendedores: 0,
    totalClientes: 0,
    totalProdutos: 0,
    totalOrcamentos: 0,
    orcamentosAprovados: 0,
    usuariosAtivos: 0,
    taxaConversao: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        setError(error instanceof Error ? error.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const dashboardStats = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsuarios,
      change: 12.5,
      changeLabel: 'vs mês anterior',
      icon: <Users className="h-5 w-5" />,
      color: 'blue' as const
    },
    {
      title: 'Vendedores Ativos',
      value: stats.totalVendedores,
      change: 8.2,
      changeLabel: 'este mês',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'green' as const
    },
    {
      title: 'Base de Clientes',
      value: stats.totalClientes,
      change: 15.3,
      changeLabel: 'crescimento',
      icon: <Building2 className="h-5 w-5" />,
      color: 'purple' as const
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats.taxaConversao.toFixed(1)}%`,
      change: stats.taxaConversao > 50 ? 5.8 : -2.1,
      changeLabel: 'performance',
      icon: <TrendingUp className="h-5 w-5" />,
      color: stats.taxaConversao > 50 ? 'green' as const : 'red' as const
    }
  ]

  const handleNavigateToUsers = () => {
    // Navigation will be implemented later
    console.log('Navigate to users')
  }

  const handleNavigateToProducts = () => {
    // Navigation will be implemented later  
    console.log('Navigate to products')
  }

  const handleNavigateToSettings = () => {
    // Navigation will be implemented later
    console.log('Navigate to settings')
  }

  const quickActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Criar, editar e gerenciar contas de usuário',
      icon: <Users className="h-5 w-5" />,
      action: handleNavigateToUsers,
      color: 'blue' as const
    },
    {
      title: 'Catálogo de Produtos',
      description: 'Visualizar e gerenciar produtos do sistema',
      icon: <Package className="h-5 w-5" />,
      action: handleNavigateToProducts,
      color: 'green' as const
    },
    {
      title: 'Configurações',
      description: 'Configurar parâmetros do sistema',
      icon: <Settings className="h-5 w-5" />,
      action: handleNavigateToSettings,
      color: 'purple' as const
    }
  ]

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-96"></div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-9 bg-gray-200 rounded w-32"></div>
            <div className="h-9 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Stats Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
          ))}
        </div>

        {/* Additional Content Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            </div>
            <p className="text-red-600 text-lg">
              Erro ao carregar dados: {error}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ModernButton 
              variant="secondary" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </ModernButton>
          </div>
        </div>

        <ModernCard variant="bordered" className="p-6">
          <div className="text-center">
            <Database className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao Conectar com o Banco de Dados
            </h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar as estatísticas do sistema. Verifique a conexão e tente novamente.
            </p>
            <ModernButton onClick={() => window.location.reload()}>
              Recarregar Página
            </ModernButton>
          </div>
        </ModernCard>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Bem-vindo ao painel de controle. {stats.usuariosAtivos} usuários ativos no sistema.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ModernButton variant="secondary" size="sm" icon={<Eye className="h-4 w-4" />}>
            Ver Relatórios
          </ModernButton>
          <ModernButton size="sm" icon={<Plus className="h-4 w-4" />}>
            Novo Usuário
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
                        stat.color === 'red' ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'
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
                            ? 'bg-green-50 text-green-600' 
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
          <BarChart3 className="h-5 w-5" />
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
        
        {/* Métricas Detalhadas */}
        <ModernCard variant="glass" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Métricas Detalhadas</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-500" />
                <span className="font-medium text-gray-900">Produtos Ativos</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalProdutos}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-900">Orçamentos</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.totalOrcamentos}</div>
                <div className="text-sm text-gray-500">{stats.orcamentosAprovados} aprovados</div>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Status do Sistema */}
        <ModernCard variant="elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Status do Sistema</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Servidor Principal', status: 'online', uptime: '99.9%' },
              { label: 'Banco de Dados', status: 'online', uptime: '99.8%' },
              { label: 'API Gateway', status: 'online', uptime: '99.7%' },
              { label: 'CDN', status: 'warning', uptime: '98.5%' }
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'online' ? 'bg-green-500' : 
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-gray-900">{service.label}</span>
                </div>
                <span className="text-sm text-gray-600">{service.uptime}</span>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>

      {/* Actions Cards Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Backup de Dados</h3>
              <p className="text-sm text-gray-600">Última sincronização: 2h atrás</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600">Sistema operando normalmente</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Segurança</h3>
              <p className="text-sm text-gray-600">Todas as verificações OK</p>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
