'use client'

import { ReactNode, useState, useMemo } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import ModernCard from './modern-card'
import ModernButton, { GhostButton } from './modern-button'

interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (item: T, value: any) => ReactNode
  className?: string
}

interface TableAction<T> {
  label: string
  icon?: ReactNode
  onClick: (item: T) => void
  variant?: 'primary' | 'secondary' | 'danger'
  show?: (item: T) => boolean
}

interface ModernTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: TableAction<T>[]
  searchable?: boolean
  filterable?: boolean
  loading?: boolean
  emptyState?: ReactNode
  className?: string
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export default function ModernTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  searchable = true,
  filterable = false,
  loading = false,
  emptyState,
  className = "",
  pagination
}: ModernTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Filtros e busca
  const filteredData = useMemo(() => {
    let filtered = [...data]

    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getCellValue = (item: T, column: TableColumn<T>) => {
    const value = typeof column.key === 'string' && column.key.includes('.') 
      ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
      : item[column.key as keyof T]
    
    return column.render ? column.render(item, value) : value
  }

  if (loading) {
    return (
      <ModernCard className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </ModernCard>
    )
  }

  return (
    <ModernCard className={`overflow-hidden ${className}`}>
      
      {/* Header com busca e filtros */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {filterable && (
              <GhostButton icon={<Filter className="h-4 w-4" />}>
                Filtros
              </GhostButton>
            )}
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && typeof column.key === 'string' && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      <div className="text-blue-500">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {actions.length > 0 && (
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-12 text-center">
                  {emptyState || (
                    <div className="text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <div className="text-lg font-medium">Nenhum resultado encontrado</div>
                      <div className="text-sm">Tente ajustar seus filtros de busca</div>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition-all duration-200 ${
                    hoveredRow === rowIndex 
                      ? 'bg-blue-50 transform scale-[1.01] shadow-md' 
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {getCellValue(item, column) as React.ReactNode}
                    </td>
                  ))}
                  
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {actions
                          .filter(action => !action.show || action.show(item))
                          .map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                action.variant === 'danger'
                                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                  : action.variant === 'primary'
                                  ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                              }`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          ))
                        }
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <ModernButton
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Anterior
              </ModernButton>
              
              <ModernButton
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Próxima
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </ModernCard>
  )
}

// Componentes auxiliares para células
export function StatusBadge({ 
  status, 
  variant = 'default' 
}: { 
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {status}
    </span>
  )
}

export function AvatarCell({ 
  src, 
  name, 
  subtitle 
}: { 
  src?: string
  name: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          name.slice(0, 2).toUpperCase()
        )}
      </div>
      <div>
        <div className="font-medium text-gray-900">{name}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
    </div>
  )
}
