'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

export default function FixDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFixData = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/fix-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao corrigir dados')
      }

      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const handleFixDataSql = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/fix-data-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao executar SQL')
      }

      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">Corrigir Dados do Sistema</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Atenção: Correção de Dados
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Este processo irá corrigir problemas de vinculação entre vendedor e empresa.
                Use apenas se estiver enfrentando erros como "Vendedor não está associado a nenhuma empresa".
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Clique no botão abaixo para executar a correção automática dos dados:
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleFixData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Corrigindo dados...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Corrigir Dados
                </>
              )}
            </button>

            <button
              onClick={() => handleFixDataSql()}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Executando SQL...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Correção SQL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Correção Concluída com Sucesso!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {result.message}
                </p>
                
                {result.data && (
                  <div className="mt-3 bg-white rounded border p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Detalhes:</h4>
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Usuário:</dt>
                        <dd className="text-gray-900">{result.data.usuario}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Vendedor ID:</dt>
                        <dd className="text-gray-900">{result.data.vendedorId}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Empresa:</dt>
                        <dd className="text-gray-900">{result.data.empresaNome}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Perfil Cliente:</dt>
                        <dd className="text-gray-900">{result.data.hasCliente ? 'Sim' : 'Não'}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                <p className="text-sm text-green-700 mt-3">
                  ✅ Agora você pode acessar as páginas de Produtos, Orçamentos e Empresas normalmente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Erro na Correção
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          O que esta correção faz:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Vincula o vendedor à primeira empresa cadastrada</li>
          <li>• Garante que o perfil de vendedor existe</li>
          <li>• Cria perfil de cliente se necessário</li>
          <li>• Configura comissão e meta padrão</li>
        </ul>
      </div>
    </div>
  )
}
