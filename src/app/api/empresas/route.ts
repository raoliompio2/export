import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  website: z.string().optional(),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  logo: z.string().optional(),
  corPrimaria: z.string().default('#3B82F6'),
  ativa: z.boolean().default(true)
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Admin vê todas as empresas, vendedor vê apenas as suas
    let whereCondition = {}
    if (user.role === 'VENDEDOR' && user.vendedorProfile) {
      // Buscar apenas empresas que o vendedor representa
      whereCondition = {
        vendedores: {
          some: {
            vendedorId: user.vendedorProfile.id,
            ativo: true
          }
        }
      }
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const empresas = await prisma.empresa.findMany({
      where: whereCondition,
      include: {
        vendedores: {
          include: {
            vendedor: {
              include: {
                user: true
              }
            }
          }
        },
        _count: {
          select: {
            vendedores: true,
            orcamentos: true,
            produtos: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = empresaSchema.parse(body)

    // Verificar se CNPJ já existe
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { cnpj: validatedData.cnpj }
    })

    if (existingEmpresa) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      )
    }

    const empresa = await prisma.empresa.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            vendedores: true,
            orcamentos: true
          }
        }
      }
    })

    return NextResponse.json(empresa, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
