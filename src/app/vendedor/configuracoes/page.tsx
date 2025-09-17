'use client'

import { useState } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  TrendingUp, 
  Palette, 
  Lock,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Globe,
  Smartphone,
  MessageSquare,
  Volume2,
  VolumeX,
  Monitor,
  Sun,
  Moon,
  CheckCircle
} from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard, { StatsCard } from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'

export default function VendedorConfiguracoes() {
  const [activeTab, setActiveTab] = useState('perfil')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()

  // Estados das configurações
  const [perfilConfig, setPerfilConfig] = useState({
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    telefone: '(11) 99999-9999',
    bio: 'Vendedor especializado em equipamentos industriais'
  })

  const [notificacoes, setNotificacoes] = useState({
    emailNovoOrcamento: true,
    emailClienteAprovacao: true,
    pushNovoCliente: true,
    pushMeta: false,
    smsUrgente: true,
    whatsappFollow: false
  })

  const [seguranca, setSeguranca] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
    autenticacaoDupla: false,
    sessoes: []
  })

  const [vendas, setVendas] = useState({
    meta: 50000,
    comissao: 5.5,
    automatizarFollow: true,
    lembretesVencimento: true,
    integracaoWhatsapp: false
  })

  const [interface_, setInterface] = useState({
    tema: 'light',
    idioma: 'pt-BR',
    densidade: 'confortavel',
    sidebar: 'expandida'
  })

  const handleSave = async (secao: string) => {
    setSaving(true)
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Configurações salvas!', `${secao} atualizado com sucesso`)
    } catch (err) {
      error('Erro ao salvar', 'Tente novamente')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <User className="h-4 w-4" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="h-4 w-4" /> },
    { id: 'seguranca', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
    { id: 'vendas', label: 'Vendas', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'interface', label: 'Interface', icon: <Palette className="h-4 w-4" /> },
    { id: 'privacidade', label: 'Privacidade', icon: <Lock className="h-4 w-4" /> }
  ]

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-emerald-600" />
          Configurações
        </h1>
        <p className="text-gray-600 mt-2">
          Personalize sua experiência e configure suas preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar de Navegação */}
        <div className="lg:col-span-1">
          <ModernCard className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </ModernCard>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Informações do Perfil</h3>
                    <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={perfilConfig.nome}
                      onChange={(e) => setPerfilConfig({...perfilConfig, nome: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={perfilConfig.email}
                        onChange={(e) => setPerfilConfig({...perfilConfig, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        value={perfilConfig.telefone}
                        onChange={(e) => setPerfilConfig({...perfilConfig, telefone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio Profissional</label>
                  <textarea
                    value={perfilConfig.bio}
                    onChange={(e) => setPerfilConfig({...perfilConfig, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    placeholder="Descreva sua experiência e especialidades..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <ModernButton
                    onClick={() => handleSave('Perfil')}
                    loading={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Salvar Alterações
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Notificações */}
          {activeTab === 'notificacoes' && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                    <p className="text-sm text-gray-600">Configure como e quando receber alertas</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Email */}
                <div>
                  <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-4">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Notificações por Email
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNovoOrcamento', label: 'Novo orçamento solicitado', desc: 'Cliente solicita novo orçamento' },
                      { key: 'emailClienteAprovacao', label: 'Cliente aprova/rejeita orçamento', desc: 'Resposta do cliente sobre proposta' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificacoes[item.key as keyof typeof notificacoes]}
                            onChange={(e) => setNotificacoes({...notificacoes, [item.key]: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Push */}
                <div>
                  <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-4">
                    <Smartphone className="h-4 w-4 text-green-500" />
                    Notificações Push
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'pushNovoCliente', label: 'Novo cliente cadastrado', desc: 'Cliente se registra na plataforma' },
                      { key: 'pushMeta', label: 'Progresso de metas', desc: 'Alertas sobre cumprimento de metas' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificacoes[item.key as keyof typeof notificacoes]}
                            onChange={(e) => setNotificacoes({...notificacoes, [item.key]: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <ModernButton
                    onClick={() => handleSave('Notificações')}
                    loading={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Salvar Preferências
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Segurança */}
          {activeTab === 'seguranca' && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Segurança da Conta</h3>
                    <p className="text-sm text-gray-600">Proteja sua conta com configurações de segurança</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Alterar Senha */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Alterar Senha</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={seguranca.senhaAtual}
                          onChange={(e) => setSeguranca({...seguranca, senhaAtual: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                        <input
                          type="password"
                          value={seguranca.novaSenha}
                          onChange={(e) => setSeguranca({...seguranca, novaSenha: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          value={seguranca.confirmarSenha}
                          onChange={(e) => setSeguranca({...seguranca, confirmarSenha: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Autenticação em Duas Etapas */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Autenticação em Duas Etapas</h4>
                      <p className="text-sm text-gray-600 mt-1">Adicione uma camada extra de segurança</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seguranca.autenticacaoDupla}
                        onChange={(e) => setSeguranca({...seguranca, autenticacaoDupla: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <ModernButton
                    onClick={() => handleSave('Segurança')}
                    loading={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Atualizar Segurança
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Interface */}
          {activeTab === 'interface' && (
            <ModernCard>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Personalização da Interface</h3>
                    <p className="text-sm text-gray-600">Customize a aparência do sistema</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Tema */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Tema</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Claro', icon: <Sun className="h-5 w-5" />, desc: 'Interface clara' },
                      { id: 'dark', label: 'Escuro', icon: <Moon className="h-5 w-5" />, desc: 'Interface escura' },
                      { id: 'auto', label: 'Automático', icon: <Monitor className="h-5 w-5" />, desc: 'Segue o sistema' }
                    ].map(tema => (
                      <button
                        key={tema.id}
                        onClick={() => setInterface({...interface_, tema: tema.id})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          interface_.tema === tema.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {tema.icon}
                          <span className="font-medium">{tema.label}</span>
                          {interface_.tema === tema.id && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <p className="text-sm text-gray-600">{tema.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Densidade */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Densidade da Interface</h4>
                  <div className="space-y-3">
                    {[
                      { id: 'compacta', label: 'Compacta', desc: 'Mais informações na tela' },
                      { id: 'confortavel', label: 'Confortável', desc: 'Equilíbrio ideal' },
                      { id: 'espaçosa', label: 'Espaçosa', desc: 'Mais espaço entre elementos' }
                    ].map(densidade => (
                      <label key={densidade.id} className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          name="densidade"
                          value={densidade.id}
                          checked={interface_.densidade === densidade.id}
                          onChange={(e) => setInterface({...interface_, densidade: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          interface_.densidade === densidade.id
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-gray-300'
                        }`}>
                          {interface_.densidade === densidade.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{densidade.label}</p>
                          <p className="text-sm text-gray-600">{densidade.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <ModernButton
                    onClick={() => handleSave('Interface')}
                    loading={saving}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Aplicar Mudanças
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Outras abas em desenvolvimento */}
          {['vendas', 'privacidade'].includes(activeTab) && (
            <ModernCard className="p-12 text-center">
              <Settings className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Em Desenvolvimento</h3>
              <p className="text-gray-500">Esta seção será implementada em breve</p>
            </ModernCard>
          )}
        </div>
      </div>
    </div>
  )
}