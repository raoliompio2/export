'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Edit, 
  Eye,
  Globe,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Users,
  Star,
  Settings
} from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import EmpresaViewModal from '@/components/views/empresa-view'
import SolicitarRepresentacaoModal from '@/components/modals/solicitar-representacao-modal'
import VendedorEmpresaConfigModal from '@/components/modals/vendedor-empresa-config-modal'

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  email: string
  telefone?: string
  website?: string
  cidade: string
  estado: string
  ativa: boolean
  logo?: string
  _count?: {
    vendedores: number
    produtos: number
    orcamentos: number
  }
  vendedorEmpresa?: {
    id: string
    ativo: boolean
    comissao?: number
    meta?: number
  }
}

export default function VendedorEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingEmpresa, setViewingEmpresa] = useState<Empresa | null>(null)
  const [showSolicitarForm, setShowSolicitarForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Empresa | null>(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas')
      if (!response.ok) throw new Error('Erro ao carregar empresas')
      
      const data = await response.json()
      setEmpresas(Array.isArray(data) ? data : [])
      success('Empresas carregadas', `${data.length} empresas encontradas`)
    } catch (err: any) {
      error('Erro ao carregar', err.message)
      setEmpresas([])
    } finally {
      setLoading(false)
    }
  }

  const handleSolicitarRepresentacao = () => {
    setShowSolicitarForm(true)
  }

  const handleViewEmpresa = (empresa: Empresa) => {
    setViewingEmpresa(empresa)
  }

  const handleEditConfig = (empresa: Empresa) => {
    setEditingConfig(empresa)
  }

  const handleCloseForms = () => {
    setShowSolicitarForm(false)
    setViewingEmpresa(null)
    setEditingConfig(null)
  }

  // Separar empresas representadas das disponíveis
  const empresasRepresentadas = empresas.filter(e => e.vendedorEmpresa?.ativo)
  const empresasDisponiveis = empresas.filter(e => !e.vendedorEmpresa?.ativo)

  // Estatísticas
  const stats = {
    representadas: empresasRepresentadas.length,
    disponiveis: empresasDisponiveis.length,
    produtos: empresasRepresentadas.reduce((sum, e) => sum + (e._count?.produtos || 0), 0),
    vendas: empresasRepresentadas.reduce((sum, e) => sum + (e._count?.orcamentos || 0), 0)
  }

  // Configuração das colunas para empresas representadas
  const columnsRepresentadas = [
    {
      key: 'empresa',
      label: 'Empresa',
      render: (empresa: Empresa) => (
        <AvatarCell
          src={empresa.logo}
          name={empresa.nome}
          subtitle={empresa.nomeFantasia || empresa.cnpj}
        />
      )
    },
    {
      key: 'contato',
      label: 'Contato',
      render: (empresa: Empresa) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{empresa.email}</span>
          </div>
          {empresa.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{empresa.telefone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'localizacao',
      label: 'Localização',
      render: (empresa: Empresa) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span>{empresa.cidade}/{empresa.estado}</span>
        </div>
      )
    },
    {
      key: 'configuracao',
      label: 'Minha Config',
      render: (empresa: Empresa) => (
        <div className="text-sm">
          {empresa.vendedorEmpresa?.comissao && (
            <div>Comissão: {empresa.vendedorEmpresa.comissao}%</div>
          )}
          {empresa.vendedorEmpresa?.meta && (
            <div>Meta: R$ {empresa.vendedorEmpresa.meta.toLocaleString('pt-BR')}</div>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Estatísticas',
      render: (empresa: Empresa) => (
        <div className="text-sm">
          <div>{empresa._count?.produtos || 0} produtos</div>
          <div className="text-gray-500">{empresa._count?.orcamentos || 0} vendas</div>
        </div>
      )
    },
    {
      key: 'website',
      label: 'Website',
      render: (empresa: Empresa) => (
        empresa.website ? (
          <a 
            href={empresa.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <Globe className="h-3 w-3" />
            <span>Visitar</span>
          </a>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      )
    }
  ]

  // Ações para empresas representadas
  const actionsRepresentadas = [
    {
      label: 'Ver detalhes',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewEmpresa
    },
    {
      label: 'Editar configurações',
      icon: <Settings className="h-4 w-4" />,
      variant: 'primary' as const,
      onClick: handleEditConfig
    }
  ]

  // Configuração das colunas para empresas disponíveis
  const columnsDisponiveis = [
    {
      key: 'empresa',
      label: 'Empresa',
      render: (empresa: Empresa) => (
        <AvatarCell
          src={empresa.logo}
          name={empresa.nome}
          subtitle={empresa.nomeFantasia || empresa.cnpj}
        />
      )
    },
    {
      key: 'contato',
      label: 'Contato',
      render: (empresa: Empresa) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{empresa.email}</span>
          </div>
          {empresa.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{empresa.telefone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'localizacao',
      label: 'Localização',
      render: (empresa: Empresa) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span>{empresa.cidade}/{empresa.estado}</span>
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Estatísticas',
      render: (empresa: Empresa) => (
        <div className="text-sm">
          <div>{empresa._count?.vendedores || 0} vendedores</div>
          <div className="text-gray-500">{empresa._count?.produtos || 0} produtos</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (empresa: Empresa) => (
        <StatusBadge
          status={empresa.ativa ? 'Ativa' : 'Inativa'}
          variant={empresa.ativa ? 'success' : 'warning'}
        />
      )
    }
  ]

  // Ações para empresas disponíveis
  const actionsDisponiveis = [
    {
      label: 'Ver detalhes',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewEmpresa
    },
    {
      label: 'Solicitar representação',
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary' as const,
      onClick: () => setShowSolicitarForm(true)
    }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-emerald-600" />
            Minhas Empresas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas representações e busque novas oportunidades
          </p>
        </div>
        
        <ModernButton
          onClick={handleSolicitarRepresentacao}
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          Solicitar Representação
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Empresas Representadas"
          value={stats.representadas}
          subtitle="Parcerias ativas"
          icon={<Building2 className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Oportunidades"
          value={stats.disponiveis}
          subtitle="Empresas disponíveis"
          icon={<TrendingUp className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Produtos Disponíveis"
          value={stats.produtos}
          subtitle="Para comercialização"
          icon={<Star className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Vendas Realizadas"
          value={stats.vendas}
          subtitle="Através das empresas"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 15.8, label: 'este mês' }}
          loading={loading}
        />
      </div>

      {/* Empresas Representadas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Minhas Representações</h2>
          <span className="text-sm text-gray-500">{stats.representadas} empresas</span>
        </div>

        <ModernTable
          data={empresasRepresentadas}
          columns={columnsRepresentadas}
          actions={actionsRepresentadas}
          loading={loading}
          searchable
          emptyState={
            <div className="text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma empresa representada
              </h3>
              <p className="text-gray-500 mb-4">
                Solicite representação para começar a vender
              </p>
              <ModernButton 
                onClick={handleSolicitarRepresentacao}
                icon={<Plus className="h-4 w-4" />}
              >
                Solicitar Representação
              </ModernButton>
            </div>
          }
        />
      </div>

      {/* Empresas Disponíveis */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Oportunidades de Representação</h2>
          <span className="text-sm text-gray-500">{stats.disponiveis} empresas</span>
        </div>

        <ModernTable
          data={empresasDisponiveis}
          columns={columnsDisponiveis}
          actions={actionsDisponiveis}
          loading={loading}
          searchable
          filterable
          emptyState={
            <div className="text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Todas as empresas já representadas
              </h3>
              <p className="text-gray-500">
                Parabéns! Você já representa todas as empresas disponíveis
              </p>
            </div>
          }
        />
      </div>

      {/* Modais */}
      {showSolicitarForm && (
        <SolicitarRepresentacaoModal
          onClose={handleCloseForms}
          onSuccess={() => {
            fetchEmpresas()
            handleCloseForms()
          }}
        />
      )}

      {viewingEmpresa && (
        <EmpresaViewModal
          empresa={viewingEmpresa}
          onClose={handleCloseForms}
          onEdit={() => {
            setEditingConfig(viewingEmpresa)
            setViewingEmpresa(null)
          }}
        />
      )}

      {editingConfig && (
        <VendedorEmpresaConfigModal
          empresa={editingConfig}
          onClose={handleCloseForms}
          onSuccess={() => {
            fetchEmpresas()
            handleCloseForms()
          }}
        />
      )}
    </div>
  )
}