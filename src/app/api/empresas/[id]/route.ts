import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const empresaUpdateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, 'CNPJ inválido').min(1, 'CNPJ é obrigatório'),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  website: z.string().url('URL do website inválida').optional().or(z.literal('')),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  cep: z.string().regex(/^\d{5}\-\d{3}$/, 'CEP inválido').min(1, 'CEP é obrigatório'),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  logo: z.string().url('URL do logo inválida').optional().or(z.literal('')),
  corPrimaria: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor primária inválida').default('#3B82F6'),
  ativa: z.boolean().default(true),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Busca a empresa pelo ID, garantindo que o ID seja do tipo correto
    const empresa = await prisma.empresa.findUnique({
      where: { id: String(id) }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à empresa
    if (user.role === 'VENDEDOR' && user.vendedorProfile) {
      const temAcesso = await prisma.vendedorEmpresa.findFirst({
        where: {
          vendedorId: user.vendedorProfile.id,
          empresaId: id,
          ativo: true
        }
      })
      
      if (!temAcesso) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = empresaUpdateSchema.parse(body)

    // Verificar se empresa existe
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { id }
    })

    if (!existingEmpresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }


    // Verificar se CNPJ já existe em outra empresa
    const empresaComMesmoCNPJ = await prisma.empresa.findFirst({
      where: { 
        cnpj: validatedData.cnpj,
        id: { not: id }
      }
    })

    if (empresaComMesmoCNPJ) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado para outra empresa' },
        { status: 400 }
      )
    }

    const empresa = await prisma.empresa.update({
      where: { id: id },
      data: validatedData
    })

    return NextResponse.json(empresa)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Erro ao atualizar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se empresa existe
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        vendedores: true,
        produtos: true,
        orcamentos: true
      }
    })

    if (!existingEmpresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se há dependências
    if (existingEmpresa.vendedores.length > 0 || 
        existingEmpresa.produtos.length > 0 || 
        existingEmpresa.orcamentos.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir empresa com vendedores, produtos ou orçamentos associados' },
        { status: 400 }
      )
    }

    await prisma.empresa.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Empresa excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
