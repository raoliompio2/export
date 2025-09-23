'use client'

import { useState, useEffect } from 'react'
import { X, Filter, Search } from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'

interface Categoria {
  id: string
  nome: string
  _count: {
    produtos: number
  }
}

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  _count: {
    produtos: number
  }
}

interface ProdutoFiltersProps {
  onFiltersChange: (filters: {
    search: string
    categoriaId: string
    empresaId: string
    status: string
    destaque: boolean | null
  }) => void
  onClose: () => void
}

export default function ProdutoFilters({ onFiltersChange, onClose }: ProdutoFiltersProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState({
    search: '',
    categoriaId: '',
    empresaId: '',
    status: '',
    destaque: null as boolean | null
  })

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchFilterData = async () => {
    try {
      const [categoriasRes, empresasRes] = await Promise.all([
        fetch('/api/categorias'),
        fetch('/api/empresas')
      ])

      if (categoriasRes.ok) {
        const categoriasData = await categoriasRes.json()
        setCategorias(categoriasData)
      }

      if (empresasRes.ok) {
        const empresasData = await empresasRes.json()
        setEmpresas(empresasData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      categoriaId: '',
      empresaId: '',
      status: '',
      destaque: null
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.search || filters.categoriaId || filters.empresaId || filters.status || filters.destaque !== null

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Buscar produto</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Digite o nome ou código do produto..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Categoria</label>
        <select
          value={filters.categoriaId}
          onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome} ({categoria._count.produtos})
            </option>
          ))}
        </select>
      </div>

      {/* Empresa */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Empresa</label>
        <select
          value={filters.empresaId}
          onChange={(e) => handleFilterChange('empresaId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Todas as empresas</option>
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nomeFantasia || empresa.nome} ({empresa._count.produtos})
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="DESCONTINUADO">Descontinuado</option>
        </select>
      </div>

      {/* Destaque */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Destaque</label>
        <select
          value={filters.destaque === null ? '' : filters.destaque ? 'true' : 'false'}
          onChange={(e) => {
            const value = e.target.value === '' ? null : e.target.value === 'true'
            handleFilterChange('destaque', value)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Todos os produtos</option>
          <option value="true">Apenas em destaque</option>
          <option value="false">Sem destaque</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <ModernButton
          variant="secondary"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="flex-1"
        >
          Limpar Filtros
        </ModernButton>
        <ModernButton
          onClick={onClose}
          className="flex-1"
        >
          Aplicar Filtros
        </ModernButton>
      </div>
    </div>
  )
}
