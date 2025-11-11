import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calcularTotalItem, calcularTotaisOrcamento } from '@/utils/safe-formatting'
import { gerarNumeroOrcamento } from '@/utils/orcamento-utils'
import { getCurrentExchangeRate } from '@/utils/currency-utils'

const orcamentoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  descricao: z.string().optional(),
  validadeAte: z.string().optional(),
  observacoes: z.string().optional(),
  condicoesPagamento: z.string().optional(),
  prazoEntrega: z.string().optional(),
  frete: z.number().min(0).default(0),
  desconto: z.number().min(0).default(0),
  
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
    produtoId: z.string(),
    quantidade: z.number().min(1),
    precoUnit: z.number().min(0),
    desconto: z.number().min(0).default(0)
  }))
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    let whereCondition: { vendedorId?: string; clienteId?: string } = {}

    if (user.role === 'VENDEDOR' && user.vendedorProfile) {
      // Vendedor vê apenas seus orçamentos
      whereCondition = { vendedorId: user.vendedorProfile.id }
    } else if (user.role === 'CLIENTE' && user.clienteProfile) {
      // Cliente vê apenas seus orçamentos
      whereCondition = { clienteId: user.clienteProfile.id }
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    // Admin vê todos (whereCondition vazio)

    const orcamentos = await prisma.orcamento.findMany({
      where: whereCondition,
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        empresa: true,
        vendedorEmpresa: true,
        itens: {
          include: { produto: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orcamentos)
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (!user.vendedorProfile) {
      return NextResponse.json({ error: 'Perfil de vendedor não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = orcamentoSchema.parse(body)

    // Verificar se cliente existe e pertence ao vendedor
    const cliente = await prisma.cliente.findUnique({
      where: { id: validatedData.clienteId },
      include: { user: true }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    if (user.role === 'VENDEDOR' && cliente.vendedorId !== user.vendedorProfile.id) {
      return NextResponse.json({ error: 'Cliente não pertence a este vendedor' }, { status: 403 })
    }

    // Gerar número único do orçamento no formato OPDEXPORT20250917001
    const numero = await gerarNumeroOrcamento()

    // Calcular totais usando funções seguras
    const totaisCalculados = calcularTotaisOrcamento(
      validatedData.itens, 
      validatedData.desconto || 0, 
      validatedData.frete || 0
    )
    const { subtotal, desconto, frete, total } = totaisCalculados

    // Buscar empresa do vendedor
    const vendedorEmpresa = await prisma.vendedorEmpresa.findFirst({
      where: {
        vendedorId: user.vendedorProfile.id,
        ativo: true
      }
    })

    if (!vendedorEmpresa) {
      return NextResponse.json({ error: 'Vendedor não está vinculado a nenhuma empresa' }, { status: 400 })
    }

    // Buscar cotação atual do dólar
    const { rate: cotacaoDolar, source: cotacaoFonte } = await getCurrentExchangeRate()

    // Criar orçamento
    const orcamento = await prisma.orcamento.create({
      data: {
        numero,
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        clienteId: validatedData.clienteId,
        vendedorId: user.vendedorProfile.id,
        empresaId: vendedorEmpresa.empresaId,
        userId: cliente.userId,
        subtotal,
        desconto,
        frete,
        total,
        validadeAte: validatedData.validadeAte ? new Date(validatedData.validadeAte) : null,
        observacoes: validatedData.observacoes,
        condicoesPagamento: validatedData.condicoesPagamento,
        prazoEntrega: validatedData.prazoEntrega,
        
        // Campos de exportação
        incoterm: validatedData.incoterm,
        portoDestino: validatedData.portoDestino,
        tipoFrete: validatedData.tipoFrete,
        diasTransito: validatedData.diasTransito,
        pesoBruto: validatedData.pesoBruto,
        volume: validatedData.volume,
        medidas: validatedData.medidas,
        numeroCaixas: validatedData.numeroCaixas,
        freteInternacional: validatedData.freteInternacional,
        seguroInternacional: validatedData.seguroInternacional,
        taxasDesaduanagem: validatedData.taxasDesaduanagem,
        
        // Cotação do dólar usada
        cotacaoDolar,
        cotacaoFonte,
        
        status: 'ENVIADO'
      },
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        empresa: true
      }
    })

    // Criar itens do orçamento com cálculos corretos
    for (const item of validatedData.itens) {
      const itemTotal = calcularTotalItem(item.quantidade, item.precoUnit, item.desconto)
      
      await prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit,
          desconto: item.desconto,
          total: itemTotal
        }
      })
    }

    return NextResponse.json(orcamento, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
