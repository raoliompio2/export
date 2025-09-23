'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Package, 
  ArrowRight,
  Building2,
  Calculator,
  FileText,
  Clock,
  CreditCard
} from 'lucide-react'
import Image from 'next/image'
import ModernButton from '@/components/ui/modern-button'
import ModernCard from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import { useRouter } from 'next/navigation'
import { useCarrinho } from '@/hooks/useCarrinho'
import OptimizedCurrencyDisplay from '@/components/ui/optimized-currency-display'

interface CarrinhoItem {
  id: string
  quantidade: number
  observacoes?: string
  produto: {
    id: string
    nome: string
    codigo: string
    preco: number
    precoPromocional?: number
    unidade: string
    imagens: string[]
    categoria: {
      nome: string
    }
    empresa: {
      id: string
      nome: string
    }
  }
}

interface GrupoEmpresa {
  empresa: {
    id: string
    nome: string
  }
  itens: CarrinhoItem[]
  total: number
}

export default function CarrinhoPage() {
  const [updating, setUpdating] = useState<string | null>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [prazoEntrega, setPrazoEntrega] = useState('')
  const [condicoesPagamento, setCondicoesPagamento] = useState('')
  const { success, error } = useToast()
  const router = useRouter()
  const { 
    itens, 
    loading, 
    atualizarQuantidade: atualizarQuantidadeHook, 
    removerItem: removerItemHook, 
    limparCarrinho: limparCarrinhoHook,
    recarregar,
    getQuantidadeOtimistica
  } = useCarrinho()

  // Hook useCarrinho já gerencia o estado do carrinho

  const atualizarQuantidade = async (itemId: string, novaQuantidade: number) => {
    if (novaQuantidade < 1) return

    setUpdating(itemId)
    const sucesso = await atualizarQuantidadeHook(itemId, novaQuantidade)
    
    if (sucesso) {
      success('Quantidade atualizada', '')
    } else {
      error('Erro ao atualizar item', 'Tente novamente')
    }
    setUpdating(null)
  }

  const removerItem = async (itemId: string) => {
    setUpdating(itemId)
    const sucesso = await removerItemHook(itemId)
    
    if (sucesso) {
      success('Item removido', '')
    } else {
      error('Erro ao remover item', 'Tente novamente')
    }
    setUpdating(null)
  }

  const limparCarrinho = async () => {
    const sucesso = await limparCarrinhoHook()
    
    if (sucesso) {
      success('Carrinho limpo', '')
    } else {
      error('Erro ao limpar carrinho', 'Tente novamente')
    }
  }

  const finalizarCarrinho = async () => {
    setFinalizando(true)
    try {
      const response = await fetch('/api/carrinho/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observacoes,
          prazoEntrega,
          condicoesPagamento
        })
      })

      if (!response.ok) throw new Error('Erro ao finalizar carrinho')

      const data = await response.json()
      success('Orçamentos criados!', data.message)
      
      // Recarregar carrinho (vai ficar vazio) e redirecionar
      await recarregar()
      router.push('/cliente/orcamentos')
    } catch (err: unknown) {
      error('Erro ao finalizar carrinho', err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setFinalizando(false)
    }
  }

  // Agrupar itens por empresa
  const gruposPorEmpresa: GrupoEmpresa[] = itens.reduce((acc, item) => {
    const empresaId = item.produto.empresa.id
    let grupo = acc.find(g => g.empresa.id === empresaId)
    
    if (!grupo) {
      grupo = {
        empresa: item.produto.empresa,
        itens: [],
        total: 0
      }
      acc.push(grupo)
    }
    
    grupo.itens.push(item)
    
    const precoUnitario = item.produto.precoPromocional || item.produto.preco
    const quantidadeExibida = getQuantidadeOtimistica(item.id, item.quantidade)
    grupo.total += Number(precoUnitario) * quantidadeExibida
    
    return acc
  }, [] as GrupoEmpresa[])

  const totalGeral = gruposPorEmpresa.reduce((sum, grupo) => sum + grupo.total, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (itens.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            Carrinho de Orçamentos
          </h1>
          <p className="text-gray-600 mt-2">
            Monte seu carrinho e solicite orçamentos de múltiplas empresas
          </p>
        </div>

        <ModernCard className="text-center py-16">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Carrinho vazio
          </h3>
          <p className="text-gray-500 mb-6">
            Adicione produtos ao carrinho para solicitar orçamentos
          </p>
          <ModernButton 
            onClick={() => router.push('/cliente/produtos')}
            icon={<Package className="h-4 w-4" />}
          >
            Ver Produtos
          </ModernButton>
        </ModernCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            Carrinho de Orçamentos
          </h1>
          <p className="text-gray-600 mt-2">
            {itens.length} item(s) de {gruposPorEmpresa.length} empresa(s)
          </p>
        </div>

        <ModernButton
          variant="ghost"
          onClick={limparCarrinho}
          icon={<Trash2 className="h-4 w-4" />}
        >
          Limpar Carrinho
        </ModernButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Itens por Empresa */}
        <div className="lg:col-span-2 space-y-6">
          {gruposPorEmpresa.map((grupo) => (
            <ModernCard key={grupo.empresa.id} className="p-6">
              {/* Header da Empresa */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-lg">
                <Building2 className="h-6 w-6 text-emerald-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{grupo.empresa.nome}</h3>
                  <p className="text-sm text-gray-600">
                    {grupo.itens.length} item(s) - Total: <OptimizedCurrencyDisplay amount={grupo.total} fromCurrency="BRL" toCurrency="USD" />
                  </p>
                </div>
              </div>

              {/* Itens da Empresa */}
              <div className="space-y-4">
                {grupo.itens.map((item) => {
                  const precoUnitario = item.produto.precoPromocional || item.produto.preco
                  const quantidadeExibida = getQuantidadeOtimistica(item.id, item.quantidade)
                  const totalItem = Number(precoUnitario) * quantidadeExibida

                  return (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      {/* Imagem do Produto */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.produto.imagens.length > 0 ? (
                          <Image
                            src={item.produto.imagens[0]}
                            alt={item.produto.nome}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Detalhes do Produto */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{item.produto.nome}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Código: {item.produto.codigo} | {item.produto.categoria.nome}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium text-emerald-600">
                              <OptimizedCurrencyDisplay amount={precoUnitario} fromCurrency="BRL" toCurrency="USD" />
                            </span>
                            <span className="text-gray-500"> / {item.produto.unidade}</span>
                          </div>

                          {/* Controles de Quantidade */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => atualizarQuantidade(item.id, quantidadeExibida - 1)}
                                disabled={updating === item.id || quantidadeExibida <= 1}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className={`px-4 py-2 min-w-[60px] text-center font-medium ${
                                updating === item.id ? 'opacity-50' : ''
                              }`}>
                                {quantidadeExibida}
                              </span>
                              
                              <button
                                onClick={() => atualizarQuantidade(item.id, quantidadeExibida + 1)}
                                disabled={updating === item.id}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removerItem(item.id)}
                              disabled={updating === item.id}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-right">
                          <span className={`font-medium ${updating === item.id ? 'text-gray-500' : 'text-gray-900'}`}>
                            Total: <OptimizedCurrencyDisplay amount={totalItem} fromCurrency="BRL" toCurrency="USD" />
                          </span>
                        </div>

                        {item.observacoes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            {item.observacoes}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ModernCard>
          ))}
        </div>

        {/* Resumo e Finalização */}
        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <ModernCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo do Pedido
            </h3>

            <div className="space-y-3 mb-4">
              {gruposPorEmpresa.map((grupo) => (
                <div key={grupo.empresa.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{grupo.empresa.nome}:</span>
                  <span className="font-medium">
                    <OptimizedCurrencyDisplay amount={grupo.total} fromCurrency="BRL" toCurrency="USD" />
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Geral:</span>
                <span className={`text-xl font-bold ${updating ? 'text-gray-500' : 'text-emerald-600'}`}>
                  <OptimizedCurrencyDisplay amount={totalGeral} fromCurrency="BRL" toCurrency="USD" />
                </span>
              </div>
            </div>
          </ModernCard>

          {/* Informações Adicionais */}
          <ModernCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Orçamento
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Prazo de Entrega Desejado
                </label>
                <input
                  type="text"
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.target.value)}
                  placeholder="Ex: 30 dias"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Condições de Pagamento
                </label>
                <input
                  type="text"
                  value={condicoesPagamento}
                  onChange={(e) => setCondicoesPagamento(e.target.value)}
                  placeholder="Ex: 30/60/90 dias"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Gerais
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre o orçamento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </ModernCard>

          {/* Botão de Finalização */}
          <ModernButton
            onClick={finalizarCarrinho}
            disabled={finalizando}
            loading={finalizando}
            className="w-full"
            icon={<Send className="h-4 w-4" />}
          >
            {finalizando ? 'Criando Orçamentos...' : 'Solicitar Orçamentos'}
          </ModernButton>

          <div className="text-center text-sm text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Será criado 1 orçamento para cada empresa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
