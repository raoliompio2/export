'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar, 
  Edit, 
  Award, 
  Loader2,
  DollarSign,
  Target,
  Settings,
  Save,
  Phone,
  Mail,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle,
  Camera
} from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import PerfilForm from '@/components/forms/perfil-form'

interface VendedorData {
  user: {
    id: string
    nome: string
    email: string
    telefone?: string
    avatar?: string
    role: string
    createdAt: string
  }
  vendedorProfile: {
    id: string
    comissao: number
    meta: number
    createdAt: string
  }
  clienteProfile?: any
  stats?: {
    totalClientes: number
    totalOrcamentos: number
    orcamentosAprovados: number
    totalVendas: number
  }
  clientes?: any[]
  orcamentos?: any[]
}

export default function VendedorPerfil() {
  const [vendedor, setVendedor] = useState<VendedorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState(false)
  const [configForm, setConfigForm] = useState({
    comissao: 0,
    meta: 0
  })
  const { success, error } = useToast()

  const fetchVendedorProfile = async () => {
    try {
      console.log('🔄 Buscando perfil do vendedor...')
      const response = await fetch('/api/perfil')
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        throw new Error(errorData.error || 'Erro ao carregar perfil')
      }
      
      const data = await response.json()
      console.log('📊 Dados recebidos da API:', {
        id: data.id,
        nome: data.nome,
        email: data.email,
        role: data.role,
        hasUser: !!data.user,
        hasVendedorProfile: !!data.vendedorProfile,
        hasStats: !!data.stats
      })
      
      setVendedor(data)
      
      if (data.vendedorProfile) {
        const comissao = Number(data.vendedorProfile.comissao) || 0
        const meta = Number(data.vendedorProfile.meta) || 0
        
        console.log('📊 Configurações carregadas:', { comissao, meta })
        
        setConfigForm({
          comissao,
          meta
        })
      }
      success('Perfil carregado', 'Dados atualizados com sucesso')
    } catch (err: any) {
      console.error('❌ Erro ao carregar perfil:', err)
      error('Erro ao carregar perfil', err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      console.log('💾 Salvando configurações:', configForm)
      
      // Validar dados antes de enviar
      if (configForm.comissao < 0 || configForm.comissao > 100) {
        error('Erro de validação', 'Comissão deve estar entre 0% e 100%')
        return
      }
      
      if (configForm.meta < 0) {
        error('Erro de validação', 'Meta deve ser um valor positivo')
        return
      }

      const response = await fetch('/api/vendedor/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro da API:', errorData)
        throw new Error(errorData.error || 'Erro ao salvar configurações')
      }
      
      await fetchVendedorProfile()
      setEditingConfig(false)
      success('Configurações salvas', 'Suas preferências foram atualizadas')
    } catch (err: any) {
      console.error('❌ Erro ao salvar:', err)
      error('Erro ao salvar configurações', err.message)
    }
  }

  useEffect(() => {
    fetchVendedorProfile()
  }, [])

  const handleEditSuccess = () => {
    fetchVendedorProfile()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'success'
      case 'PENDENTE': return 'warning'
      case 'REJEITADO': return 'danger'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADO': return <CheckCircle className="h-4 w-4" />
      case 'PENDENTE': return <Clock className="h-4 w-4" />
      case 'REJEITADO': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 text-lg">Carregando seu perfil...</p>
        </div>
      </div>
    )
  }

  if (!vendedor) {
    return (
      <ModernCard className="text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Perfil não encontrado</h3>
        <p className="text-gray-500">Não foi possível carregar as informações do perfil</p>
      </ModernCard>
    )
  }

  // Verificar se user existe, se não, usar dados básicos
  if (!vendedor.user) {
    console.warn('⚠️ vendedor.user não encontrado, usando dados básicos')
    vendedor.user = {
      id: 'unknown',
      nome: 'Usuário',
      email: 'email@exemplo.com',
      telefone: '',
      avatar: '',
      role: 'VENDEDOR',
      createdAt: new Date().toISOString()
    }
  }

  const stats = vendedor.stats || { totalClientes: 0, totalOrcamentos: 0, orcamentosAprovados: 0, totalVendas: 0 }
  const taxaConversao = stats.totalOrcamentos > 0 ? (stats.orcamentosAprovados / stats.totalOrcamentos * 100) : 0
  const meta = vendedor.vendedorProfile?.meta || 0
  const vendas = stats.totalVendas || 0
  const progressoMeta = meta > 0 ? (vendas / meta * 100) : 0

  console.log('📊 Cálculos do progresso:', {
    meta,
    vendas,
    progressoMeta: progressoMeta.toFixed(2) + '%',
    vendedorProfile: vendedor.vendedorProfile,
    stats
  })

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-8 w-8 text-emerald-600" />
            Meu Perfil
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas informações pessoais e configurações de vendas
          </p>
        </div>
        
        <ModernButton
          onClick={() => setShowEditForm(true)}
          icon={<Edit className="h-4 w-4" />}
          animation="glow"
        >
          Editar Perfil
        </ModernButton>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna Principal */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Informações Pessoais */}
          <ModernCard variant="gradient" className="p-8">
            <div className="flex items-center space-x-6">
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-lg">
                  {vendedor.user?.avatar ? (
                    <img
                      className="h-full w-full object-cover"
                      src={vendedor.user.avatar}
                      alt={vendedor.user?.nome || 'Usuário'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{vendedor.user?.nome || 'Usuário'}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>{vendedor.user?.email || 'email@exemplo.com'}</span>
                </div>
                {vendedor.user?.telefone && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Phone className="h-4 w-4" />
                    <span>{vendedor.user.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    <Star className="h-3 w-3 mr-1" />
                    {vendedor.user?.role || 'VENDEDOR'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Desde {vendedor.user?.createdAt ? new Date(vendedor.user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Configurações de Vendas */}
          <ModernCard>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configurações de Vendas</h3>
                  <p className="text-sm text-gray-600">Ajuste suas metas e comissões</p>
                </div>
              </div>
              
              {!editingConfig ? (
                <ModernButton
                  variant="ghost"
                  onClick={() => setEditingConfig(true)}
                  icon={<Edit className="h-4 w-4" />}
                >
                  Editar
                </ModernButton>
              ) : (
                <div className="flex gap-2">
                  <ModernButton
                    variant="ghost"
                    onClick={() => setEditingConfig(false)}
                  >
                    Cancelar
                  </ModernButton>
                  <ModernButton
                    onClick={saveConfig}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Salvar
                  </ModernButton>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>Percentual de Comissão</span>
                    </div>
                  </label>
                  {editingConfig ? (
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={configForm.comissao}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          console.log('📝 Comissão alterada:', value)
                          setConfigForm({...configForm, comissao: value})
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600">
                        {vendedor.vendedorProfile?.comissao || 0}%
                      </div>
                      <div className="text-sm text-green-700">Por venda realizada</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span>Meta Mensal</span>
                    </div>
                  </label>
                  {editingConfig ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        min="0"
                        value={configForm.meta}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          console.log('📝 Meta alterada:', value)
                          setConfigForm({...configForm, meta: value})
                        }}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600">
                        R$ {(vendedor.vendedorProfile?.meta || 0).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-blue-700">Objetivo mensal</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progresso da Meta */}
              {!editingConfig && vendedor.vendedorProfile && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Progresso da Meta</span>
                    <span className="text-sm font-semibold text-gray-900">{progressoMeta.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>R$ {vendas.toLocaleString('pt-BR')}</span>
                    <span>R$ {meta.toLocaleString('pt-BR')}</span>
                  </div>
                  
                  {progressoMeta >= 100 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-green-800">
                        <Award className="h-5 w-5" />
                        <span className="font-medium">Parabéns! Meta atingida! 🎉</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModernCard>

          {/* Últimos Orçamentos */}
          <ModernCard>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Últimos Orçamentos</h3>
                  <p className="text-sm text-gray-600">Suas propostas mais recentes</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {vendedor.orcamentos && vendedor.orcamentos.length > 0 ? (
                <div className="space-y-4">
                  {vendedor.orcamentos.slice(0, 5).map((orcamento) => (
                    <ModernCard key={orcamento.id} variant="bordered" interactive className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">
                              {orcamento.numero}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              getStatusColor(orcamento.status) === 'success' ? 'bg-green-100 text-green-800' :
                              getStatusColor(orcamento.status) === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              getStatusColor(orcamento.status) === 'danger' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusIcon(orcamento.status)}
                              {orcamento.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Cliente: {orcamento.cliente?.user?.nome || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            R$ {parseFloat(orcamento.total || 0).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento</h3>
                  <p className="text-gray-500 mb-4">Seus orçamentos aparecerão aqui</p>
                  <ModernButton onClick={() => window.location.href = '/vendedor/orcamentos'}>
                    Criar Primeiro Orçamento
                  </ModernButton>
                </div>
              )}
            </div>
          </ModernCard>
        </div>

        {/* Coluna Lateral - Estatísticas */}
        <div className="space-y-6">
          
          {/* Estatísticas de Performance */}
          <div className="space-y-4">
            <StatsCard
              title="Total de Clientes"
              value={stats.totalClientes}
              subtitle="Base de clientes"
              icon={<Users className="h-5 w-5" />}
            />
            
            <StatsCard
              title="Orçamentos Criados"
              value={stats.totalOrcamentos}
              subtitle="Propostas enviadas"
              icon={<FileText className="h-5 w-5" />}
            />
            
            <StatsCard
              title="Taxa de Conversão"
              value={`${taxaConversao.toFixed(1)}%`}
              subtitle="Orçamentos aprovados"
              icon={<TrendingUp className="h-5 w-5" />}
              trend={{ value: taxaConversao, label: 'conversão' }}
            />
          </div>

          {/* Total em Vendas */}
          <ModernCard className="p-6 text-white bg-gradient-to-br from-emerald-500 to-teal-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white bg-opacity-20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Total em Vendas</h3>
                <p className="text-sm opacity-90">Este mês</p>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">
              R$ {vendas.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm opacity-75">
              {stats.orcamentosAprovados || 0} vendas confirmadas
            </div>
          </ModernCard>

          {/* Comissões */}
          <ModernCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Comissões
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              {(() => {
                const comissaoPercent = vendedor.vendedorProfile?.comissao || 0
                
                // Filtrar orçamentos do mês atual
                const agora = new Date()
                const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
                const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59)
                
                const orcamentosDoMes = vendedor.orcamentos?.filter(orc => {
                  const dataOrcamento = new Date(orc.createdAt)
                  return dataOrcamento >= inicioMes && dataOrcamento <= fimMes
                }) || []
                
                // Calcular comissões confirmadas (orçamentos APROVADOS do mês)
                const orcamentosAprovados = orcamentosDoMes.filter(orc => orc.status === 'APROVADO')
                const comissaoConfirmada = orcamentosAprovados.reduce((total, orc) => {
                  const valor = parseFloat(orc.total || '0')
                  return total + (valor * comissaoPercent / 100)
                }, 0)
                
                // Calcular comissões potenciais (orçamentos ENVIADOS do mês)
                const orcamentosEnviados = orcamentosDoMes.filter(orc => orc.status === 'ENVIADO')
                const comissaoPotencial = orcamentosEnviados.reduce((total, orc) => {
                  const valor = parseFloat(orc.total || '0')
                  return total + (valor * comissaoPercent / 100)
                }, 0)
                
                return (
                  <div className="space-y-4">
                    {/* Comissões Confirmadas */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Comissões a Receber</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {orcamentosAprovados.length} vendas
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-800 mb-1">
                        R$ {comissaoConfirmada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-green-600">
                        {comissaoPercent}% sobre vendas aprovadas
                      </div>
                    </div>

                    {/* Comissões Potenciais */}
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-700">Comissões Potenciais</span>
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          {orcamentosEnviados.length} enviados
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-800 mb-1">
                        R$ {comissaoPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-yellow-600">
                        {comissaoPercent}% sobre orçamentos enviados
                      </div>
                    </div>

                    {/* Resumo */}
                    {(comissaoConfirmada > 0 || comissaoPotencial > 0) && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-sm font-medium text-blue-700 mb-2">Total Potencial</div>
                        <div className="text-xl font-bold text-blue-800">
                          R$ {(comissaoConfirmada + comissaoPotencial).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Se todas as propostas forem aprovadas
                        </div>
                      </div>
                    )}

                    {comissaoConfirmada === 0 && comissaoPotencial === 0 && (
                      <div className="text-center py-6">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma comissão ainda</p>
                        <p className="text-xs text-gray-400">Crie orçamentos para gerar comissões</p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </ModernCard>

          {/* Ações Rápidas */}
          <ModernCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <ModernButton
                  variant="ghost"
                  onClick={() => window.location.href = '/vendedor/clientes'}
                  className="w-full justify-start"
                  icon={<Users className="h-4 w-4" />}
                >
                  Ver Todos os Clientes
                </ModernButton>
                
                <ModernButton
                  variant="ghost"
                  onClick={() => window.location.href = '/vendedor/orcamentos'}
                  className="w-full justify-start"
                  icon={<FileText className="h-4 w-4" />}
                >
                  Criar Novo Orçamento
                </ModernButton>
                
                <ModernButton
                  variant="ghost"
                  onClick={() => window.location.href = '/vendedor/produtos'}
                  className="w-full justify-start"
                  icon={<Building2 className="h-4 w-4" />}
                >
                  Gerenciar Produtos
                </ModernButton>
              </div>
            </div>
          </ModernCard>

          {/* Clientes Recentes */}
          <ModernCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clientes Recentes</h3>
              {vendedor.clientes && vendedor.clientes.length > 0 ? (
                <div className="space-y-3">
                  {vendedor.clientes.slice(0, 3).map((cliente) => (
                    <div key={cliente.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {cliente.user?.nome?.slice(0, 2).toUpperCase() || 'CL'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{cliente.user?.nome || 'Cliente'}</p>
                        <p className="text-sm text-gray-500 truncate">{cliente.user?.email || 'email@exemplo.com'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Nenhum cliente ainda</p>
                </div>
              )}
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Form de Edição de Perfil */}
      {showEditForm && vendedor && (
        <PerfilForm
          initialData={vendedor}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}