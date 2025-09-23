'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Eye, 
  Tag, 
  TrendingUp,
  Grid3X3,
  List,
  SlidersHorizontal,
  Heart,
  Share2,
  ChevronDown
} from 'lucide-react'
import ModernButton from '@/components/ui/modern-button'
import ModernCard from '@/components/ui/modern-card'
import { useToast } from '@/components/ui/modern-toast'
import { useCarrinho } from '@/hooks/useCarrinho'
import OptimizedCurrencyDisplay from '@/components/ui/optimized-currency-display'
import ClienteProdutoView from '@/components/views/cliente-produto-view'
import ProductImage from '@/components/ui/product-image'

interface Produto {
  id: string
  nome: string
  descricao?: string
  codigo: string
  preco: number
  precoPromocional?: number
  unidade: string
  estoque: number
  status: string
  destaque: boolean
  imagens: string[]
  categoria: {
    id: string
    nome: string
  }
  empresa: {
    id: string
    nome: string
  }
}

interface Categoria {
  id: string
  nome: string
  _count: {
    produtos: number
  }
}

export default function ClienteProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('nome')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const { success, error } = useToast()
  const { adicionarItem, recarregar } = useCarrinho()

  useEffect(() => {
    fetchProdutos()
    fetchCategorias()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos')
      if (!response.ok) throw new Error('Erro ao carregar produtos')
      
      const data = await response.json()
      setProdutos(Array.isArray(data) ? data.filter((p: Produto) => p.status === 'ATIVO') : [])
    } catch (err: unknown) {
      error('Erro ao carregar produtos', err instanceof Error ? err.message : "Erro desconhecido")
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (!response.ok) throw new Error('Erro ao carregar categorias')
      
      const data = await response.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      // Erro silencioso para categorias
      setCategorias([])
    }
  }

  const adicionarAoCarrinho = async (produto: Produto, quantidade: number = 1) => {
    const sucesso = await adicionarItem(produto.id, quantidade)
    
    if (sucesso) {
      success('Adicionado ao carrinho!', `${produto.nome} foi adicionado ao carrinho`)
    } else {
      error('Erro ao adicionar ao carrinho', 'Tente novamente')
    }
  }

  const toggleFavorito = (produtoId: string) => {
    const newFavoritos = new Set(favoritos)
    if (favoritos.has(produtoId)) {
      newFavoritos.delete(produtoId)
      success('Removido dos favoritos', '')
    } else {
      newFavoritos.add(produtoId)
      success('Adicionado aos favoritos', '')
    }
    setFavoritos(newFavoritos)
  }

  const handleShare = (produto: Produto) => {
    if (navigator.share) {
      navigator.share({
        title: produto.nome,
        text: produto.descricao,
        url: window.location.href
      })
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href)
      success('Link copiado!', 'URL do produto copiada para área de transferência')
    }
  }

  // Filtrar e ordenar produtos
  const filteredProdutos = produtos
    .filter(produto => {
      const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategoria = !selectedCategoria || produto.categoria.id === selectedCategoria
      return matchSearch && matchCategoria
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'preco':
          return (a.precoPromocional || a.preco) - (b.precoPromocional || b.preco)
        case 'preco-desc':
          return (b.precoPromocional || b.preco) - (a.precoPromocional || a.preco)
        case 'destaque':
          return b.destaque ? 1 : -1
        default:
          return a.nome.localeCompare(b.nome)
      }
    })

  const ProductCard = ({ produto }: { produto: Produto }) => (
    <ModernCard variant="bordered" interactive className="group overflow-hidden">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          <ProductImage
            src={produto.imagens.length > 0 ? produto.imagens[0] : ''}
            alt={produto.nome}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackText="Produto sem imagem"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
                {produto.destaque && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium">
              <Star className="h-3 w-3" />
                      Destaque
                    </span>
          )}
          {produto.precoPromocional && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
              <Tag className="h-3 w-3" />
              Oferta
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleFavorito(produto.id)}
            className={`p-2 rounded-full transition-colors ${
              favoritos.has(produto.id)
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setSelectedProduto(produto)}
            className="p-2 bg-white text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleShare(produto)}
            className="p-2 bg-white text-gray-600 rounded-full hover:bg-green-50 hover:text-green-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Estoque */}
        {produto.estoque === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-medium">
              Fora de Estoque
            </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                    {produto.categoria.nome}
                  </span>
                </div>
                
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {produto.nome}
                </h3>
        
        <p className="text-sm text-gray-600 mb-2">Código: {produto.codigo}</p>
                
                {produto.descricao && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {produto.descricao}
                  </p>
                )}
                
        <div className="flex items-center justify-between mb-4">
                  <div>
                    {produto.precoPromocional ? (
              <div>
                <p className="text-lg font-bold text-emerald-600">
                  <OptimizedCurrencyDisplay 
                    amount={produto.precoPromocional} 
                    fromCurrency="BRL" 
                    toCurrency="USD"
                  />
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                  <OptimizedCurrencyDisplay 
                    amount={produto.preco} 
                    fromCurrency="BRL" 
                    toCurrency="USD"
                  />
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-gray-900">
                <OptimizedCurrencyDisplay 
                  amount={produto.preco} 
                  fromCurrency="BRL" 
                  toCurrency="USD"
                />
              </p>
            )}
            <p className="text-xs text-gray-500">por {produto.unidade}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <ModernButton
            onClick={() => adicionarAoCarrinho(produto)}
            disabled={produto.estoque === 0}
            className="w-full"
            icon={<ShoppingCart className="h-4 w-4" />}
          >
            {produto.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
          </ModernButton>
          
          {produto.estoque > 0 && (
            <p className="text-xs text-emerald-600 text-center">
              {produto.estoque} unidades disponíveis
                      </p>
                    )}
        </div>
      </div>
    </ModernCard>
  )

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-emerald-600" />
            Catálogo de Produtos
          </h1>
          <p className="text-gray-600 mt-2">
            Explore nossa linha completa de produtos e solicite orçamentos
                    </p>
                  </div>
                  
        <div className="flex items-center gap-3">
          <ModernButton
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className="p-2"
          >
            <Grid3X3 className="h-4 w-4" />
          </ModernButton>
          
          <ModernButton
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="p-2"
          >
            <List className="h-4 w-4" />
          </ModernButton>
        </div>
      </div>

      {/* Filtros e Busca */}
      <ModernCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar produtos por nome, código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          
          {/* Categoria */}
          <div className="lg:w-64">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome} ({categoria._count?.produtos || 0})
                </option>
              ))}
            </select>
          </div>
          
          {/* Ordenação */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="nome">A-Z</option>
              <option value="preco">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
              <option value="destaque">Destaques</option>
            </select>
          </div>
          
          <ModernButton
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filtros
          </ModernButton>
                </div>
                
        {/* Resultado da busca */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredProdutos.length} produtos encontrados
            {searchTerm && ` para "${searchTerm}"`}
            {selectedCategoria && ` na categoria selecionada`}
          </p>
          
          {(searchTerm || selectedCategoria) && (
            <ModernButton
              variant="ghost"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategoria('')
              }}
            >
              Limpar filtros
            </ModernButton>
                )}
              </div>
      </ModernCard>

      {/* Grid de Produtos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredProdutos.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredProdutos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      ) : (
        <ModernCard className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategoria
              ? 'Nenhum produto encontrado'
              : 'Nenhum produto disponível'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategoria
              ? 'Tente ajustar os filtros para encontrar o que procura'
              : 'Não há produtos disponíveis no momento'
            }
          </p>
          {(searchTerm || selectedCategoria) && (
            <ModernButton
              onClick={() => {
                setSearchTerm('')
                setSelectedCategoria('')
              }}
            >
              Ver todos os produtos
            </ModernButton>
          )}
        </ModernCard>
      )}

      {/* Modal de Detalhes do Produto */}
      {selectedProduto && (
        <ClienteProdutoView 
          produtoId={selectedProduto.id}
          onClose={() => setSelectedProduto(null)}
        />
      )}
    </div>
  )
}
