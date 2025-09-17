// Tipos compartilhados para todo o projeto

export interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  avatar?: string
  role: 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
  ativo: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Cliente {
  id: string
  empresa?: string
  cnpj?: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo: boolean
  createdAt: string | Date
  updatedAt: string | Date
  user: User
}

export interface Vendedor {
  id: string
  comissao: number | string
  meta: number | string
  ativo: boolean
  user: User
}

export interface Empresa {
  id: string
  nome: string
  nomeFantasia?: string
  cnpj: string
  email: string
  telefone?: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  logo?: string
  corPrimaria: string
  ativa: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Produto {
  id: string
  codigo: string
  nome: string
  descricao?: string
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
  categoria: {
    id: string
    nome: string
  }
  empresa: {
    id: string
    nome: string
  }
}

export interface Orcamento {
  id: string
  numero: string
  titulo: string
  status: 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'EXPIRADO'
  subtotal: number | string
  desconto: number | string
  total: number | string
  createdAt: string | Date
  updatedAt: string | Date
  cliente: Cliente
  vendedor: Vendedor
  empresa: Empresa
  itens?: OrcamentoItem[]
}

export interface OrcamentoItem {
  id: string
  quantidade: number
  precoUnit: number | string
  desconto: number | string
  total: number | string
  produto: Produto
}

export interface CrmItem {
  id: string
  titulo: string
  descricao?: string
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO' | 'FECHADO'
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  dataVencimento?: string | Date
  createdAt: string | Date
  updatedAt: string | Date
  cliente: Cliente
  vendedor: Vendedor
}

export interface ErrorResponse {
  error: string
  message?: string
}

export interface SuccessResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

// Estados comuns de carregamento
export interface LoadingState {
  loading: boolean
  error: string | null
}

// Props comuns para formulários
export interface FormProps<T = unknown> {
  data?: T
  onClose: () => void
  onSuccess: () => void
}

// Props comuns para views/modais
export interface ViewProps<T = unknown> {
  data: T
  onClose: () => void
  onEdit?: () => void
}
