'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Eye,
  AlertCircle,
  Link,
  UserCheck
} from 'lucide-react'
import ModernCard from '@/components/ui/modern-card'
import ModernButton from '@/components/ui/modern-button'
import { useToast } from '@/components/ui/modern-toast'
interface SolicitacaoRepresentacao {
  id: string
  vendedorId: string
  empresaId: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'
  mensagem?: string
  createdAt: string
  vendedor: {
    id: string
    user: {
      nome: string
      email: string
      telefone?: string
    }
  }
  empresa: {
    id: string
    nome: string
    cnpj: string
    logo?: string
  }
}

interface VendedorEmpresa {
  id: string
  vendedorId: string
  empresaId: string
  ativo: boolean
  comissao?: number
  createdAt: string
  vendedor: {
    user: {
      nome: string
      email: string
    }
  }
  empresa: {
    nome: string
    cnpj: string
  }
}

export default function AdminRepresentacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRepresentacao[]>([])
  const [associacoes, setAssociacoes] = useState<VendedorEmpresa[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pendentes' | 'ativas'>('pendentes')
  const [processing, setProcessing] = useState<string | null>(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [solicitacoesRes, associacoesRes] = await Promise.all([
        fetch('/api/admin/solicitacoes-representacao'),
        fetch('/api/admin/associacoes-vendedor-empresa')
      ])

      if (solicitacoesRes.ok) {
        const solicitacoesData = await solicitacoesRes.json()
        setSolicitacoes(solicitacoesData.solicitacoes || [])
      }

      if (associacoesRes.ok) {
        const associacoesData = await associacoesRes.json()
        setAssociacoes(associacoesData.associacoes || [])
      }
    } catch (err: unknown) {
      error('Erro ao carregar dados', err instanceof Error ? err instanceof Error ? err.message : "Erro desconhecido" : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (solicitacaoId: string) => {
    setProcessing(solicitacaoId)
    try {
      const response = await fetch('/api/admin/aprovar-representacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitacaoId,
          acao: 'APROVAR'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao aprovar')
      }

      success('Solicitação aprovada!', 'Vendedor agora representa a empresa')
      fetchData()
    } catch (err: unknown) {
      error('Erro ao aprovar', err instanceof Error ? err instanceof Error ? err.message : "Erro desconhecido" : 'Erro desconhecido')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (solicitacaoId: string) => {
    setProcessing(solicitacaoId)
    try {
      const response = await fetch('/api/admin/aprovar-representacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitacaoId,
          acao: 'REJEITAR'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao rejeitar')
      }

      success('Solicitação rejeitada', 'Vendedor foi notificado')
      fetchData()
    } catch (err: unknown) {
      error('Erro ao rejeitar', err instanceof Error ? err instanceof Error ? err.message : "Erro desconhecido" : 'Erro desconhecido')
    } finally {
      setProcessing(null)
    }
  }

  const handleToggleStatus = async (associacaoId: string, novoStatus: boolean) => {
    setProcessing(associacaoId)
    try {
      const response = await fetch('/api/admin/toggle-associacao-vendedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          associacaoId,
          ativo: novoStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao alterar status')
      }

      success(
        novoStatus ? 'Associação ativada' : 'Associação desativada',
        `Vendedor ${novoStatus ? 'pode' : 'não pode'} mais representar a empresa`
      )
      fetchData()
    } catch (err: unknown) {
      error('Erro ao alterar status', err instanceof Error ? err instanceof Error ? err.message : "Erro desconhecido" : 'Erro desconhecido')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'PENDENTE')
  const associacoesAtivas = associacoes.filter(a => a.ativo)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Link className="h-8 w-8 text-blue-600" />
            Representações
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie solicitações e associações vendedor-empresa
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pendentes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pendentes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Solicitações Pendentes
              {solicitacoesPendentes.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {solicitacoesPendentes.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ativas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ativas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Associações Ativas
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {associacoesAtivas.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'pendentes' && (
        <div className="space-y-4">
          {solicitacoesPendentes.length === 0 ? (
            <ModernCard className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação pendente
              </h3>
              <p className="text-gray-500">
                Todas as solicitações de representação foram processadas.
              </p>
            </ModernCard>
          ) : (
            solicitacoesPendentes.map((solicitacao) => (
              <ModernCard key={solicitacao.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {solicitacao.vendedor.user.nome}
                          </p>
                          <p className="text-sm text-gray-500">
                            {solicitacao.vendedor.user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>→</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {solicitacao.empresa.nome}
                          </p>
                          <p className="text-sm text-gray-500">
                            CNPJ: {solicitacao.empresa.cnpj}
                          </p>
                        </div>
                      </div>
                    </div>

                    {solicitacao.mensagem && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Mensagem:</strong> {solicitacao.mensagem}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Solicitado em {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <ModernButton
                      onClick={() => handleApprove(solicitacao.id)}
                      icon={<CheckCircle className="h-4 w-4" />}
                      variant="success"
                      size="sm"
                      disabled={processing === solicitacao.id}
                    >
                      Aprovar
                    </ModernButton>
                    <ModernButton
                      onClick={() => handleReject(solicitacao.id)}
                      icon={<XCircle className="h-4 w-4" />}
                      variant="danger"
                      size="sm"
                      disabled={processing === solicitacao.id}
                    >
                      Rejeitar
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'ativas' && (
        <div className="space-y-4">
          {associacoes.length === 0 ? (
            <ModernCard className="p-8 text-center">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma associação ativa
              </h3>
              <p className="text-gray-500">
                Não há vendedores associados a empresas no momento.
              </p>
            </ModernCard>
          ) : (
            associacoes.map((associacao) => (
              <ModernCard key={associacao.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {associacao.vendedor.user.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {associacao.vendedor.user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>→</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {associacao.empresa.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          CNPJ: {associacao.empresa.cnpj}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        associacao.ativo ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-xs font-medium ${
                        associacao.ativo ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {associacao.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ModernButton
                      onClick={() => handleToggleStatus(associacao.id, !associacao.ativo)}
                      icon={associacao.ativo ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      variant={associacao.ativo ? "danger" : "success"}
                      size="sm"
                      disabled={processing === associacao.id}
                    >
                      {associacao.ativo ? 'Desativar' : 'Ativar'}
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            ))
          )}
        </div>
      )}
    </div>
  )
}
