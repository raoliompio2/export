'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react'

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const testAPIs = async () => {
    setLoading(true)
    setResults([])

    const tests = [
      { name: 'Auth Me', url: '/api/auth/me' },
      { name: 'Empresas', url: '/api/empresas' },
      { name: 'Produtos', url: '/api/produtos' },
      { name: 'Orçamentos', url: '/api/orcamentos' },
    ]

    for (const test of tests) {
      try {
        const response = await fetch(test.url)
        const data = await response.json()
        
        setResults(prev => [...prev, {
          name: test.name,
          url: test.url,
          status: response.status,
          success: response.ok,
          data: data,
          error: response.ok ? null : data.error || 'Erro desconhecido'
        }])
      } catch (error: any) {
        setResults(prev => [...prev, {
          name: test.name,
          url: test.url,
          status: 'NETWORK_ERROR',
          success: false,
          data: null,
          error: error.message
        }])
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Debug APIs</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Esta página testa todas as APIs e mostra exatamente onde está o problema.
        </p>

        <button
          onClick={testAPIs}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Testando APIs...
            </>
          ) : (
            <>
              <Info className="h-5 w-5" />
              Testar Todas as APIs
            </>
          )}
        </button>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Resultados dos Testes:</h3>
            
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h4 className="font-medium">
                    {result.name} - {result.url}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>

                {result.error && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-800">Erro:</p>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}

                {result.data && (
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Resposta:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Como usar os resultados:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Auth Me</strong> - Mostra dados do usuário logado</li>
            <li>• <strong>Empresas</strong> - Testa acesso à API de empresas</li>
            <li>• <strong>Produtos</strong> - Testa acesso à API de produtos</li>
            <li>• <strong>Orçamentos</strong> - Testa acesso à API de orçamentos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
