'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Plus, Trash2, Calculator, User, FileText, Anchor, Package } from 'lucide-react'

const orcamentoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  descricao: z.string().optional(),
  validadeAte: z.string().optional(),
  observacoes: z.string().optional(),
  condicoesPagamento: z.string().optional(),
  prazoEntrega: z.string().optional(),
  frete: z.number().min(0),
  desconto: z.number().min(0),
  
  // Campos de exportação
  incoterm: z.string().optional(),
  portoDestino: z.string().optional(),
  tipoFrete: z.string().optional(),
  diasTransito: z.number().optional(),
  pesoBruto: z.number().optional(),
  volume: z.number().optional(),
  medidas: z.string().optional(),
  numeroCaixas: z.number().optional(),
  freteInternacional: z.number().optional(),
  seguroInternacional: z.number().optional(),
  taxasDesaduanagem: z.number().optional(),
  
  itens: z.array(z.object({
    produtoId: z.string().min(1, 'Produto é obrigatório'),
    quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
    precoUnit: z.number().min(0, 'Preço deve ser positivo'),
    desconto: z.number().min(0).max(100)
  })).min(1, 'Adicione pelo menos um item')
})

interface Cliente {
  id: string
  empresa?: string
  user: {
    nome: string
    email: string
  }
}

interface Produto {
  id: string
  codigo: string
  nome: string
  preco: number | string
  peso?: number | string
  dimensoes?: string
  unidade: string
}

interface OrcamentoItem {
  id?: string
  produtoId: string
  quantidade: number
  precoUnit: number | string
  desconto?: number | string
  total?: number | string
  produto?: Produto
}

interface Orcamento {
  id?: string
  titulo?: string
  clienteId?: string
  descricao?: string
  validadeAte?: string | Date
  observacoes?: string
  condicoesPagamento?: string
  prazoEntrega?: string
  frete?: number | string
  desconto?: number | string
  incoterm?: string
  portoDestino?: string
  tipoFrete?: string
  diasTransito?: number
  pesoBruto?: number
  volume?: number
  medidas?: string
  numeroCaixas?: number
  freteInternacional?: number
  seguroInternacional?: number
  taxasDesaduanagem?: number
  itens?: OrcamentoItem[]
}

interface OrcamentoFormProps {
  orcamento?: Orcamento
  onClose: () => void
  onSuccess: () => void
}

