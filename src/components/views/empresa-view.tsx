'use client'

import { X, Edit, Building2, MapPin, Mail, Phone, Globe, CreditCard, Users, FileText } from 'lucide-react'

interface EmpresaViewModalProps {
  empresa: any
  onClose: () => void
  onEdit: () => void
}

export default function EmpresaViewModal({ empresa, onClose, onEdit }: EmpresaViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalhes da Empresa
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">{empresa.nome}</h4>
              {empresa.nomeFantasia && (
                <p className="text-lg text-gray-600 mt-1">{empresa.nomeFantasia}</p>
              )}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              empresa.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {empresa.ativa ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vendedores</p>
                  <p className="text-2xl font-bold text-gray-900">{empresa._count?.vendedores || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orçamentos</p>
                  <p className="text-2xl font-bold text-gray-900">{empresa._count?.orcamentos || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{empresa._count?.produtos || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Gerais */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                <p className="mt-1 text-sm text-gray-900">{empresa.cnpj}</p>
              </div>
              
              {empresa.inscricaoEstadual && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inscrição Estadual</label>
                  <p className="mt-1 text-sm text-gray-900">{empresa.inscricaoEstadual}</p>
                </div>
              )}

              {empresa.inscricaoMunicipal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inscrição Municipal</label>
                  <p className="mt-1 text-sm text-gray-900">{empresa.inscricaoMunicipal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contato */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-4">Contato</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{empresa.email}</span>
              </div>
              
              {empresa.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{empresa.telefone}</span>
                </div>
              )}

              {empresa.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <a 
                    href={empresa.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {empresa.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-900">
                <p className="font-medium">
                  {empresa.endereco}{empresa.numero && `, ${empresa.numero}`}
                </p>
                {empresa.complemento && (
                  <p>{empresa.complemento}</p>
                )}
                <p>{empresa.bairro} - {empresa.cidade}/{empresa.estado}</p>
                <p>CEP: {empresa.cep}</p>
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          {(empresa.banco || empresa.agencia || empresa.conta) && (
            <div>
              <h5 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {empresa.banco && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banco</label>
                    <p className="mt-1 text-sm text-gray-900">{empresa.banco}</p>
                  </div>
                )}
                
                {empresa.agencia && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agência</label>
                    <p className="mt-1 text-sm text-gray-900">{empresa.agencia}</p>
                  </div>
                )}

                {empresa.conta && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Conta</label>
                    <p className="mt-1 text-sm text-gray-900">{empresa.conta}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configurações Visuais */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-4">Configurações Visuais</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {empresa.logo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img 
                      src={empresa.logo} 
                      alt={`Logo da ${empresa.nome}`}
                      className="max-h-20 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                      }}
                    />
                    <p className="text-sm text-gray-500 hidden">Logo não pôde ser carregada</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg border border-gray-200"
                    style={{ backgroundColor: empresa.corPrimaria }}
                  ></div>
                  <span className="text-sm text-gray-900">{empresa.corPrimaria}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700">Criado em</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(empresa.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Última atualização</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(empresa.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric', 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
