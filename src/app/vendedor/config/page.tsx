import { Settings, Bell, Shield, Palette, Globe, Save, User, Lock } from 'lucide-react'

export default function VendedorConfig() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-500" />
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      <p className="text-gray-600">Personalize suas preferências e configurações do sistema.</p>

      {/* Grid de Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Perfil */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Perfil</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Foto do Perfil</label>
                <p className="text-sm text-gray-500">Atualize sua foto de perfil</p>
              </div>
              <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Alterar
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Informações Pessoais</label>
                <p className="text-sm text-gray-500">Nome, email, telefone</p>
              </div>
              <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Editar
              </button>
            </div>
          </div>
        </div>

        {/* Configurações de Notificação */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Notificações</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email</label>
                <p className="text-sm text-gray-500">Novos orçamentos e atualizações</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">WhatsApp</label>
                <p className="text-sm text-gray-500">Mensagens de clientes</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Relatórios Semanais</label>
                <p className="text-sm text-gray-500">Resumo de performance</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Configurações de Segurança */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Segurança</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</label>
                <p className="text-sm text-gray-500">Proteja sua conta com 2FA</p>
              </div>
              <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
                Ativado
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Sessões Ativas</label>
                <p className="text-sm text-gray-500">Gerencie dispositivos conectados</p>
              </div>
              <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Ver
              </button>
            </div>
          </div>
        </div>

        {/* Configurações de Vendas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Vendas</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Meta Mensal</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">R$</span>
                <input
                  type="number"
                  placeholder="10000"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Comissão (%)</label>
              <input
                type="number"
                placeholder="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Assinatura Automática</label>
                <p className="text-sm text-gray-500">Incluir assinatura nos orçamentos</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              </label>
            </div>
          </div>
        </div>

        {/* Configurações de Interface */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Interface</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Tema</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Idioma</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Fuso Horário</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configurações de Privacidade */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Privacidade</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Perfil Público</label>
                <p className="text-sm text-gray-500">Outros vendedores podem ver seu perfil</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Compartilhar Estatísticas</label>
                <p className="text-sm text-gray-500">Permitir comparação de performance</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Analytics</label>
                <p className="text-sm text-gray-500">Coleta de dados de uso</p>
              </div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Save className="h-5 w-5" />
          Salvar Configurações
        </button>
      </div>
    </div>
  )
}