export default function OrcamentoForm({ orcamento, onClose, onSuccess }: OrcamentoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingData, setLoadingData] = useState(true)

  type OrcamentoFormData = z.infer<typeof orcamentoSchema>
  
  const form = useForm<OrcamentoFormData>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      titulo: orcamento?.titulo || '',
      clienteId: orcamento?.clienteId || '',
      descricao: orcamento?.descricao || '',
      validadeAte: orcamento?.validadeAte ? new Date(orcamento.validadeAte).toISOString().split('T')[0] : '',
      observacoes: orcamento?.observacoes || '',
      condicoesPagamento: orcamento?.condicoesPagamento || '',
      prazoEntrega: orcamento?.prazoEntrega || '',
      frete: orcamento?.frete ? parseFloat(String(orcamento.frete)) : 0,
      desconto: orcamento?.desconto ? parseFloat(String(orcamento.desconto)) : 0,
      
      // Valores padrão para campos de exportação
      incoterm: orcamento?.incoterm || 'CIF',
      portoDestino: orcamento?.portoDestino || 'Cartagena',
      tipoFrete: orcamento?.tipoFrete || 'Marítimo + Terrestre',
      diasTransito: orcamento?.diasTransito || 13,
      pesoBruto: orcamento?.pesoBruto || 0,
      volume: orcamento?.volume || 0,
      medidas: orcamento?.medidas || '',
      numeroCaixas: orcamento?.numeroCaixas || 1,
      freteInternacional: orcamento?.freteInternacional || 0,
      seguroInternacional: orcamento?.seguroInternacional || 0,
      taxasDesaduanagem: orcamento?.taxasDesaduanagem || 0,
      
      itens: orcamento?.itens?.map((item: OrcamentoItem) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnit: parseFloat(String(item.precoUnit)),
        desconto: parseFloat(String(item.desconto || 0))
      })) || [{ produtoId: '', quantidade: 1, precoUnit: 0, desconto: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens'
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientesRes, produtosRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/produtos')
        ])

        const [clientesData, produtosData] = await Promise.all([
          clientesRes.json(),
          produtosRes.json()
        ])

        setClientes(clientesData)
        setProdutos(produtosData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const watchItens = form.watch('itens')
  const watchFrete = form.watch('frete')
  const watchDesconto = form.watch('desconto')

  // Calcular totais
  const subtotal = watchItens.reduce((sum, item) => {
    if (!item.produtoId || !item.quantidade || !item.precoUnit) return sum
    const itemTotal = item.quantidade * item.precoUnit * (1 - item.desconto / 100)
    return sum + itemTotal
  }, 0)

  // Calcular peso e volume automaticamente
  const { pesoTotal, volumeTotal } = watchItens.reduce((acc, item) => {
    if (!item.produtoId || !item.quantidade) return acc
    
    const produto = produtos.find(p => p.id === item.produtoId)
    if (!produto) return acc
    
    const pesoProduto = produto.peso ? parseFloat(produto.peso) : 0
    const dimensoesProduto = produto.dimensoes || ''
    
    // Calcular volume a partir das dimensões (formato: "1.2x0.8x0.5")
    let volumeProduto = 0
    if (dimensoesProduto) {
      const dimensoes = dimensoesProduto.split('x').map((d: string) => parseFloat(d.trim()))
      if (dimensoes.length === 3 && dimensoes.every((d: number) => !isNaN(d))) {
        volumeProduto = dimensoes[0] * dimensoes[1] * dimensoes[2]
      }
    }
    
    return {
      pesoTotal: acc.pesoTotal + (pesoProduto * item.quantidade),
      volumeTotal: acc.volumeTotal + (volumeProduto * item.quantidade)
    }
  }, { pesoTotal: 0, volumeTotal: 0 })

  // Atualizar automaticamente os campos de peso e volume
  React.useEffect(() => {
    form.setValue('pesoBruto', pesoTotal)
    form.setValue('volume', volumeTotal)
  }, [pesoTotal, volumeTotal, form])

  const total = subtotal - (watchDesconto || 0) + (watchFrete || 0)

  const onSubmit = async (values: OrcamentoFormData) => {
    setIsSubmitting(true)
    try {
      const url = orcamento ? `/api/orcamentos/${orcamento.id}` : '/api/orcamentos'
      const method = orcamento ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar orçamento')
      }

      onSuccess()
    } catch (error: unknown) {
      console.error('Erro ao salvar orçamento:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar orçamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = () => {
    append({ produtoId: '', quantidade: 1, precoUnit: 0, desconto: 0 })
  }

  const updatePrecoFromProduto = (index: number, produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId)
    if (produto) {
      form.setValue(`itens.${index}.precoUnit`, parseFloat(produto.preco))
    }
  }

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados do Orçamento
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    {...form.register('titulo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Título do orçamento"
                  />
                  {form.formState.errors.titulo && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.titulo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    {...form.register('clienteId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.user.nome} {cliente.empresa && `- ${cliente.empresa}`}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.clienteId && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.clienteId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validade
                  </label>
                  <input
                    type="date"
                    {...form.register('validadeAte')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    {...form.register('descricao')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descrição do orçamento"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Informações Adicionais
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condições de Pagamento
                  </label>
                  <input
                    type="text"
                    {...form.register('condicoesPagamento')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: À vista, 30 dias, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prazo de Entrega
                  </label>
                  <input
                    type="text"
                    {...form.register('prazoEntrega')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 15 dias úteis"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register('desconto', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frete (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register('frete', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    {...form.register('observacoes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Observações gerais"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campos de Exportação */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Anchor className="h-5 w-5" />
              Informações de Exportação
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incoterm
                </label>
                <select
                  {...form.register('incoterm')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="CIF">CIF - Cost, Insurance and Freight</option>
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="FCA">FCA - Free Carrier</option>
                  <option value="CPT">CPT - Carriage Paid To</option>
                  <option value="DAP">DAP - Delivered at Place</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porto de Destino
                </label>
                <input
                  type="text"
                  {...form.register('portoDestino')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Cartagena, Buenos Aires"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Frete
                </label>
                <select
                  {...form.register('tipoFrete')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Marítimo">Marítimo</option>
                  <option value="Aéreo">Aéreo</option>
                  <option value="Rodoviário">Rodoviário</option>
                  <option value="Marítimo + Terrestre">Marítimo + Terrestre</option>
                  <option value="Aéreo + Terrestre">Aéreo + Terrestre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias de Trânsito
                </label>
                <input
                  type="number"
                  min="1"
                  {...form.register('diasTransito', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 13"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Bruto (kg) - <span className="text-green-600 text-xs">Calculado automaticamente</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pesoTotal.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="Calculado dos produtos..."
                />
                <input type="hidden" {...form.register('pesoBruto', { valueAsNumber: true })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (m³) - <span className="text-green-600 text-xs">Calculado automaticamente</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={volumeTotal.toFixed(3)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="Calculado dos produtos..."
                />
                <input type="hidden" {...form.register('volume', { valueAsNumber: true })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medidas (A x L x C)
                </label>
                <input
                  type="text"
                  {...form.register('medidas')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 1.20 x 1.00 x 0.80 m"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Caixas
                </label>
                <input
                  type="number"
                  min="1"
                  {...form.register('numeroCaixas', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frete Internacional (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('freteInternacional', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 132.48"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguro Internacional (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('seguroInternacional', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 53.52"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxas/Desaduanagem (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('taxasDesaduanagem', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 1755.45"
                />
              </div>
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Itens do Orçamento</h4>
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produto *
                      </label>
                      <select
                        {...form.register(`itens.${index}.produtoId`)}
                        onChange={(e) => {
                          form.setValue(`itens.${index}.produtoId`, e.target.value)
                          updatePrecoFromProduto(index, e.target.value)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecione um produto</option>
                        {produtos.map(produto => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} ({produto.codigo})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qtd *
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...form.register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço Unit. *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`itens.${index}.precoUnit`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desc. (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        {...form.register(`itens.${index}.desconto`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
                        R$ {((watchItens[index]?.quantidade || 0) * (watchItens[index]?.precoUnit || 0) * (1 - (watchItens[index]?.desconto || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="w-full p-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {form.formState.errors.itens && (
              <p className="text-red-500 text-sm mt-2">{form.formState.errors.itens.message}</p>
            )}
          </div>

          {/* Resumo de Valores */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Resumo de Valores</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Desconto:</span>
                <span>- R$ {(watchDesconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frete:</span>
                <span>+ R$ {(watchFrete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {orcamento ? 'Salvar Alterações' : 'Criar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
