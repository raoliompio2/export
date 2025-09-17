'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Eye, Edit, Trash2, TrendingUp, AlertCircle } from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'

interface Produto {
  id: string
  codigo: string
  nome: string
  categoria: {
    nome: string
  }
  empresa: {
    nome: string
  }
  preco: number
  precoPromocional?: number
  estoque: number
  estoqueMinimo: number
  status: string
  destaque: boolean
  imagens: string[]
}

export default function ModernProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const { success, error } = useToast()

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (!response.ok) throw new Error('Erro ao carregar produtos')
      
      const data = await response.json()
      setProdutos(Array.isArray(data) ? data : [])
      success('Produtos carregados', `${data.length} produtos encontrados`)
    } catch (err: unknown) {
      error('Erro ao carregar', err instanceof Error ? err.message : "Erro desconhecido")
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (produto: Produto) => {
    if (!confirm(`Excluir ${produto.nome}?`)) return

    try {
      const response = await fetch(`/api/produtos/${produto.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir')
      
      setProdutos(prev => prev.filter(p => p.id !== produto.id))
      success('Produto excluído', `${produto.nome} foi removido`)
    } catch (err: unknown) {
      error('Erro ao excluir', err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  // Estatísticas
  const stats = {
    total: produtos.length,
    ativos: produtos.filter(p => p.status === 'ATIVO').length,
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
        <div>
          <div className="font-medium">
            R$ {produto.preco.toLocaleString('pt-BR')}
          </div>
          {produto.precoPromocional && (
            <div className="text-sm text-red-600">
              Promo: R$ {produto.precoPromocional.toLocaleString('pt-BR')}
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
          <div className={`font-medium ${
            produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : 'text-gray-900'
          }`}>
            {produto.estoque}
          </div>
          {produto.estoque <= produto.estoqueMinimo && (
            <div className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Baixo
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (produto: Produto) => (
        <div className="space-y-1">
          <StatusBadge
            status={produto.status}
            variant={
              produto.status === 'ATIVO' ? 'success' :
              produto.status === 'INATIVO' ? 'warning' : 'danger'
            }
          />
          {produto.destaque && (
            <div>
              <StatusBadge status="Destaque" variant="default" />
            </div>
          )}
        </div>
      )
    }
  ]

  // Ações da tabela
  const actions = [
    {
      label: 'Visualizar',
      icon: <Eye className="h-4 w-4" />,
      onClick: (produto: Produto) => {
        // Abrir modal de visualização
        console.log('Ver produto:', produto)
      }
    },
    {
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      variant: 'primary' as const,
      onClick: (produto: Produto) => {
        // Abrir modal de edição
        console.log('Editar produto:', produto)
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Produtos Modernos</h1>
          <p className="text-gray-600 mt-2">
            Gestão avançada de produtos com interface moderna
          </p>
        </div>
        
        <ModernButton
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          Novo Produto
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Produtos"
          value={stats.total}
          subtitle="Catálogo completo"
          icon={<Package className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Produtos Ativos"
          value={stats.ativos}
          subtitle="Disponíveis para venda"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 12.5, label: 'vs mês anterior' }}
          loading={loading}
        />
        
        <StatsCard
          title="Em Destaque"
          value={stats.destaque}
          subtitle="Produtos destacados"
          icon={<Package className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Estoque Baixo"
          value={stats.estoqueMinimo}
          subtitle="Requer atenção"
          icon={<AlertCircle className="h-5 w-5" />}
          trend={{ value: -8.2, label: 'melhorou' }}
          loading={loading}
        />
      </div>

      {/* Tabela Moderna */}
      <ModernTable
        data={produtos}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        filterable
        emptyState={
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando seu primeiro produto
            </p>
            <ModernButton icon={<Plus className="h-4 w-4" />}>
              Criar Produto
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(produtos.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Importar Produtos</h3>
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
              <h3 className="font-semibold text-gray-900">Relatório de Vendas</h3>
              <p className="text-sm text-gray-600">Performance por produto</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Alertas de Estoque</h3>
              <p className="text-sm text-gray-600">Configurar notificações</p>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
