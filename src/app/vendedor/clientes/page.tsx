'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import ClienteForm from '@/components/forms/cliente-form'
import ClienteView from '@/components/views/cliente-view'

interface Cliente {
  id: string
  user: {
    nome: string
    email: string
    telefone?: string
  }
  empresa?: string
  cnpj?: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  observacoes?: string
  ativo: boolean
  createdAt: string
  _count?: {
    orcamentos: number
  }
}

export default function VendedorClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (!response.ok) throw new Error('Erro ao carregar clientes')
      
      const data = await response.json()
      setClientes(Array.isArray(data) ? data : [])
      success('Clientes carregados', `${data.length} clientes encontrados`)
    } catch (err: any) {
      error('Erro ao carregar', err.message)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`Excluir cliente ${cliente.user.nome}?`)) return

    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir')
      
      setClientes(prev => prev.filter(c => c.id !== cliente.id))
      success('Cliente excluído', `${cliente.user.nome} foi removido`)
    } catch (err: any) {
      error('Erro ao excluir', err.message)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleView = (cliente: Cliente) => {
    setViewingCliente(cliente)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCliente(null)
  }

  // Estatísticas
  const stats = {
    total: clientes.length,
    ativos: clientes.filter(c => c.ativo).length,
    pessoaFisica: clientes.filter(c => c.cpf).length,
    pessoaJuridica: clientes.filter(c => c.cnpj).length
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'cliente',
      label: 'Cliente',
      render: (cliente: Cliente) => (
        <AvatarCell
          name={cliente.user.nome}
          subtitle={cliente.empresa || (cliente.cpf ? 'Pessoa Física' : 'Pessoa Jurídica')}
        />
      )
    },
    {
      key: 'contato',
      label: 'Contato',
      render: (cliente: Cliente) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span>{cliente.user.email}</span>
          </div>
          {cliente.user.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{cliente.user.telefone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'localizacao',
      label: 'Localização',
      render: (cliente: Cliente) => (
        cliente.cidade && cliente.estado ? (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span>{cliente.cidade}/{cliente.estado}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      )
    },
    {
      key: 'documento',
      label: 'Documento',
      render: (cliente: Cliente) => (
        <div className="text-sm">
          {cliente.cnpj && (
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-blue-500" />
              <span>CNPJ: {cliente.cnpj}</span>
            </div>
          )}
          {cliente.cpf && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-green-500" />
              <span>CPF: {cliente.cpf}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'orcamentos',
      label: 'Orçamentos',
      render: (cliente: Cliente) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {cliente._count?.orcamentos || 0}
          </div>
          <div className="text-xs text-gray-500">propostas</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (cliente: Cliente) => (
        <StatusBadge
          status={cliente.ativo ? 'Ativo' : 'Inativo'}
          variant={cliente.ativo ? 'success' : 'warning'}
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
            <Users className="h-8 w-8 text-emerald-600" />
            Meus Clientes
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie sua base de clientes e relacionamentos
          </p>
        </div>
        
        <ModernButton
          onClick={() => setShowForm(true)}
          icon={<Plus className="h-4 w-4" />}
          animation="glow"
        >
          Novo Cliente
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Clientes"
          value={stats.total}
          subtitle="Base completa"
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Clientes Ativos"
          value={stats.ativos}
          subtitle="Engajados"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 15.3, label: 'crescimento' }}
          loading={loading}
        />
        
        <StatsCard
          title="Pessoa Física"
          value={stats.pessoaFisica}
          subtitle="CPF cadastrado"
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Pessoa Jurídica"
          value={stats.pessoaJuridica}
          subtitle="CNPJ cadastrado"
          icon={<Building className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Tabela Moderna */}
      <ModernTable
        data={clientes}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        filterable
        emptyState={
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece construindo sua base de clientes
            </p>
            <ModernButton 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Cadastrar Primeiro Cliente
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(clientes.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Enviar Newsletter</h3>
              <p className="text-sm text-gray-600">Comunicação em massa</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Agendar Follow-up</h3>
              <p className="text-sm text-gray-600">Próximos contatos</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Clientes VIP</h3>
              <p className="text-sm text-gray-600">Programa especial</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Formulário de Cliente */}
      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchClientes()
            handleFormClose()
          }}
        />
      )}

      {/* Modal de Visualização */}
      {viewingCliente && (
        <ClienteView
          clienteId={viewingCliente.id}
          onClose={() => setViewingCliente(null)}
        />
      )}
    </div>
  )
}