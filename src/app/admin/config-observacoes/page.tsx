'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, ArrowLeft, Building2 } from 'lucide-react'

interface Empresa {
  id: string
  nome: string
  observacaoDesaduanagem?: string
  observacaoMercosul?: string
  observacaoValidade?: string
}

export default function ConfigObservacoesPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>('')
  const [observacoes, setObservacoes] = useState({
    observacaoDesaduanagem: '',
    observacaoMercosul: '',
    observacaoValidade: ''
  })
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  // Carregar empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/empresas')
        if (response.ok) {
          const data = await response.json()
          setEmpresas(data)
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
        alert('Erro ao carregar empresas')
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresas()
  }, [])

  // Carregar observações da empresa selecionada
  useEffect(() => {
    if (empresaSelecionada) {
      const empresa = empresas.find(e => e.id === empresaSelecionada)
      if (empresa) {
        setObservacoes({
          observacaoDesaduanagem: empresa.observacaoDesaduanagem || '',
          observacaoMercosul: empresa.observacaoMercosul || '',
          observacaoValidade: empresa.observacaoValidade || ''
        })
      }
    }
  }, [empresaSelecionada, empresas])

  const handleSalvar = async () => {
    if (!empresaSelecionada) {
      alert('Selecione uma empresa')
      return
    }

    setSalvando(true)
    try {
      const response = await fetch(`/api/admin/empresas/${empresaSelecionada}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observacoes)
      })

      if (response.ok) {
        alert('Observações atualizadas com sucesso!')
        
        // Atualizar lista local
        setEmpresas(prev => 
          prev.map(empresa => 
            empresa.id === empresaSelecionada 
              ? { ...empresa, ...observacoes }
              : empresa
          )
        )
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar observações:', error)
      alert('Erro ao salvar observações')
    } finally {
      setSalvando(false)
    }
  }

  const textosPadrao = {
    observacaoDesaduanagem: 'A [EMPRESA] NÃO é responsável pelo desembaraço aduaneiro. O cliente deve realizar o desembaraço e retirar a carga no porto de destino.',
    observacaoMercosul: 'Produtos nacionais podem ter benefícios fiscais no Mercosul.',
    observacaoValidade: 'Este é um orçamento. Preços válidos até a data especificada.'
  }

  const restaurarPadrao = (campo: keyof typeof observacoes) => {
    setObservacoes(prev => ({
      ...prev,
      [campo]: textosPadrao[campo]
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="h-4 w-px bg-gray-300"></div>
          <button
            onClick={() => window.location.href = '/admin/empresas'}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Ir para Empresas
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Configuração de Observações</h1>
        <p className="text-gray-600 mt-2">
          Configure as observações que aparecerão nos orçamentos de exportação de cada empresa.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Observações Personalizáveis</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Seletor de Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select 
              value={empresaSelecionada} 
              onChange={(e) => setEmpresaSelecionada(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>
          </div>

          {empresaSelecionada && (
            <>
              {/* Observação de Desaduanagem */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Observação sobre Desembaraço Aduaneiro
                  </label>
                  <button
                    type="button"
                    onClick={() => restaurarPadrao('observacaoDesaduanagem')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Restaurar Padrão
                  </button>
                </div>
                <textarea
                  value={observacoes.observacaoDesaduanagem}
                  onChange={(e) => setObservacoes(prev => ({
                    ...prev,
                    observacaoDesaduanagem: e.target.value
                  }))}
                  rows={3}
                  placeholder="Digite a observação sobre desembaraço aduaneiro..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Observação Mercosul */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Observação sobre Mercosul
                  </label>
                  <button
                    type="button"
                    onClick={() => restaurarPadrao('observacaoMercosul')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Restaurar Padrão
                  </button>
                </div>
                <textarea
                  value={observacoes.observacaoMercosul}
                  onChange={(e) => setObservacoes(prev => ({
                    ...prev,
                    observacaoMercosul: e.target.value
                  }))}
                  rows={2}
                  placeholder="Digite a observação sobre Mercosul..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Observação Validade */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Observação sobre Validade
                  </label>
                  <button
                    type="button"
                    onClick={() => restaurarPadrao('observacaoValidade')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Restaurar Padrão
                  </button>
                </div>
                <textarea
                  value={observacoes.observacaoValidade}
                  onChange={(e) => setObservacoes(prev => ({
                    ...prev,
                    observacaoValidade: e.target.value
                  }))}
                  rows={2}
                  placeholder="Digite a observação sobre validade..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {salvando ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-white shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Informações</h2>
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Essas observações aparecerão nos orçamentos de exportação públicos.</p>
            <p>• Você pode usar <code>[EMPRESA]</code> como placeholder que será substituído pelo nome da empresa.</p>
            <p>• Se deixar em branco, será usado o texto padrão do sistema.</p>
            <p>• As alterações são aplicadas imediatamente a todos os orçamentos futuros.</p>
          </div>
        </div>
      </div>
    </div>
  )
}