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
  Star,
  BarChart3,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus
} from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import OptimizedCurrencyDisplay from '@/components/ui/optimized-currency-display'
import { useToast } from '@/components/ui/modern-toast'
import { useCarrinho } from '@/hooks/useCarrinho'

interface ClienteProdutoViewProps {
  produtoId: string
  onClose: () => void
}

export default function ClienteProdutoView({ produtoId, onClose }: ClienteProdutoViewProps) {
  const [produto, setProduto] = useState<{
    id: string
    nome: string
    descricao?: string
    codigo: string
    preco: number | string
    precoPromocional?: number | string
    unidade: string
    estoque: number
    estoqueMinimo: number
    peso?: number | string
    dimensoes?: string
    imagens?: string[]
    status: string
    destaque: boolean
    createdAt: string
    updatedAt: string
    categoria?: { 
      nome: string
      descricao?: string
      ativa?: boolean
    }
    empresa?: { nome: string }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [favorito, setFavorito] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const { success, error } = useToast()
  const { adicionarItem } = useCarrinho()

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        console.log('🔍 Buscando produto:', produtoId)
        const response = await fetch(`/api/produtos/public/${produtoId}`)
        console.log('📡 Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Erro na resposta:', errorText)
          throw new Error(`Erro ${response.status}: ${errorText}`)
        }
        
        const data = await response.json()
        console.log('✅ Produto carregado:', data.nome)
        setProduto(data)
      } catch (err: unknown) {
        console.error('❌ Erro ao carregar produto:', err)
        error('Erro ao carregar produto', err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchProduto()
  }, [produtoId, error])

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
      return { color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" />, text: 'Disponível' }
    }
  }

  const adicionarAoCarrinho = async () => {
    if (!produto) return
    
    const sucesso = await adicionarItem(produto.id, quantidade)
    
    if (sucesso) {
      success('Adicionado ao carrinho!', `${produto.nome} foi adicionado ao carrinho`)
    } else {
      error('Erro ao adicionar ao carrinho', 'Tente novamente')
    }
  }

  const toggleFavorito = () => {
    setFavorito(!favorito)
    success(
      favorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos', 
      ''
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: produto?.nome,
        text: produto?.descricao,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      success('Link copiado!', 'URL do produto copiada para área de transferência')
    }
  }

  const ajustarQuantidade = (delta: number) => {
    const novaQuantidade = quantidade + delta
    if (novaQuantidade >= 1 && novaQuantidade <= (produto?.estoque || 0)) {
      setQuantidade(novaQuantidade)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Carregando dados do produto...</p>
        </div>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Produto não encontrado</h3>
          <p className="text-gray-500 mb-4">Não foi possível carregar os dados do produto</p>
          <ModernButton onClick={onClose}>
            Fechar
          </ModernButton>
        </div>
      </div>
    )
  }

  const estoqueStatus = getEstoqueStatus()
  const precoFinal = produto.precoPromocional || produto.preco
  const temDesconto = produto.precoPromocional && parseFloat(String(produto.precoPromocional)) > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-emerald-100 rounded-xl flex items-center justify-center">
              {produto.imagens && produto.imagens.length > 0 ? (
                <Image 
                  src={produto.imagens[0]} 
                  alt={produto.nome}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Package className="h-8 w-8 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>
                {produto.destaque && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-emerald-600 font-medium">Código: {produto.codigo}</p>
              <p className="text-sm text-gray-500">
                {produto.empresa?.nome}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(produto.status)}`}>
              {getStatusIcon(produto.status)}
              {produto.status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-6">
            {/* Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Galeria de Imagens */}
              <div className="space-y-4">
                {/* Imagem Principal */}
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <Image 
                      src={produto.imagens[selectedImageIndex]} 
                      alt={produto.nome}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-24 w-24 text-gray-300" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnails */}
                {produto.imagens && produto.imagens.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {produto.imagens.map((imagem: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-emerald-500 ring-2 ring-emerald-200' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <Image 
                          src={imagem} 
                          alt={`${produto.nome} - Imagem ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações do Produto */}
              <div className="space-y-6">
                
                {/* Preços */}
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6">
                  <div className="space-y-4">
                    {temDesconto ? (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {(((parseFloat(String(produto.preco)) - parseFloat(String(produto.precoPromocional!))) / parseFloat(String(produto.preco))) * 100).toFixed(0)}% OFF
                          </span>
                          <span className="text-sm text-gray-600">Oferta especial</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-emerald-600">
                            <OptimizedCurrencyDisplay 
                              amount={parseFloat(String(produto.precoPromocional))} 
                              fromCurrency="BRL" 
                              toCurrency="USD"
                            />
                          </p>
                          <p className="text-lg text-gray-500 line-through">
                            <OptimizedCurrencyDisplay 
                              amount={parseFloat(String(produto.preco))} 
                              fromCurrency="BRL" 
                              toCurrency="USD"
                            />
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-emerald-600">
                          <OptimizedCurrencyDisplay 
                            amount={parseFloat(String(produto.preco))} 
                            fromCurrency="BRL" 
                            toCurrency="USD"
                          />
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">por {produto.unidade}</p>
                  </div>
                </div>

                {/* Estoque */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Disponibilidade
                    </h4>
                    {estoqueStatus && (
                      <div className={`flex items-center gap-1 ${estoqueStatus.color}`}>
                        {estoqueStatus.icon}
                        <span className="text-sm font-medium">{estoqueStatus.text}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estoque disponível</span>
                      <span className="font-semibold text-gray-900">{produto.estoque} unidades</span>
                    </div>
                    
                    {produto.estoque > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            produto.estoque <= produto.estoqueMinimo ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${Math.min((produto.estoque / (produto.estoqueMinimo * 2)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controles de Compra */}
                {produto.estoque > 0 && (
                  <div className="space-y-4">
                    {/* Seletor de Quantidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => ajustarQuantidade(-1)}
                          disabled={quantidade <= 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[60px] text-center font-medium">
                          {quantidade}
                        </span>
                        <button
                          onClick={() => ajustarQuantidade(1)}
                          disabled={quantidade >= produto.estoque}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="space-y-3">
                      <ModernButton
                        onClick={adicionarAoCarrinho}
                        className="w-full"
                        icon={<ShoppingCart className="h-4 w-4" />}
                      >
                        Adicionar ao Carrinho
                      </ModernButton>
                      
                      <div className="flex gap-3">
                        <ModernButton
                          variant="outline"
                          onClick={toggleFavorito}
                          className="flex-1"
                          icon={<Heart className={`h-4 w-4 ${favorito ? 'fill-current text-red-500' : ''}`} />}
                        >
                          {favorito ? 'Favoritado' : 'Favoritar'}
                        </ModernButton>
                        
                        <ModernButton
                          variant="outline"
                          onClick={handleShare}
                          className="flex-1"
                          icon={<Share2 className="h-4 w-4" />}
                        >
                          Compartilhar
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status de Indisponibilidade */}
                {produto.estoque === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-red-800 mb-2">Produto Indisponível</h4>
                    <p className="text-sm text-red-600">
                      Este produto está temporariamente fora de estoque
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Descrição */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  Descrição do Produto
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
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
                      <p className="text-gray-900">{produto.categoria?.nome}</p>
                    </div>
                  </div>

                  {produto.descricao && (
                    <div>
                      <p className="text-sm text-gray-600">Descrição</p>
                      <p className="text-gray-900">{produto.descricao}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div className="bg-yellow-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-yellow-600" />
                  Especificações Técnicas
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

            {/* Informações da Empresa */}
            {produto.empresa && (
              <div className="bg-emerald-50 rounded-2xl p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Informações da Empresa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="font-medium text-gray-900">{produto.empresa.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categoria</p>
                    <p className="text-gray-900">{produto.categoria?.nome}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
