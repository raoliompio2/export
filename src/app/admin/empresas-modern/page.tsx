'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Globe,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import ModernEmpresaForm from '@/components/forms/modern-empresa-form'
import EmpresaViewModal from '@/components/views/empresa-view'
import { useToast } from '@/components/ui/modern-toast'

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  email: string
  telefone?: string
  website?: string
  endereco: string
  numero?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  ativa: boolean
  createdAt: string
  _count: {
    vendedores: number
    orcamentos: number
  }
}

export default function ModernAdminEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [viewingEmpresa, setViewingEmpresa] = useState<Empresa | null>(null)
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

  const handleDelete = async (empresa: Empresa) => {
    if (!confirm(`Excluir ${empresa.nome}?`)) return

    try {
      const response = await fetch(`/api/empresas/${empresa.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir')
      
      setEmpresas(prev => prev.filter(e => e.id !== empresa.id))
      success('Empresa excluída', `${empresa.nome} foi removida`)
    } catch (err: any) {
      error('Erro ao excluir', err.message)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEmpresa(null)
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setShowForm(true)
  }

  const handleView = (empresa: Empresa) => {
    setViewingEmpresa(empresa)
  }

  // Estatísticas
  const stats = {
    total: empresas.length,
    ativas: empresas.filter(e => e.ativa).length,
    comVendedores: empresas.filter(e => e._count.vendedores > 0).length,
    comOrcamentos: empresas.filter(e => e._count.orcamentos > 0).length
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'empresa',
      label: 'Empresa',
      render: (empresa: Empresa) => (
        <AvatarCell
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
      key: 'endereco',
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
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3 w-3 text-blue-500" />
            <span>{empresa._count.vendedores} vendedores</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-3 w-3 text-green-500" />
            <span>{empresa._count.orcamentos} orçamentos</span>
          </div>
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

  // Ações da tabela
  const actions = [
    {
      label: 'Visualizar',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView
    },
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
            <Building2 className="h-8 w-8 text-blue-600" />
            Empresas Modernizadas
          </h1>
          <p className="text-gray-600 mt-2">
            Gestão avançada de empresas com interface moderna
          </p>
        </div>
        
        <ModernButton
          onClick={() => setShowForm(true)}
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          Nova Empresa
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Empresas"
          value={stats.total}
          subtitle="Empresas cadastradas"
          icon={<Building2 className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Empresas Ativas"
          value={stats.ativas}
          subtitle="Em operação"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 12.5, label: 'vs mês anterior' }}
          loading={loading}
        />
        
        <StatsCard
          title="Com Vendedores"
          value={stats.comVendedores}
          subtitle="Possuem representantes"
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Com Orçamentos"
          value={stats.comOrcamentos}
          subtitle="Geraram propostas"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8.3, label: 'crescimento' }}
          loading={loading}
        />
      </div>

      {/* Tabela Moderna */}
      <ModernTable
        data={empresas}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        filterable
        emptyState={
          <div className="text-center py-12">
            <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma empresa encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando sua primeira empresa
            </p>
            <ModernButton 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Criar Empresa
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(empresas.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Importar Empresas</h3>
              <p className="text-sm text-gray-600">Upload em lote via CSV</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatório de Performance</h3>
              <p className="text-sm text-gray-600">Análise por empresa</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gestão de Vendedores</h3>
              <p className="text-sm text-gray-600">Atribuir representantes</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Formulário de Empresa */}
      {showForm && (
        <ModernEmpresaForm
          empresa={editingEmpresa}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchEmpresas()
            handleFormClose()
          }}
        />
      )}

      {/* Modal de Visualização */}
      {viewingEmpresa && (
        <EmpresaViewModal
          empresa={viewingEmpresa}
          onClose={() => setViewingEmpresa(null)}
        />
      )}
    </div>
  )
}
