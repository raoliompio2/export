'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  Calendar,
  Mail,
  Phone,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react'
import ModernCard from '@/components/ui/modern-card'
import ModernButton from '@/components/ui/modern-button'
import { useToast } from '@/components/ui/modern-toast'

interface PendingUser {
  id: string
  email: string
  nome: string
  telefone?: string
  avatar?: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function AprovacaoUsuarios() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)
  const { success, error } = useToast()

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users')
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err: unknown) {
      error('Erro ao carregar', err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string, role: 'CLIENTE' | 'VENDEDOR') => {
    setProcessingUserId(userId)
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'APPROVE',
          role
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao aprovar usuário')
      }

      const data = await response.json()
      success('Usuário aprovado!', `${data.user.nome} foi aprovado como ${role}`)
      
      // Remover da lista
      setUsers(prev => prev.filter(u => u.id !== userId))
      
    } catch (err: any) {
      error('Erro ao aprovar', err.message)
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleRejectUser = async (userId: string) => {
    const motivo = prompt('Digite o motivo da rejeição:')
    if (!motivo) return

    setProcessingUserId(userId)
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'REJECT',
          motivo
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao rejeitar usuário')
      }

      const data = await response.json()
      success('Usuário rejeitado', `${data.user.nome} foi rejeitado`)
      
      // Remover da lista
      setUsers(prev => prev.filter(u => u.id !== userId))
      
    } catch (err: any) {
      error('Erro ao rejeitar', err.message)
    } finally {
      setProcessingUserId(null)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários pendentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-blue-600" />
            Aprovação de Usuários
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie solicitações de acesso ao sistema
          </p>
        </div>
        
        <ModernButton
          onClick={fetchPendingUsers}
          icon={<Users className="h-4 w-4" />}
          variant="outline"
        >
          Atualizar Lista
        </ModernButton>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{users.length}</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovados hoje</p>
              <p className="text-2xl font-bold text-green-600">-</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejeitados hoje</p>
              <p className="text-2xl font-bold text-red-600">-</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Lista de usuários */}
      {users.length === 0 ? (
        <ModernCard className="text-center py-12">
          <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário pendente</h3>
          <p className="text-gray-500">Todos os usuários foram processados</p>
        </ModernCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {users.map((user) => (
            <ModernCard key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                
                {/* Informações do usuário */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.nome}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {user.nome}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      
                      {user.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{user.telefone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Solicitado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <ModernButton
                    onClick={() => handleApproveUser(user.id, 'CLIENTE')}
                    icon={<CheckCircle className="h-4 w-4" />}
                    variant="success"
                    size="sm"
                    disabled={processingUserId === user.id}
                  >
                    Cliente
                  </ModernButton>
                  
                  <ModernButton
                    onClick={() => handleApproveUser(user.id, 'VENDEDOR')}
                    icon={<CheckCircle className="h-4 w-4" />}
                    variant="primary"
                    size="sm"
                    disabled={processingUserId === user.id}
                  >
                    Vendedor
                  </ModernButton>
                  
                  <ModernButton
                    onClick={() => handleRejectUser(user.id)}
                    icon={<XCircle className="h-4 w-4" />}
                    variant="danger"
                    size="sm"
                    disabled={processingUserId === user.id}
                  >
                    Rejeitar
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      )}
    </div>
  )
}
