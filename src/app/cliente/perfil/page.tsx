'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit, 
  Loader2,
  Shield,
  FileText,
  Star,
  Camera,
  Award,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import { StatusBadge } from '@/components/ui/modern-table'
import PerfilForm from '@/components/forms/perfil-form'

interface ClienteData {
  user: {
    id: string
    nome: string
    email: string
    telefone?: string
    avatar?: string
    role: string
    createdAt: string
  }
  clienteProfile: any
  vendedorProfile?: any
  vendedor?: any
  orcamentos?: any[]
  empresa?: string
  cnpj?: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo?: boolean
  createdAt?: string
}

export default function ClientePerfil() {
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const { success, error } = useToast()

  const fetchClienteProfile = async () => {
    try {
      const response = await fetch('/api/perfil')
      if (!response.ok) throw new Error('Erro ao carregar perfil')
      
      const data = await response.json()
      setCliente(data)
      success('Perfil carregado', 'Dados atualizados com sucesso')
    } catch (err: any) {
      error('Erro ao carregar perfil', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClienteProfile()
  }, [])

  const handleEditSuccess = () => {
    fetchClienteProfile()
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

  if (!cliente) {
    return (
      <ModernCard className="text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Perfil não encontrado</h3>
        <p className="text-gray-500">Não foi possível carregar as informações do perfil</p>
      </ModernCard>
    )
  }

  // Estatísticas do cliente
  const stats = {
    orcamentos: cliente.orcamentos?.length || 0,
    orcamentosAprovados: cliente.orcamentos?.filter(o => o.status === 'APROVADO').length || 0,
    tempoCliente: cliente.createdAt ? Math.floor((Date.now() - new Date(cliente.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
  }

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
            Gerencie suas informações pessoais e acompanhe sua atividade
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
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-lg">
                  {cliente.user.avatar ? (
                    <img
                      className="h-full w-full object-cover"
                      src={cliente.user.avatar}
                      alt={cliente.user.nome}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{cliente.user.nome}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>{cliente.user.email}</span>
                </div>
                {cliente.user.telefone && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Phone className="h-4 w-4" />
                    <span>{cliente.user.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={cliente.ativo ? 'Ativo' : 'Inativo'}
                    variant={cliente.ativo ? 'success' : 'warning'}
                  />
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Cliente desde {new Date(cliente.createdAt || cliente.user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informações Pessoais</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nome Completo</p>
                      <p className="font-medium text-gray-900">{cliente.user.nome}</p>
                    </div>
                  </div>
                  
                  {cliente.cpf && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">CPF</p>
                        <p className="font-medium text-gray-900">{cliente.cpf}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contato</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{cliente.user.email}</p>
                    </div>
                  </div>
                  
                  {cliente.user.telefone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium text-gray-900">{cliente.user.telefone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Dados da Empresa */}
          {(cliente.empresa || cliente.cnpj) && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
                    <p className="text-sm text-gray-600">Dados empresariais cadastrados</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cliente.empresa && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razão Social / Nome Fantasia
                      </label>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{cliente.empresa}</span>
                      </div>
                    </div>
                  )}

                  {cliente.cnpj && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ
                      </label>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{cliente.cnpj}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ModernCard>
          )}

          {/* Endereço */}
          {(cliente.endereco || cliente.cidade || cliente.estado || cliente.cep) && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                    <p className="text-sm text-gray-600">Localização cadastrada</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-500 mt-1" />
                  <div className="space-y-1">
                    {cliente.endereco && (
                      <p className="font-medium text-gray-900">{cliente.endereco}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-gray-600">
                      {cliente.cidade && <span>{cliente.cidade}</span>}
                      {cliente.estado && <span>- {cliente.estado}</span>}
                      {cliente.cep && <span>• CEP: {cliente.cep}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Observações */}
          {cliente.observacoes && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Observações</h3>
                    <p className="text-sm text-gray-600">Informações adicionais</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-900">{cliente.observacoes}</p>
                </div>
              </div>
            </ModernCard>
          )}
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          
          {/* Estatísticas */}
          <div className="space-y-4">
            <StatsCard
              title="Orçamentos Recebidos"
              value={stats.orcamentos}
              subtitle="Total de propostas"
              icon={<FileText className="h-5 w-5" />}
            />
            
            <StatsCard
              title="Orçamentos Aprovados"
              value={stats.orcamentosAprovados}
              subtitle="Conversões confirmadas"
              icon={<CheckCircle className="h-5 w-5" />}
              trend={{ value: stats.orcamentos > 0 ? (stats.orcamentosAprovados / stats.orcamentos * 100) : 0, label: 'taxa aprovação' }}
            />
            
            <StatsCard
              title="Tempo como Cliente"
              value={`${stats.tempoCliente}`}
              subtitle="Dias conosco"
              icon={<Clock className="h-5 w-5" />}
            />
          </div>

          {/* Vendedor Responsável */}
          {cliente.vendedor && (
            <ModernCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Vendedor Responsável
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
                    {cliente.vendedor.user.avatar ? (
                      <img
                        className="w-full h-full object-cover"
                        src={cliente.vendedor.user.avatar}
                        alt={cliente.vendedor.user.nome}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{cliente.vendedor.user.nome}</h4>
                    <p className="text-sm text-gray-600">{cliente.vendedor.user.email}</p>
                    {cliente.vendedor.user.telefone && (
                      <p className="text-sm text-gray-500">{cliente.vendedor.user.telefone}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ModernButton
                    variant="outline"
                    size="sm"
                    className="w-full"
                    icon={<Mail className="h-4 w-4" />}
                  >
                    Entrar em Contato
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Ações Rápidas */}
          <ModernCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <ModernButton
                  variant="ghost"
                  onClick={() => window.location.href = '/cliente/produtos'}
                  className="w-full justify-start"
                  icon={<Package className="h-4 w-4" />}
                >
                  Explorar Catálogo
                </ModernButton>
                
                <ModernButton
                  variant="ghost"
                  onClick={() => window.location.href = '/cliente/orcamentos'}
                  className="w-full justify-start"
                  icon={<FileText className="h-4 w-4" />}
                >
                  Meus Orçamentos
                </ModernButton>
                
                <ModernButton
                  variant="ghost"
                  className="w-full justify-start"
                  icon={<Award className="h-4 w-4" />}
                >
                  Histórico de Compras
                </ModernButton>
              </div>
            </div>
          </ModernCard>

          {/* Status da Conta */}
          <ModernCard className={`p-6 text-white ${cliente.ativo ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white bg-opacity-20">
                {cliente.ativo ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Status da Conta</h3>
                <p className="text-sm opacity-90">
                  {cliente.ativo ? 'Conta ativa e funcionando' : 'Conta requer atenção'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm opacity-75">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold">{cliente.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span className="font-semibold">{cliente.cnpj ? 'Pessoa Jurídica' : 'Pessoa Física'}</span>
              </div>
              <div className="flex justify-between">
                <span>Último acesso:</span>
                <span className="font-semibold">Hoje</span>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Formulário de Edição */}
      {showEditForm && cliente && (
        <PerfilForm
          initialData={cliente}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}