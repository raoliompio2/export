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
  BarChart3
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ModernDashboard from '@/components/ui/modern-dashboard'
import ModernCard from '@/components/ui/modern-card'

async function getAdminStats() {
  try {
    const [
      totalUsuarios,
      totalVendedores,
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      orcamentosAprovados,
      usuariosAtivos
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VENDEDOR' } }),
      prisma.user.count({ where: { role: 'CLIENTE' } }),
      prisma.produto.count(),
      prisma.orcamento.count(),
      prisma.orcamento.count({ where: { status: 'APROVADO' } }),
      prisma.user.count({ where: { ativo: true } })
    ])

    return {
      totalUsuarios,
      totalVendedores,
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      orcamentosAprovados,
      usuariosAtivos,
      taxaConversao: totalOrcamentos > 0 ? (orcamentosAprovados / totalOrcamentos * 100) : 0
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      totalUsuarios: 0,
      totalVendedores: 0,
      totalClientes: 0,
      totalProdutos: 0,
      totalOrcamentos: 0,
      orcamentosAprovados: 0,
      usuariosAtivos: 0,
      taxaConversao: 0
    }
  }
}

export default async function ModernAdminDashboard() {
  const stats = await getAdminStats()

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

  const quickActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Criar, editar e gerenciar contas de usuário',
      icon: <Users className="h-5 w-5" />,
      action: () => window.location.href = '/admin/usuarios',
      color: 'blue' as const
    },
    {
      title: 'Catálogo de Produtos',
      description: 'Visualizar e gerenciar produtos do sistema',
      icon: <Package className="h-5 w-5" />,
      action: () => window.location.href = '/admin/produtos',
      color: 'green' as const
    },
    {
      title: 'Configurações',
      description: 'Configurar parâmetros do sistema',
      icon: <Settings className="h-5 w-5" />,
      action: () => window.location.href = '/admin/config',
      color: 'purple' as const
    }
  ]

  return (
    <ModernDashboard
      title="Dashboard Administrativo"
      subtitle={`Bem-vindo ao painel de controle. ${stats.usuariosAtivos} usuários ativos no sistema.`}
      stats={dashboardStats}
      quickActions={quickActions}
    >
      
      {/* Seção de Atividade Recente */}
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
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-500" />
                <span className="font-medium text-gray-900">Produtos Ativos</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalProdutos}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
    </ModernDashboard>
  )
}
