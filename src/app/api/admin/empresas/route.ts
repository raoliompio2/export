import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar todas as empresas com estatísticas
    const empresas = await prisma.empresa.findMany({
      select: {
        id: true,
        nome: true,
        nomeFantasia: true,
        cnpj: true,
        inscricaoEstadual: true,
        inscricaoMunicipal: true,
        email: true,
        telefone: true,
        website: true,
        endereco: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        banco: true,
        agencia: true,
        conta: true,
        logo: true,
        corPrimaria: true,
        ativa: true,
        observacaoDesaduanagem: true,
        observacaoMercosul: true,
        observacaoValidade: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            vendedores: true,
            orcamentos: true,
            produtos: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      nome,
      nomeFantasia,
      cnpj,
      inscricaoEstadual,
      inscricaoMunicipal,
      email,
      telefone,
      website,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      banco,
      agencia,
      conta,
      logo,
      corPrimaria,
      ativa,
      observacaoDesaduanagem,
      observacaoMercosul,
      observacaoValidade
    } = body

    // Validar campos obrigatórios
    if (!nome || !cnpj || !email || !endereco || !cidade || !estado || !cep) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, cnpj, email, endereco, cidade, estado, cep' },
        { status: 400 }
      )
    }

    // Verificar se CNPJ já existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { cnpj }
    })

    if (empresaExistente) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      )
    }

    // Criar nova empresa
    const novaEmpresa = await prisma.empresa.create({
      data: {
        nome,
        nomeFantasia,
        cnpj,
        inscricaoEstadual,
        inscricaoMunicipal,
        email,
        telefone,
        website,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        banco,
        agencia,
        conta,
        logo,
        corPrimaria: corPrimaria || '#3B82F6',
        ativa: ativa !== undefined ? ativa : true,
        observacaoDesaduanagem: observacaoDesaduanagem || 'A empresa NÃO é responsável pelo desembaraço aduaneiro. O cliente deve realizar o desembaraço e retirar a carga no porto de destino.',
        observacaoMercosul: observacaoMercosul || 'Produtos nacionais podem ter benefícios fiscais no Mercosul.',
        observacaoValidade: observacaoValidade || 'Este é um orçamento. Preços válidos até a data especificada.'
      },
      include: {
        _count: {
          select: {
            vendedores: true,
            orcamentos: true,
            produtos: true
          }
        }
      }
    })

    return NextResponse.json(novaEmpresa, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
