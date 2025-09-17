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

async function getDashboardData() {
  const user = await requireCliente()
  
  // Buscar dados do cliente
  const clienteData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      clienteProfile: true
    }
  })

  if (!clienteData?.clienteProfile) {
    throw new Error('Perfil de cliente não encontrado')
  }

  const clienteId = clienteData.clienteProfile.id

  // Buscar estatísticas
  const [
    totalOrcamentos,
    orcamentosAprovados,
    orcamentosPendentes,
    orcamentosRecentes,
    produtosDisponiveis
  ] = await Promise.all([
    prisma.orcamento.count({
      where: { clienteId }
    }),
    prisma.orcamento.count({
      where: { 
        clienteId,
        status: 'APROVADO'
      }
    }),
    prisma.orcamento.count({
      where: { 
        clienteId,
        status: 'PENDENTE'
      }
    }),
    prisma.orcamento.findMany({
      where: { clienteId },
      include: {
        vendedorEmpresa: {
          include: {
            empresa: true,
            vendedor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.produto.count({
      where: { ativo: true }
    })
  ])

  return {
    totalOrcamentos,
    orcamentosAprovados,
    orcamentosPendentes,
    orcamentosRecentes,
    produtosDisponiveis,
    cliente: clienteData
  }
}

export default async function ClienteDashboard() {
  const data = await getDashboardData()

  const dashboardStats = [
    {
      title: 'Orçamentos Solicitados',
      value: data.totalOrcamentos,
      change: 12.5,
      changeLabel: 'este mês',
      icon: <FileText className="h-5 w-5" />,
      color: 'blue' as const
    },
    {
      title: 'Orçamentos Aprovados',
      value: data.orcamentosAprovados,
      change: 25.3,
      changeLabel: 'conversão',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'green' as const
    },
    {
      title: 'Aguardando Resposta',
      value: data.orcamentosPendentes,
      change: 0,
      changeLabel: 'pendentes',
      icon: <Clock className="h-5 w-5" />,
      color: 'orange' as const
    },
    {
      title: 'Produtos Disponíveis',
      value: data.produtosDisponiveis,
      change: 8.7,
      changeLabel: 'catálogo',
      icon: <Package className="h-5 w-5" />,
      color: 'purple' as const
    }
  ]

  const handleSolicitarOrcamento = () => {
    // Navigation will be implemented later
    console.log('Navigate to new quote')
  }

  const handleVerCatalogo = () => {
    // Navigation will be implemented later  
    console.log('Navigate to catalog')
  }

  const handleHistoricoPedidos = () => {
    // Navigation will be implemented later
    console.log('Navigate to order history')
  }

  const quickActions = [
    {
      title: 'Solicitar Orçamento',
      description: 'Nova cotação de produtos',
      icon: <Plus className="h-5 w-5" />,
      action: handleSolicitarOrcamento,
      color: 'blue' as const
    },
    {
      title: 'Ver Catálogo',
      description: 'Explorar produtos disponíveis',
      icon: <Package className="h-5 w-5" />,
      action: handleVerCatalogo,
      color: 'green' as const
    },
    {
      title: 'Histórico de Pedidos',
      description: 'Visualizar compras anteriores',
      icon: <Clock className="h-5 w-5" />,
      action: handleHistoricoPedidos,
      color: 'purple' as const
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-sm">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Bem-vindo de volta, {data.cliente.nome}! Confira suas cotações e explore nossos produtos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg text-purple-700">
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">Cliente VIP</span>
          </div>
          <ModernButton size="sm" icon={<Plus className="h-4 w-4" />}>
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
                        {stat.change !== 0 && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isPositive 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-red-50 text-red-600'
                          }`}>
                            <span>{isPositive ? '↗' : '↘'} {Math.abs(stat.change)}%</span>
                          </div>
                        )}
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
          <TrendingUp className="h-5 w-5" />
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Orçamentos Recentes</h3>
            </div>
            <ModernButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />}>
              Ver todos
            </ModernButton>
          </div>
          
          <div className="space-y-4">
            {data.orcamentosRecentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>Nenhum orçamento ainda</p>
                <ModernButton size="sm" className="mt-3">
                  Solicitar primeiro orçamento
                </ModernButton>
              </div>
            ) : (
              data.orcamentosRecentes.map((orcamento) => (
                <div key={orcamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                      {orcamento.vendedorEmpresa?.empresa.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{orcamento.vendedorEmpresa?.empresa.nome}</div>
                      <div className="text-sm text-gray-500">
                        Vendedor: {orcamento.vendedorEmpresa?.vendedor.nome}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      R$ {orcamento.valorTotal.toLocaleString('pt-BR')}
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

        {/* Status e Benefícios */}
        <ModernCard variant="elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Star className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Status VIP</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-900">Cliente Premium</div>
                  <div className="text-sm text-purple-600">Benefícios exclusivos</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.orcamentosAprovados}</div>
                  <div className="text-xs text-purple-500">Pedidos aprovados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">5★</div>
                  <div className="text-xs text-purple-500">Avaliação</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Seus Benefícios</h4>
              <div className="space-y-2">
                {[
                  'Atendimento prioritário',
                  'Descontos exclusivos',
                  'Frete grátis',
                  'Suporte 24/7'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Recommendations */}
      <ModernCard variant="gradient" className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Recomendações Personalizadas
            </h3>
            <p className="text-gray-600 mb-4">
              Baseado no seu histórico, selecionamos produtos que podem interessar você.
            </p>
            <div className="flex items-center gap-4">
              <ModernButton icon={<Package className="h-4 w-4" />}>
                Ver Catálogo
              </ModernButton>
              <ModernButton variant="secondary" icon={<MessageCircle className="h-4 w-4" />}>
                Falar com Vendedor
              </ModernButton>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <Package className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  )
}

// Função auxiliar importada de @/lib/auth
