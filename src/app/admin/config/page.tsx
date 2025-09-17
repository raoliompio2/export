'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  Loader2,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
  Globe,
  Upload,
  Image as ImageIcon
} from 'lucide-react'

interface ConfigData {
  sistema: {
    nomeAplicacao: string
    versao: string
    manutencao: boolean
    registrosAbertos: boolean
  }
  email: {
    smtp: {
      host: string
      port: number
      user: string
      secure: boolean
    }
    from: {
      name: string
      email: string
    }
  }
  notificacoes: {
    emailNovoOrcamento: boolean
    emailStatusAlterado: boolean
    emailNovoCliente: boolean
  }
  seguranca: {
    tentativasLogin: number
    tempoSessao: number
    backupAutomatico: boolean
  }
  interface: {
    tema: string
    logo: string
    favicon: string
    corPrimaria: string
    corSecundaria: string
  }
}

export default function AdminConfig() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('sistema')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const tabs = [
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'interface', label: 'Interface', icon: Palette }
  ]

  useEffect(() => {
    // Simulando carregamento de configurações
    setTimeout(() => {
      setConfig({
        sistema: {
          nomeAplicacao: 'Painel de Exportação',
          versao: '1.0.0',
          manutencao: false,
          registrosAbertos: true
        },
        email: {
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            user: 'sistema@exportrep.com.br',
            secure: true
          },
          from: {
            name: 'Sistema Export Rep',
            email: 'noreply@exportrep.com.br'
          }
        },
        notificacoes: {
          emailNovoOrcamento: true,
          emailStatusAlterado: true,
          emailNovoCliente: false
        },
        seguranca: {
          tentativasLogin: 5,
          tempoSessao: 8,
          backupAutomatico: true
        },
        interface: {
          tema: 'claro',
          logo: '/logo.png',
          favicon: '/favicon.ico',
          corPrimaria: '#3B82F6',
          corSecundaria: '#10B981'
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' })
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (section: keyof ConfigData, field: string, value: any) => {
    if (!config) return
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
  }

  const updateNestedConfig = (section: keyof ConfigData, nested: string, field: string, value: any) => {
    if (!config) return
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [nested]: {
          ...(prev![section] as any)[nested],
          [field]: value
        }
      }
    }))
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Salvando...' : 'Salvar Tudo'}
        </button>
      </div>

      <p className="text-gray-600">Configure as opções gerais do sistema.</p>

      {/* Mensagem */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Sistema */}
          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Aplicação
                  </label>
                  <input
                    type="text"
                    value={config.sistema.nomeAplicacao}
                    onChange={(e) => updateConfig('sistema', 'nomeAplicacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versão
                  </label>
                  <input
                    type="text"
                    value={config.sistema.versao}
                    onChange={(e) => updateConfig('sistema', 'versao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Modo de Manutenção</label>
                    <p className="text-sm text-gray-500">Impede acesso de usuários ao sistema</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.sistema.manutencao}
                      onChange={(e) => updateConfig('sistema', 'manutencao', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Permitir Novos Registros</label>
                    <p className="text-sm text-gray-500">Permite criação de novas contas de usuário</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.sistema.registrosAbertos}
                      onChange={(e) => updateConfig('sistema', 'registrosAbertos', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab E-mail */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações de E-mail</h3>
              
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Servidor SMTP</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servidor
                    </label>
                    <input
                      type="text"
                      value={config.email.smtp.host}
                      onChange={(e) => updateNestedConfig('email', 'smtp', 'host', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porta
                    </label>
                    <input
                      type="number"
                      value={config.email.smtp.port}
                      onChange={(e) => updateNestedConfig('email', 'smtp', 'port', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário
                    </label>
                    <input
                      type="email"
                      value={config.email.smtp.user}
                      onChange={(e) => updateNestedConfig('email', 'smtp', 'user', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <div>
                      <label className="text-sm font-medium text-gray-700">SSL/TLS</label>
                      <p className="text-sm text-gray-500">Usar conexão segura</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={config.email.smtp.secure}
                        onChange={(e) => updateNestedConfig('email', 'smtp', 'secure', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Remetente Padrão</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={config.email.from.name}
                      onChange={(e) => updateNestedConfig('email', 'from', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={config.email.from.email}
                      onChange={(e) => updateNestedConfig('email', 'from', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Notificações */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações de Notificações</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">E-mail para Novos Orçamentos</label>
                    <p className="text-sm text-gray-500">Notificar por e-mail quando um novo orçamento for criado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notificacoes.emailNovoOrcamento}
                      onChange={(e) => updateConfig('notificacoes', 'emailNovoOrcamento', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">E-mail para Mudança de Status</label>
                    <p className="text-sm text-gray-500">Notificar quando status de orçamento for alterado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notificacoes.emailStatusAlterado}
                      onChange={(e) => updateConfig('notificacoes', 'emailStatusAlterado', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">E-mail para Novos Clientes</label>
                    <p className="text-sm text-gray-500">Notificar quando um novo cliente for cadastrado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notificacoes.emailNovoCliente}
                      onChange={(e) => updateConfig('notificacoes', 'emailNovoCliente', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab Segurança */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações de Segurança</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tentativas de Login
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.seguranca.tentativasLogin}
                    onChange={(e) => updateConfig('seguranca', 'tentativasLogin', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Máximo de tentativas antes de bloquear</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo de Sessão (horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={config.seguranca.tempoSessao}
                    onChange={(e) => updateConfig('seguranca', 'tempoSessao', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Tempo antes do logout automático</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Backup Automático</label>
                  <p className="text-sm text-gray-500">Fazer backup diário dos dados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.seguranca.backupAutomatico}
                    onChange={(e) => updateConfig('seguranca', 'backupAutomatico', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Tab Interface */}
          {activeTab === 'interface' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações de Interface</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <select
                    value={config.interface.tema}
                    onChange={(e) => updateConfig('interface', 'tema', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                    <option value="automatico">Automático</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={config.interface.corPrimaria}
                    onChange={(e) => updateConfig('interface', 'corPrimaria', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Secundária
                  </label>
                  <input
                    type="color"
                    value={config.interface.corSecundaria}
                    onChange={(e) => updateConfig('interface', 'corSecundaria', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={config.interface.logo}
                      onChange={(e) => updateConfig('interface', 'logo', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="URL da logo"
                    />
                    <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Preview</h4>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: config.interface.corPrimaria }}
                  ></div>
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: config.interface.corSecundaria }}
                  ></div>
                  <span className="text-sm text-gray-600">Cores selecionadas</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
