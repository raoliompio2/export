'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/modern-toast'
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  Loader2,
  Users,
  FileText,
  Eye
} from 'lucide-react'
import ModernEmpresaForm from '@/components/forms/modern-empresa-form'
import EmpresaViewModal from '@/components/views/empresa-view'

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  email: string
  telefone?: string
  website?: string
  endereco: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  banco?: string
  agencia?: string
  conta?: string
  logo?: string
  corPrimaria: string
  ativa: boolean
  createdAt: string | Date
  updatedAt: string | Date
  _count: {
    vendedores: number
    orcamentos: number
  }
}

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [viewingEmpresa, setViewingEmpresa] = useState<Empresa | null>(null)
  const { success, error } = useToast()
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas')
      if (!response.ok) throw new Error('Erro ao carregar empresas')
      
      const data = await response.json()
      setEmpresas(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setViewingEmpresa(null)
    setShowForm(true)
  }

  const handleView = (empresa: Empresa) => {
    setViewingEmpresa(empresa)
    setEditingEmpresa(null)
    setShowForm(false)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEmpresa(null)
  }

  const handleViewClose = () => {
    setViewingEmpresa(null)
  }

  const handleDelete = async (empresaId: string, empresaNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${empresaNome}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    setDeleting(empresaId)
    try {
      const response = await fetch(`/api/empresas/${empresaId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir empresa')
      }

      await fetchEmpresas() // Recarregar lista
      success('Empresa excluída', 'A empresa foi removida com sucesso!')
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error)
      error('Erro ao excluir', error.message || 'Erro ao excluir empresa')
    } finally {
      setDeleting(null)
    }
  }

  const filteredEmpresas = empresas.filter(empresa => 
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm) ||
    (empresa.nomeFantasia && empresa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalEmpresas = empresas.length
  const empresasAtivas = empresas.filter(e => e.ativa).length
  const totalVendedores = empresas.reduce((sum, e) => sum + e._count.vendedores, 0)
  const totalOrcamentos = empresas.reduce((sum, e) => sum + e._count.orcamentos, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova Empresa
        </button>
      </div>

      <p className="text-gray-600">Gerencie as empresas representadas pelo sistema.</p>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmpresas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{empresasAtivas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendedores</p>
              <p className="text-2xl font-bold text-gray-900">{totalVendedores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Orçamentos</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrcamentos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar empresas por nome, CNPJ ou nome fantasia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredEmpresas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatísticas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{empresa.nome}</div>
                          {empresa.nomeFantasia && (
                            <div className="text-sm text-gray-500">{empresa.nomeFantasia}</div>
                          )}
                          <div className="text-xs text-gray-500">CNPJ: {empresa.cnpj}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {empresa.email}
                        </div>
                        {empresa.telefone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {empresa.telefone}
                          </div>
                        )}
                        {empresa.website && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Globe className="h-3 w-3 text-gray-400" />
                            {empresa.website}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-1 text-sm text-gray-700">
                        <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                        <div>
                          <div>{empresa.endereco}{empresa.numero && `, ${empresa.numero}`}</div>
                          <div className="text-xs text-gray-500">
                            {empresa.bairro} - {empresa.cidade}/{empresa.estado}
                          </div>
                          <div className="text-xs text-gray-500">CEP: {empresa.cep}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        empresa.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {empresa.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-blue-400" />
                          <span>{empresa._count.vendedores} vendedor{empresa._count.vendedores !== 1 ? 'es' : ''}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-3 w-3 text-green-400" />
                          <span>{empresa._count.orcamentos} orçamento{empresa._count.orcamentos !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleView(empresa)}
                          className="text-purple-600 hover:text-purple-900 p-1" 
                          title="Visualizar empresa"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(empresa)}
                          className="text-blue-600 hover:text-blue-900 p-1" 
                          title="Editar empresa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(empresa.id, empresa.nome)}
                          disabled={deleting === empresa.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50" 
                          title="Excluir empresa"
                        >
                          {deleting === empresa.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma empresa encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tente alterar os termos de busca.
                </p>
              </>
            ) : (
              <>
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma empresa cadastrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece cadastrando a primeira empresa representada.
                </p>
                <div className="mt-6">
                  <button 
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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
          onClose={handleViewClose}
          onEdit={() => {
            setEditingEmpresa(viewingEmpresa)
            setViewingEmpresa(null)
            setShowForm(true)
          }}
        />
      )}
    </div>
  )
}
