'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Loader2,
  CreditCard,
  Hash,
  Edit,
  Activity
} from 'lucide-react'

interface Orcamento {
  id: string
  numero: string
  titulo: string
  status: string
  total: number | string
  createdAt: string
  empresa: {
    nome: string
  }
}

interface Cliente {
  id: string
  empresa?: string
  cnpj?: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nome: string
    email: string
    telefone?: string
  }
  vendedor?: {
    id: string
    user: {
      id: string
      nome: string
      email: string
      telefone?: string
    }
  }
  orcamentos?: Orcamento[]
}

interface ClienteViewProps {
  clienteId: string
  onClose: () => void
  onEdit?: () => void
}

export default function ClienteView({ clienteId, onClose, onEdit }: ClienteViewProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`/api/clientes/${clienteId}`)
        if (!response.ok) throw new Error('Erro ao carregar cliente')
        
        const data = await response.json()
        setCliente(data)
      } catch (error) {
        console.error('Erro ao carregar cliente:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
  }, [clienteId])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados do cliente...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Cliente não encontrado</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  const totalOrcamentos = cliente.orcamentos?.length || 0
  const orcamentosAprovados = cliente.orcamentos?.filter((o: Orcamento) => o.status === 'APROVADO').length || 0
  const valorTotal = cliente.orcamentos?.filter((o: Orcamento) => o.status === 'APROVADO')
    .reduce((sum: number, o: Orcamento) => sum + parseFloat(String(o.total)), 0) || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{cliente.user.nome}</h3>
              <p className="text-blue-600">{cliente.empresa || 'Cliente'}</p>
              <p className="text-sm text-gray-500">
                Cliente desde {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-800">{totalOrcamentos}</p>
              <p className="text-sm text-green-600">Total de Orçamentos</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-800">{orcamentosAprovados}</p>
              <p className="text-sm text-purple-600">Orçamentos Aprovados</p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-800">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-yellow-600">Valor Total Aprovado</p>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Dados Pessoais
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nome Completo</p>
                  <p className="font-medium text-gray-900">{cliente.user.nome}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{cliente.user.email}</p>
                  </div>
                </div>
                
                {cliente.user.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="text-gray-900">{cliente.user.telefone}</p>
                    </div>
                  </div>
                )}

                {(cliente.cpf || cliente.cnpj) && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {cliente.cpf ? 'CPF' : 'CNPJ'}
                      </p>
                      <p className="text-gray-900">
                        {cliente.cpf || cliente.cnpj}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dados da Empresa/Endereço */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                {cliente.empresa ? 'Dados da Empresa' : 'Informações Adicionais'}
              </h4>
              <div className="space-y-4">
                {cliente.empresa && (
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="font-medium text-gray-900">{cliente.empresa}</p>
                  </div>
                )}
                
                {cliente.endereco && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Endereço</p>
                      <div className="text-gray-900">
                        <p>{cliente.endereco}</p>
                        {cliente.cidade && (
                          <p>
                            {cliente.cidade}
                            {cliente.estado && `, ${cliente.estado}`}
                          </p>
                        )}
                        {cliente.cep && <p>CEP: {cliente.cep}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {cliente.observacoes && (
                  <div>
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="text-gray-900">{cliente.observacoes}</p>
                  </div>
                )}

                {!cliente.empresa && !cliente.endereco && !cliente.observacoes && (
                  <p className="text-gray-500 italic">Nenhuma informação adicional cadastrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Histórico de Orçamentos */}
          {cliente.orcamentos && cliente.orcamentos.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Histórico de Orçamentos ({cliente.orcamentos.length})
              </h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Número</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Título</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Valor</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cliente.orcamentos.map((orcamento: Orcamento) => (
                        <tr key={orcamento.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{orcamento.numero}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-900">{orcamento.titulo}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              orcamento.status === 'APROVADO' ? 'bg-green-100 text-green-800' :
                              orcamento.status === 'ENVIADO' ? 'bg-blue-100 text-blue-800' :
                              orcamento.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                              orcamento.status === 'REJEITADO' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {orcamento.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-medium text-gray-900">
                               R$ {(typeof orcamento.total === 'string' ? parseFloat(orcamento.total) : orcamento.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-500">
                            {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Vendedor */}
          {cliente.vendedor && (
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Vendedor Responsável
              </h4>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cliente.vendedor.user.nome}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {cliente.vendedor.user.email}
                    </span>
                    {cliente.vendedor.user.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.vendedor.user.telefone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
