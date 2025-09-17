import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { gerarNumeroOrcamento } from '@/utils/orcamento-utils'

// Schema para finalizar carrinho
const finalizarCarrinhoSchema = z.object({
  observacoes: z.string().optional(),
  prazoEntrega: z.string().optional(),
  condicoesPagamento: z.string().optional()
})

// POST - Finalizar carrinho e gerar orçamentos por empresa
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.clienteProfile) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas clientes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = finalizarCarrinhoSchema.parse(body)

    // Buscar itens do carrinho com produtos e empresas
    const carrinhoItens = await prisma.carrinhoItem.findMany({
      where: {
        clienteId: user.clienteProfile.id
      },
      include: {
        produto: {
          include: {
            categoria: true,
            empresa: true
          }
        }
      }
    })

    if (carrinhoItens.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho está vazio' },
        { status: 400 }
      )
    }

    console.log(`🛒 Carrinho tem ${carrinhoItens.length} itens`)
    carrinhoItens.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.produto.nome} - Empresa: ${item.produto.empresa.nome} (ID: ${item.produto.empresa.id})`)
    })

    // Agrupar itens por empresa
    const itensPorEmpresa = carrinhoItens.reduce((acc, item) => {
      const empresaId = item.produto.empresa.id
      if (!acc[empresaId]) {
        acc[empresaId] = {
          empresa: item.produto.empresa,
          itens: []
        }
      }
      acc[empresaId].itens.push({
        ...item,
        observacoes: item.observacoes || undefined,
        produto: {
          ...item.produto,
          preco: Number(item.produto.preco),
          precoPromocional: item.produto.precoPromocional ? Number(item.produto.precoPromocional) : undefined,
          empresa: {
            id: item.produto.empresa.id,
            nome: item.produto.empresa.nome
          }
        }
      })
      return acc
    }, {} as Record<string, { empresa: { id: string, nome: string }, itens: Array<{ id: string, quantidade: number, observacoes?: string, produto: { id: string, nome: string, preco: number, precoPromocional?: number, empresa: { id: string, nome: string } } }> }>)

    console.log(`🏢 Agrupado em ${Object.keys(itensPorEmpresa).length} empresas:`)
    Object.entries(itensPorEmpresa).forEach(([empresaId, grupo]) => {
      console.log(`   - ${grupo.empresa.nome}: ${grupo.itens.length} itens`)
    })

    const orcamentosCriados = []

    // Criar um orçamento para cada empresa
    for (const [empresaId, grupo] of Object.entries(itensPorEmpresa)) {
      console.log(`\n🔍 Processando empresa: ${grupo.empresa.nome} (ID: ${empresaId})`)
      
      // Encontrar vendedor da empresa
      const vendedorEmpresa = await prisma.vendedorEmpresa.findFirst({
        where: {
          empresaId: empresaId,
          ativo: true
        },
        include: {
          vendedor: {
            include: {
              user: true
            }
          }
        }
      })

      if (!vendedorEmpresa) {
        console.error(`❌ ERRO: Nenhum vendedor encontrado para empresa ${grupo.empresa.nome} (ID: ${empresaId})`)
        console.log(`   🔍 Tentando buscar TODOS os vendedores desta empresa...`)
        
        const todosVendedores = await prisma.vendedorEmpresa.findMany({
          where: { empresaId: empresaId },
          include: {
            vendedor: {
              include: { user: true }
            }
          }
        })
        
        console.log(`   📊 Encontrados ${todosVendedores.length} vendedores (incluindo inativos):`)
        todosVendedores.forEach(ve => {
          console.log(`      - ${ve.vendedor.user.nome} (ativo: ${ve.ativo})`)
        })
        
        continue
      }

      console.log(`✅ Vendedor encontrado: ${vendedorEmpresa.vendedor.user.nome}`)

      // Calcular totais
      let subtotal = 0
      const itensOrcamento = grupo.itens.map(item => {
        const precoUnitario = item.produto.precoPromocional || item.produto.preco
        const totalItem = Number(precoUnitario) * item.quantidade
        subtotal += totalItem
        
        return {
          produtoId: item.produto.id,
          quantidade: item.quantidade,
          precoUnit: precoUnitario,
          desconto: 0,
          total: totalItem,
          observacoes: item.observacoes || undefined
        }
      })

      // Gerar número único do orçamento no formato OPDEXPORT20250917001
      const numeroOrcamento = await gerarNumeroOrcamento()

      // Criar orçamento
      const orcamento = await prisma.orcamento.create({
        data: {
          numero: numeroOrcamento,
          clienteId: user.clienteProfile.id,
          vendedorId: vendedorEmpresa.vendedor.id,
          empresaId: empresaId,
          vendedorEmpresaId: vendedorEmpresa.id,
          userId: user.id,
          titulo: `Orçamento - ${grupo.empresa.nome}`,
          descricao: `Orçamento solicitado via carrinho para produtos da ${grupo.empresa.nome}`,
          status: 'ENVIADO', // Já enviar para o vendedor
          subtotal: subtotal,
          desconto: 0,
          total: subtotal,
          observacoes: validatedData.observacoes,
          prazoEntrega: validatedData.prazoEntrega,
          condicoesPagamento: validatedData.condicoesPagamento,
          validadeAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          itens: {
            create: itensOrcamento
          }
        },
        include: {
          empresa: true,
          vendedor: {
            include: {
              user: true
            }
          },
          itens: {
            include: {
              produto: true
            }
          }
        }
      })

      orcamentosCriados.push(orcamento)
    }

    // Limpar carrinho após criar orçamentos
    await prisma.carrinhoItem.deleteMany({
      where: {
        clienteId: user.clienteProfile.id
      }
    })

    console.log(`✅ ${orcamentosCriados.length} orçamentos criados para cliente ${user.email}`)

    return NextResponse.json({
      message: `${orcamentosCriados.length} orçamento(s) criado(s) com sucesso`,
      orcamentos: orcamentosCriados.map(orc => ({
        id: orc.id,
        numero: orc.numero,
        empresa: orc.empresa.nome,
        vendedor: orc.vendedor.user.nome,
        total: orc.total,
        status: orc.status
      }))
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('❌ Erro ao finalizar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
