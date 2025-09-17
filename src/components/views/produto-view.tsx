'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  X, 
  Package, 
  Tag, 
  DollarSign, 
  Hash,
  Ruler,
  Weight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Loader2,
  Edit,
  Star,
  BarChart3
} from 'lucide-react'

interface ProdutoViewProps {
  produtoId: string
  onClose: () => void
  onEdit?: () => void
}

export default function ProdutoView({ produtoId, onClose, onEdit }: ProdutoViewProps) {
  const [produto, setProduto] = useState<{
    id: string
    nome: string
    descricao?: string
    codigo: string
    preco: number
    precoPromocional?: number
    unidade: string
    estoque: number
    peso?: number
    dimensoes?: string
    imagens?: string[]
    categoria?: { nome: string }
    empresa?: { nome: string }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`/api/produtos/${produtoId}`)
        if (!response.ok) throw new Error('Erro ao carregar produto')
        
        const data = await response.json()
        setProduto(data)
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduto()
  }, [produtoId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'bg-green-100 text-green-800'
      case 'INATIVO': return 'bg-red-100 text-red-800'
      case 'DESCONTINUADO': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO': return <CheckCircle className="h-4 w-4" />
      case 'INATIVO': return <XCircle className="h-4 w-4" />
      case 'DESCONTINUADO': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getEstoqueStatus = () => {
    if (!produto) return null
    
    if (produto.estoque === 0) {
      return { color: 'text-red-600', icon: <XCircle className="h-4 w-4" />, text: 'Sem estoque' }
    } else if (produto.estoque <= produto.estoqueMinimo) {
      return { color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" />, text: 'Estoque baixo' }
    } else {
      return { color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" />, text: 'Estoque normal' }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Carregando dados do produto...</p>
        </div>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Produto não encontrado</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  const estoqueStatus = getEstoqueStatus()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
              {produto.imagens && produto.imagens.length > 0 ? (
                <Image 
                  src={produto.imagens[0]} 
                  alt={produto.nome}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>
                {produto.destaque && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-purple-600">Código: {produto.codigo}</p>
              <p className="text-sm text-gray-500">
                Cadastrado em {new Date(produto.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(produto.status)}`}>
              {getStatusIcon(produto.status)}
              {produto.status}
            </span>
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Dados Básicos */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                Informações Básicas
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nome do Produto</p>
                  <p className="font-medium text-gray-900">{produto.nome}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="text-gray-900 font-mono">{produto.codigo}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Categoria</p>
                    <p className="text-gray-900">{produto.categoria.nome}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Unidade</p>
                  <p className="text-gray-900">{produto.unidade}</p>
                </div>

                {produto.descricao && (
                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="text-gray-900">{produto.descricao}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preços e Financeiro */}
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Preços e Valores
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Preço Principal</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {parseFloat(produto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500">por {produto.unidade}</p>
                </div>
                
                {produto.precoPromocional && parseFloat(produto.precoPromocional) > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Preço Promocional</p>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-bold text-red-600">
                        R$ {parseFloat(produto.precoPromocional).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        {(((parseFloat(produto.preco) - parseFloat(produto.precoPromocional)) / parseFloat(produto.preco)) * 100).toFixed(0)}% OFF
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-green-200">
                  <p className="text-sm text-gray-600">Preço Final</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {parseFloat(produto.precoPromocional || produto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estoque e Logística */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Controle de Estoque */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Controle de Estoque
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estoque Atual</p>
                    <p className="text-2xl font-bold text-gray-900">{produto.estoque}</p>
                  </div>
                  {estoqueStatus && (
                    <div className={`flex items-center gap-1 ${estoqueStatus.color}`}>
                      {estoqueStatus.icon}
                      <span className="text-sm font-medium">{estoqueStatus.text}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Estoque Mínimo</p>
                  <p className="text-gray-900">{produto.estoqueMinimo}</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      produto.estoque <= produto.estoqueMinimo ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${Math.min((produto.estoque / (produto.estoqueMinimo * 2)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Nível de estoque vs. mínimo recomendado
                </p>
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-yellow-600" />
                Especificações
              </h4>
              <div className="space-y-4">
                {produto.peso && (
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Peso</p>
                      <p className="text-gray-900">{produto.peso} kg</p>
                    </div>
                  </div>
                )}
                
                {produto.dimensoes && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Dimensões</p>
                      <p className="text-gray-900">{produto.dimensoes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Última Atualização</p>
                    <p className="text-gray-900">
                      {new Date(produto.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {produto.destaque && (
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">Produto em Destaque</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Este produto aparece primeiro nas listagens
                    </p>
                  </div>
                )}

                {(!produto.peso && !produto.dimensoes) && (
                  <p className="text-gray-500 italic">Nenhuma especificação técnica cadastrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Imagens do Produto */}
          {produto.imagens && produto.imagens.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                Imagens do Produto ({produto.imagens.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {produto.imagens.map((imagem: string, index: number) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image 
                      src={imagem} 
                      alt={`${produto.nome} - Imagem ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações da Categoria */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-gray-600" />
              Categoria: {produto.categoria.nome}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome da Categoria</p>
                <p className="font-medium text-gray-900">{produto.categoria.nome}</p>
              </div>
              {produto.categoria.descricao && (
                <div>
                  <p className="text-sm text-gray-600">Descrição</p>
                  <p className="text-gray-900">{produto.categoria.descricao}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Status da Categoria</p>
                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  produto.categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {produto.categoria.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
