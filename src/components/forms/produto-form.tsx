'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2, Upload } from 'lucide-react'

const produtoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  empresaId: z.string().optional(), // Para admin
  preco: z.number().min(0, 'Preço deve ser positivo'),
  precoPromocional: z.number().min(0).optional().or(z.literal('')),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  estoque: z.number().int().min(0),
  estoqueMinimo: z.number().int().min(0),
  peso: z.number().min(0).optional().or(z.literal('')),
  dimensoes: z.string().optional(),
  imagemUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['ATIVO', 'INATIVO', 'DESCONTINUADO']),
  destaque: z.boolean(),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

interface Categoria {
  id: string
  nome: string
  descricao?: string
  ativa: boolean
}

interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  ativa: boolean
}

interface Produto {
  id?: string
  codigo?: string
  nome?: string
  descricao?: string
  categoria?: {
    id: string
    nome: string
  }
  categoriaId?: string
  empresa?: {
    id: string
    nome: string
  }
  empresaId?: string
  preco?: number | string
  precoPromocional?: number | string
  unidade?: string
  estoque?: number
  estoqueMinimo?: number
  peso?: number | string
  dimensoes?: string
  imagens?: string[]
  status?: string
  destaque?: boolean
}

interface ProdutoFormProps {
  produto?: Produto
  onClose: () => void
  onSuccess: () => void
}

export default function ProdutoForm({ produto, onClose, onSuccess }: ProdutoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      codigo: produto?.codigo || '',
      nome: produto?.nome || '',
      descricao: produto?.descricao || '',
      categoriaId: produto?.categoria?.id || produto?.categoriaId || '',
      empresaId: produto?.empresa?.id || produto?.empresaId || '',
      preco: produto?.preco ? Number(produto.preco) : 0,
      precoPromocional: produto?.precoPromocional ? Number(produto.precoPromocional) : '',
      unidade: produto?.unidade || 'UN',
      estoque: produto?.estoque || 0,
      estoqueMinimo: produto?.estoqueMinimo || 0,
      peso: produto?.peso ? Number(produto.peso) : '',
      dimensoes: produto?.dimensoes || '',
      imagemUrl: produto?.imagens?.[0] || '',
      status: produto?.status || 'ATIVO',
      destaque: produto?.destaque || false,
    },
  })

  // Resetar valores quando produto mudar
  useEffect(() => {
    if (produto) {
      form.reset({
        codigo: produto.codigo || '',
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        categoriaId: produto.categoria?.id || produto.categoriaId || '',
        empresaId: produto.empresa?.id || produto.empresaId || '',
        preco: produto.preco ? Number(produto.preco) : 0,
        precoPromocional: produto.precoPromocional ? Number(produto.precoPromocional) : '',
        unidade: produto.unidade || 'UN',
        estoque: produto.estoque || 0,
        estoqueMinimo: produto.estoqueMinimo || 0,
        peso: produto.peso ? Number(produto.peso) : '',
        dimensoes: produto.dimensoes || '',
        imagemUrl: produto.imagens?.[0] || '',
        status: produto.status || 'ATIVO',
        destaque: produto.destaque || false,
      })
    }
  }, [produto, form])

  useEffect(() => {
    fetchCategorias()
    fetchEmpresas()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const user = await response.json()
        setUserRole(user.role)
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    }
  }

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas')
      if (response.ok) {
        const data = await response.json()
        setEmpresas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoadingCategorias(false)
    }
  }

  const onSubmit = async (data: ProdutoFormData) => {
    console.log('🔧 PRODUTO FORM - Dados a serem enviados:', JSON.stringify(data, null, 2))
    setIsSubmitting(true)
    try {
      // Limpar valores vazios
      const cleanData = {
        ...data,
        precoPromocional: data.precoPromocional === '' ? undefined : Number(data.precoPromocional),
        peso: data.peso === '' ? undefined : Number(data.peso),
        dimensoes: data.dimensoes || undefined,
        descricao: data.descricao || undefined,
        imagens: data.imagemUrl ? [data.imagemUrl] : [],
      }
      
      // Remove imagemUrl do payload pois não existe no schema do banco
      delete cleanData.imagemUrl

      const url = produto ? `/api/produtos/${produto.id}` : '/api/produtos'
      const method = produto ? 'PUT' : 'POST'

      console.log(`🚀 Fazendo ${method} para ${url}`)
      console.log('📦 Payload:', JSON.stringify(cleanData, null, 2))

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      })

      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar produto')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar produto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {produto ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    {...form.register('codigo')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: PROD001"
                  />
                  {form.formState.errors.codigo && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.codigo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    {...form.register('nome')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do produto"
                  />
                  {form.formState.errors.nome && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    {...form.register('categoriaId')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingCategorias}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.categoriaId && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.categoriaId.message}</p>
                  )}
                </div>

                {(userRole === 'ADMIN' || userRole === 'VENDEDOR') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa *
                    </label>
                    <select
                      {...form.register('empresaId')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={userRole === 'VENDEDOR' && empresas.length <= 1}
                    >
                      <option value="">Selecione uma empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nome}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.empresaId && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.empresaId.message}</p>
                    )}
                    {userRole === 'VENDEDOR' && empresas.length <= 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Produto será associado à sua empresa automaticamente
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...form.register('preco', { valueAsNumber: true })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    {form.formState.errors.preco && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.preco.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço Promocional
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...form.register('precoPromocional', { 
                        setValueAs: (value) => value === '' ? '' : parseFloat(value) 
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    {...form.register('descricao')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição do produto"
                  />
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidade *
                    </label>
                    <select
                      {...form.register('unidade')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UN">Unidade</option>
                      <option value="KG">Quilograma</option>
                      <option value="MT">Metro</option>
                      <option value="M2">Metro²</option>
                      <option value="M3">Metro³</option>
                      <option value="LT">Litro</option>
                      <option value="CX">Caixa</option>
                      <option value="PC">Peça</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      {...form.register('status')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                      <option value="DESCONTINUADO">Descontinuado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      {...form.register('estoque', { valueAsNumber: true })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      {...form.register('estoqueMinimo', { valueAsNumber: true })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    {...form.register('peso', { 
                      setValueAs: (value) => value === '' ? '' : parseFloat(value) 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensões
                  </label>
                  <input
                    type="text"
                    {...form.register('dimensoes')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 10x20x30cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    {...form.register('imagemUrl')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {form.formState.errors.imagemUrl && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.imagemUrl.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...form.register('destaque')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Produto em destaque
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}
