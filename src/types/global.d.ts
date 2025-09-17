// Tipos globais para todo o projeto

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      NEXTAUTH_SECRET: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

// Tipos básicos para entidades do banco
export interface BaseEntity {
  id: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface User extends BaseEntity {
  nome: string
  email: string
  telefone?: string
  avatar?: string
  role: 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
  ativo: boolean
  status?: string
  motivoRejeicao?: string
}

export interface Cliente extends BaseEntity {
  empresa?: string
  cnpj?: string
  cpf?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo: boolean
  userId: string
  vendedorId?: string
  user: User
  vendedor?: Vendedor
  orcamentos?: Orcamento[]
}

export interface Vendedor extends BaseEntity {
  comissao: number | string
  meta: number | string
  ativo: boolean
  userId: string
  user: User
  clientes?: Cliente[]
  orcamentos?: Orcamento[]
  empresas?: VendedorEmpresa[]
}

export interface Empresa extends BaseEntity {
  nome: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  email: string
  telefone?: string
  website?: string
  endereco: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  banco?: string
  agencia?: string
  conta?: string
  logo?: string
  corPrimaria: string
  ativa: boolean
  vendedores?: VendedorEmpresa[]
  produtos?: Produto[]
  orcamentos?: Orcamento[]
  _count?: {
    vendedores?: number
    produtos?: number
    orcamentos?: number
  }
}

export interface VendedorEmpresa extends BaseEntity {
  vendedorId: string
  empresaId: string
  ativo: boolean
  comissao?: number
  meta?: number
  vendedor: Vendedor
  empresa: Empresa
}

export interface Categoria extends BaseEntity {
  nome: string
  descricao?: string
  ativa: boolean
  produtos?: Produto[]
}

export interface Produto extends BaseEntity {
  codigo?: string
  nome: string
  descricao?: string
  categoriaId: string
  empresaId: string
  preco: number | string
  precoPromocional?: number | string
  unidade: string
  estoque: number
  estoqueMinimo: number
  peso?: number | string
  dimensoes?: string
  imagens: string[]
  status: 'ATIVO' | 'INATIVO' | 'DESCONTINUADO'
  destaque: boolean
  categoria: Categoria
  empresa: Empresa
  itensOrcamento?: OrcamentoItem[]
  carrinhoItens?: CarrinhoItem[]
}

export interface Orcamento extends BaseEntity {
  numero: string
  titulo: string
  descricao?: string
  clienteId: string
  vendedorId: string
  empresaId: string
  validadeAte?: string | Date
  observacoes?: string
  condicoesPagamento?: string
  prazoEntrega?: string
  subtotal: number | string
  desconto: number | string
  frete: number | string
  total: number | string
  status: 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'EXPIRADO'
  
  // Campos de exportação
  incoterm?: string
  portoDestino?: string
  tipoFrete?: string
  diasTransito?: number
  pesoBruto?: number | string
  volume?: number | string
  freteInternacional?: number | string
  seguro?: number | string
  taxasDesaduanagem?: number | string
  
  cliente: Cliente
  vendedor: Vendedor
  empresa: Empresa
  itens?: OrcamentoItem[]
}

export interface OrcamentoItem extends BaseEntity {
  orcamentoId: string
  produtoId: string
  quantidade: number
  precoUnit: number | string
  desconto: number | string
  total: number | string
  observacoes?: string
  orcamento: Orcamento
  produto: Produto
}

export interface CarrinhoItem extends BaseEntity {
  clienteId: string
  produtoId: string
  quantidade: number
  observacoes?: string
  cliente: Cliente
  produto: Produto
}

export interface CrmItem extends BaseEntity {
  clienteId: string
  vendedorId: string
  tipo: 'CONTATO' | 'VISITA' | 'REUNIAO' | 'EMAIL' | 'TELEFONE' | 'PROPOSTA' | 'FOLLOWUP'
  titulo: string
  descricao?: string
  dataAgendada?: string | Date
  dataRealizada?: string | Date
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO' | 'ADIADO'
  resultado?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO'
  observacoes?: string
  proximoContato?: string | Date
  cliente: Cliente
  vendedor: Vendedor
}

// Tipos para formulários
export interface FormSelectOption {
  value: string
  label: string
  disabled?: boolean
}

// Tipos para componentes UI
export interface TableColumn<T = any> {
  key: string
  title: string
  width?: string
  render?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: PaginationData
}

// Tipos para autenticação
export interface AuthUser {
  id: string
  nome: string
  email: string
  role: 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
  ativo: boolean
  clienteProfile?: Cliente
  vendedorProfile?: Vendedor
}

// Tipos para estatísticas
export interface VendedorStats {
  totalClientes: number
  totalOrcamentos: number
  orcamentosAprovados: number
  totalVendas: number
}

export interface AdminStats {
  totalUsuarios: number
  totalClientes: number
  totalVendedores: number
  totalEmpresas: number
  totalProdutos: number
  totalOrcamentos: number
  vendasMes: number
  crescimento: number
}

// Helper types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

export {};
