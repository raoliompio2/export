'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Loader2, 
  Eye, 
  BarChart3, 
  TrendingUp,
  AlertTriangle,
  Star,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import ProdutoForm from '@/components/forms/produto-form'
import ProdutoView from '@/components/views/produto-view'

interface Produto {
  id: string
  codigo: string
  nome: string
  descricao?: string
  categoria: {
    id: string
    nome: string
  }
  empresa: {
    id: string
    nome: string
  }
  preco: number
  precoPromocional?: number
  unidade: string
  estoque: number
  estoqueMinimo: number
  peso?: number
  dimensoes?: string
  imagens: string[]
  status: string
  destaque: boolean
  createdAt: string
}

interface Categoria {
  id: string
  nome: string
}

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [viewingProduto, setViewingProduto] = useState<Produto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchProdutos()
    fetchCategorias()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (!response.ok) throw new Error('Erro ao carregar produtos')
      
      const data = await response.json()
      setProdutos(Array.isArray(data) ? data : [])
      success('Produtos carregados', `${data.length} produtos encontrados`)
    } catch (err: any) {
      error('Erro ao carregar produtos', err.message)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (!response.ok) throw new Error('Erro ao carregar categorias')
      
      const data = await response.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (err: any) {
      // Erro silencioso para categorias
      setCategorias([])
    }
  }

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto)
    setViewingProduto(null)
    setShowForm(true)
  }

  const handleView = (produto: Produto) => {
    setViewingProduto(produto)
    setEditingProduto(null)
    setShowForm(false)
  }

  const handleDelete = async (produto: Produto) => {
    if (!confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) return

    setDeleting(produto.id)
    try {
      const response = await fetch(`/api/produtos/${produto.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir produto')
      }

      setProdutos(prev => prev.filter(p => p.id !== produto.id))
      success('Produto excluído', `${produto.nome} foi removido com sucesso`)
    } catch (err: any) {
      error('Erro ao excluir', err.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduto(null)
  }

  const handleViewClose = () => {
    setViewingProduto(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'success'
      case 'INATIVO': return 'warning'
      case 'DESCONTINUADO': return 'danger'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO': return <CheckCircle className="h-4 w-4" />
      case 'INATIVO': return <AlertTriangle className="h-4 w-4" />
      case 'DESCONTINUADO': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    const searchMatch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       produto.empresa.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = !statusFilter || produto.status === statusFilter
    const categoryMatch = !categoryFilter || produto.categoria.id === categoryFilter
    
    return searchMatch && statusMatch && categoryMatch
  })

  // Estatísticas
  const stats = {
    total: produtos.length,
    ativos: produtos.filter(p => p.status === 'ATIVO').length,
    inativos: produtos.filter(p => p.status === 'INATIVO').length,
    destaque: produtos.filter(p => p.destaque).length,
    estoqueMinimo: produtos.filter(p => p.estoque <= p.estoqueMinimo).length
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'produto',
      label: 'Produto',
      render: (produto: Produto) => (
        <AvatarCell
          src={produto.imagens?.[0]}
          name={produto.nome}
          subtitle={produto.codigo}
          fallback={<Package className="h-5 w-5" />}
        />
      )
    },
    {
      key: 'categoria.nome',
      label: 'Categoria',
      sortable: true
    },
    {
      key: 'empresa.nome',
      label: 'Empresa',
      sortable: true
    },
    {
      key: 'preco',
      label: 'Preço',
      sortable: true,
      render: (produto: Produto) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {produto.precoPromocional && (
            <div className="text-sm text-red-600">
              Promo: R$ {produto.precoPromocional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'estoque',
      label: 'Estoque',
      sortable: true,
      render: (produto: Produto) => (
        <div className="text-center">
          <div className={`font-semibold ${produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : 'text-gray-900'}`}>
            {produto.estoque} {produto.unidade}
          </div>
          {produto.estoque <= produto.estoqueMinimo && (
            <div className="text-xs text-red-600 font-medium">Estoque baixo!</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (produto: Produto) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(produto.status)}
          <div>
            <StatusBadge
              status={produto.status}
              variant={getStatusColor(produto.status) as any}
            />
            {produto.destaque && (
              <div className="mt-1">
                <StatusBadge status="Destaque" variant="default" />
              </div>
            )}
          </div>
        </div>
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
      onClick: handleDelete,
      loading: (produto: Produto) => deleting === produto.id
    }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-emerald-600" />
            Gestão de Produtos
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie todo o catálogo de produtos da plataforma
          </p>
        </div>
        
        <ModernButton
          onClick={() => setShowForm(true)}
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          Novo Produto
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard
          title="Total de Produtos"
          value={stats.total}
          subtitle="No catálogo"
          icon={<Package className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Produtos Ativos"
          value={stats.ativos}
          subtitle="Disponíveis"
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{ value: stats.total > 0 ? (stats.ativos / stats.total * 100) : 0, label: 'do total' }}
          loading={loading}
        />
        
        <StatsCard
          title="Em Destaque"
          value={stats.destaque}
          subtitle="Produtos promocionais"
          icon={<Star className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Estoque Baixo"
          value={stats.estoqueMinimo}
          subtitle="Requer atenção"
          icon={<AlertTriangle className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Inativos"
          value={stats.inativos}
          subtitle="Fora de linha"
          icon={<XCircle className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Filtros */}
      <ModernCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="DESCONTINUADO">Descontinuado</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>

          <ModernButton
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setCategoryFilter('')
            }}
            icon={<Filter className="h-4 w-4" />}
          >
            Limpar Filtros
          </ModernButton>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredProdutos.length} produtos encontrados
            {(searchTerm || statusFilter || categoryFilter) && ` de ${produtos.length} total`}
          </p>
          
          {(searchTerm || statusFilter || categoryFilter) && (
            <ModernButton
              variant="ghost"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setCategoryFilter('')
              }}
            >
              Mostrar Todos
            </ModernButton>
          )}
        </div>
      </ModernCard>

      {/* Tabela Moderna */}
      <ModernTable
        data={filteredProdutos}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        filterable
        emptyState={
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter || categoryFilter
                ? 'Nenhum produto encontrado'
                : 'Nenhum produto cadastrado'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || categoryFilter
                ? 'Tente ajustar os filtros para encontrar produtos'
                : 'Comece adicionando produtos ao catálogo'
              }
            </p>
            <ModernButton 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              {searchTerm || statusFilter || categoryFilter
                ? 'Limpar Filtros'
                : 'Adicionar Primeiro Produto'
              }
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(filteredProdutos.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatório de Vendas</h3>
              <p className="text-sm text-gray-600">Performance dos produtos</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Controle de Estoque</h3>
              <p className="text-sm text-gray-600">Gerenciar inventário</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gestão de Preços</h3>
              <p className="text-sm text-gray-600">Otimizar precificação</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <ProdutoForm
          produto={editingProduto}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchProdutos()
            handleFormClose()
          }}
        />
      )}

      {/* Modal de Visualização */}
      {viewingProduto && (
        <ProdutoView
          produto={viewingProduto}
          onClose={handleViewClose}
          onEdit={() => {
            setEditingProduto(viewingProduto)
            setViewingProduto(null)
            setShowForm(true)
          }}
        />
      )}
    </div>
  )
}