'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Shield, 
  UserPlus, 
  User, 
  Edit, 
  Trash2, 
  Loader2, 
  Plus,
  Search,
  Filter,
  Crown,
  PhoneCall,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import ModernTable, { StatusBadge, AvatarCell } from '@/components/ui/modern-table'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import UsuarioForm from '@/components/forms/usuario-form'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  role: string
  ativo: boolean
  avatar?: string
  createdAt: string
  clienteProfile?: any
  vendedorProfile?: any
        _count: {
    orcamentos: number
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'ADMIN': return 'Administrador'
    case 'VENDEDOR': return 'Vendedor'
    case 'CLIENTE': return 'Cliente'
    default: return role
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'ADMIN': return 'danger'
    case 'VENDEDOR': return 'primary'
    case 'CLIENTE': return 'success'
    default: return 'default'
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'ADMIN': return <Crown className="h-4 w-4" />
    case 'VENDEDOR': return <UserPlus className="h-4 w-4" />
    case 'CLIENTE': return <User className="h-4 w-4" />
    default: return <User className="h-4 w-4" />
  }
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios')
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      
      const data = await response.json()
      setUsuarios(Array.isArray(data) ? data : [])
      success('Usuários carregados', `${data.length} usuários encontrados`)
    } catch (err: any) {
      error('Erro ao carregar usuários', err.message)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`Tem certeza que deseja excluir "${usuario.nome}"?`)) return

    setDeleting(usuario.id)
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir usuário')
      }

      setUsuarios(prev => prev.filter(u => u.id !== usuario.id))
      success('Usuário excluído', `${usuario.nome} foi removido com sucesso`)
    } catch (err: any) {
      error('Erro ao excluir', err.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUsuario(null)
  }

  // Filtrar usuários
  const filteredUsuarios = usuarios.filter(usuario => {
    const searchMatch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const roleMatch = !roleFilter || usuario.role === roleFilter
    const statusMatch = statusFilter === '' || 
                       (statusFilter === 'ativo' && usuario.ativo) ||
                       (statusFilter === 'inativo' && !usuario.ativo)
    
    return searchMatch && roleMatch && statusMatch
  })

  // Estatísticas
  const stats = {
    total: usuarios.length,
    admins: usuarios.filter(u => u.role === 'ADMIN').length,
    vendedores: usuarios.filter(u => u.role === 'VENDEDOR').length,
    clientes: usuarios.filter(u => u.role === 'CLIENTE').length,
    ativos: usuarios.filter(u => u.ativo).length
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'usuario',
      label: 'Usuário',
      render: (usuario: Usuario) => (
        <AvatarCell
          src={usuario.avatar}
          name={usuario.nome}
          subtitle={usuario.email}
        />
      )
    },
    {
      key: 'contato',
      label: 'Contato',
      render: (usuario: Usuario) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-[200px]">{usuario.email}</span>
          </div>
          {usuario.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PhoneCall className="h-3 w-3 text-gray-400" />
              <span>{usuario.telefone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Função',
      render: (usuario: Usuario) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(usuario.role)}
          <StatusBadge
            status={getRoleLabel(usuario.role)}
            variant={getRoleColor(usuario.role) as any}
          />
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (usuario: Usuario) => (
        <StatusBadge
          status={usuario.ativo ? 'Ativo' : 'Inativo'}
          variant={usuario.ativo ? 'success' : 'danger'}
        />
      )
    },
    {
      key: 'orcamentos',
      label: 'Orçamentos',
      sortable: true,
      render: (usuario: Usuario) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {usuario._count.orcamentos}
          </div>
          <div className="text-xs text-gray-500">propostas</div>
        </div>
      )
    },
    {
      key: 'cadastro',
      label: 'Cadastro',
      sortable: true,
      render: (usuario: Usuario) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span>{new Date(usuario.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      )
    }
  ]

  // Ações da tabela
  const actions = [
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
      loading: (usuario: Usuario) => deleting === usuario.id,
      show: (usuario: Usuario) => usuario.role !== 'ADMIN' || stats.admins > 1
    }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-600" />
            Gestão de Usuários
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os usuários do sistema e suas permissões
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
            {filteredUsuarios.length} de {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''}
        </span>
          
          <ModernButton
            onClick={() => setShowForm(true)}
            icon={<Plus className="h-4 w-4" />}
            animation="glow"
          >
            Novo Usuário
          </ModernButton>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard
          title="Total de Usuários"
          value={stats.total}
          subtitle="Registrados"
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Administradores"
          value={stats.admins}
          subtitle="Acesso total"
          icon={<Crown className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Vendedores"
          value={stats.vendedores}
          subtitle="Equipe comercial"
          icon={<UserPlus className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatsCard
          title="Clientes"
          value={stats.clientes}
          subtitle="Base de clientes"
          icon={<User className="h-5 w-5" />}
          trend={{ value: stats.total > 0 ? (stats.clientes / stats.total * 100) : 0, label: 'do total' }}
          loading={loading}
        />
        
        <StatsCard
          title="Usuários Ativos"
          value={stats.ativos}
          subtitle="Contas habilitadas"
          icon={<CheckCircle className="h-5 w-5" />}
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
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Todas as Funções</option>
            <option value="ADMIN">Administrador</option>
            <option value="VENDEDOR">Vendedor</option>
            <option value="CLIENTE">Cliente</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>

          <ModernButton
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setRoleFilter('')
              setStatusFilter('')
            }}
            icon={<Filter className="h-4 w-4" />}
          >
            Limpar Filtros
          </ModernButton>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredUsuarios.length} usuários encontrados
            {(searchTerm || roleFilter || statusFilter) && ` de ${usuarios.length} total`}
          </p>
          
          {(searchTerm || roleFilter || statusFilter) && (
            <ModernButton
              variant="ghost"
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('')
                setStatusFilter('')
              }}
            >
              Mostrar Todos
            </ModernButton>
          )}
            </div>
      </ModernCard>

      {/* Tabela Moderna */}
      <ModernTable
        data={filteredUsuarios}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable
        filterable
        emptyState={
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter || statusFilter
                ? 'Nenhum usuário encontrado'
                : 'Nenhum usuário cadastrado'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || roleFilter || statusFilter
                ? 'Tente ajustar os filtros para encontrar usuários'
                : 'Comece adicionando usuários ao sistema'
              }
            </p>
            <ModernButton 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              {searchTerm || roleFilter || statusFilter
                ? 'Limpar Filtros'
                : 'Adicionar Primeiro Usuário'
              }
            </ModernButton>
          </div>
        }
        pagination={{
          page: 1,
          totalPages: Math.ceil(filteredUsuarios.length / 10),
          onPageChange: (page) => console.log('Page:', page)
        }}
      />

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Shield className="h-6 w-6" />
        </div>
            <div>
              <h3 className="font-semibold text-gray-900">Permissões e Roles</h3>
              <p className="text-sm text-gray-600">Gerenciar acessos</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <TrendingUp className="h-6 w-6" />
        </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatório de Atividade</h3>
              <p className="text-sm text-gray-600">Monitorar uso</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="bordered" interactive className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <AlertTriangle className="h-6 w-6" />
        </div>
            <div>
              <h3 className="font-semibold text-gray-900">Auditoria de Segurança</h3>
              <p className="text-sm text-gray-600">Log de ações</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <UsuarioForm
          usuario={editingUsuario}
          onClose={handleFormClose}
          onSuccess={() => {
            fetchUsuarios()
            handleFormClose()
          }}
        />
      )}
    </div>
  )
}