'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  FileText, 
  Star,
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Plus,
  Eye,
  Calendar,
  MessageCircle
} from 'lucide-react'
import ModernCard, { StatsCard, ActionCard } from '@/components/ui/modern-card'
import ModernButton from '@/components/ui/modern-button'
import OptimizedCurrencyDisplay from '@/components/ui/optimized-currency-display'

interface DashboardData {
  totalOrcamentos: number
  orcamentosAprovados: number
  orcamentosPendentes: number
  produtosDisponiveis: number
  orcamentosRecentes: Array<{
    id: string
    numero: string
    titulo: string
    total: number
    status: string
    createdAt: string
    empresa: {
      nome: string
    }
  }>
}

export default function ClienteDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // TODO: Implementar chamada para API /api/cliente/dashboard
        // const response = await fetch('/api/cliente/dashboard')
        // const dashboardData = await response.json()
        
        // Dados mockados temporariamente
        const mockData: DashboardData = {
          totalOrcamentos: 12,
          orcamentosAprovados: 8,
          orcamentosPendentes: 4,
          produtosDisponiveis: 156,
          orcamentosRecentes: [
            {
              id: '1',
              numero: 'ORC-001',
              titulo: 'Equipamentos Industriais',
              total: 45000,
              status: 'APROVADO',
              createdAt: '2024-01-15',
              empresa: { nome: 'TechExport Ltda' }
            },
            {
              id: '2',
              numero: 'ORC-002',
              titulo: 'Componentes Eletrônicos',
              total: 28000,
              status: 'PENDENTE',
              createdAt: '2024-01-14',
              empresa: { nome: 'ElectroGlobal' }
            }
          ]
        }
        
        setData(mockData)
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err)
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Erro ao carregar dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <ModernButton 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Tentar novamente
              </ModernButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const dashboardStats = [
    {
      title: 'Orçamentos Solicitados',
      value: data.totalOrcamentos,
      trend: { value: 12.5, label: 'este mês' },
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'Orçamentos Aprovados',
      value: data.orcamentosAprovados,
      trend: { value: 25.3, label: 'taxa de conversão' },
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      title: 'Aguardando Resposta',
      value: data.orcamentosPendentes,
      trend: { value: 0, label: 'pendentes' },
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: 'Produtos Disponíveis',
      value: data.produtosDisponiveis,
      trend: { value: 8.2, label: 'novos produtos' },
      icon: <Package className="h-5 w-5" />
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return 'bg-green-100 text-green-800'
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJEITADO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return 'Aprovado'
      case 'PENDENTE':
        return 'Pendente'
      case 'REJEITADO':
        return 'Rejeitado'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe seus orçamentos e produtos disponíveis
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
            />
          ))}
      </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orçamentos Recentes */}
          <ModernCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Orçamentos Recentes
                </h2>
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/cliente/orcamentos'}
                >
                  <Eye className="h-4 w-4 mr-2" />
              Ver todos
            </ModernButton>
          </div>
          
          <div className="space-y-4">
                {data.orcamentosRecentes.length > 0 ? (
              data.orcamentosRecentes.map((orcamento) => (
                    <div
                      key={orcamento.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/orcamento/${orcamento.id}/public`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            {orcamento.numero}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orcamento.status)}`}>
                            {getStatusLabel(orcamento.status)}
                          </span>
                    </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {orcamento.titulo}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {orcamento.empresa.nome}
                        </p>
                  </div>
                  <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          <OptimizedCurrencyDisplay amount={orcamento.total} fromCurrency="BRL" toCurrency="USD" />
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                  </div>
                </div>
              ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum orçamento encontrado</p>
                  </div>
            )}
              </div>
          </div>
        </ModernCard>

          {/* Ações Rápidas */}
          <ModernCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Ações Rápidas
              </h2>

              <div className="space-y-4">
                <ActionCard
                  title="Solicitar Orçamento"
                  description="Faça uma nova solicitação de orçamento"
                  icon={<Plus className="h-5 w-5" />}
                  action={() => window.location.href = '/cliente/orcamentos'}
                  color="blue"
                />

                <ActionCard
                  title="Ver Produtos"
                  description="Explore nosso catálogo de produtos"
                  icon={<Package className="h-5 w-5" />}
                  action={() => window.location.href = '/cliente/produtos'}
                  color="green"
                />

                <ActionCard
                  title="Meu Perfil"
                  description="Atualize suas informações pessoais"
                  icon={<Star className="h-5 w-5" />}
                  action={() => window.location.href = '/cliente/perfil'}
                  color="purple"
                />

                <ActionCard
                  title="Contato"
                  description="Entre em contato com nossa equipe"
                  icon={<MessageCircle className="h-5 w-5" />}
                  action={() => window.location.href = '/contato'}
                  color="orange"
                />
            </div>
          </div>
        </ModernCard>
      </div>

        {/* Performance Summary */}
        <div className="mt-8">
          <ModernCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumo de Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data.totalOrcamentos > 0 ? Math.round((data.orcamentosAprovados / data.totalOrcamentos) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    <OptimizedCurrencyDisplay amount={data.orcamentosRecentes.reduce((sum, orc) => sum + orc.total, 0)} fromCurrency="BRL" toCurrency="USD" />
                  </div>
                  <p className="text-sm text-gray-600">Valor Total Recente</p>
            </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {data.orcamentosRecentes.length}
          </div>
                  <p className="text-sm text-gray-600">Orçamentos Ativos</p>
            </div>
          </div>
        </div>
      </ModernCard>
        </div>
      </div>
    </div>
  )
}
