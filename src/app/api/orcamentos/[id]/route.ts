import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calcularTotalItem, calcularTotaisOrcamento } from '@/utils/safe-formatting'

interface OrcamentoItemInput {
  produtoId: string
  quantidade: number | string
  precoUnit: number | string
  desconto?: number | string
  observacoes?: string
}

const updateStatusSchema = z.object({
  status: z.enum(['RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'EXPIRADO'])
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        empresa: true,
        itens: {
          include: { produto: true }
        }
      }
    })

    if (!orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este orçamento
    if (user.role === 'VENDEDOR' && orcamento.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(orcamento)
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error)
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
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    
    // Verificar se orçamento existe
    const existingOrcamento = await prisma.orcamento.findUnique({
      where: { id }
    })

    if (!existingOrcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este orçamento
    if (user.role === 'VENDEDOR' && existingOrcamento.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Se for apenas atualização de status
    if (body.status && Object.keys(body).length === 1) {
      const validatedStatus = updateStatusSchema.parse(body)
      
      const updatedOrcamento = await prisma.orcamento.update({
        where: { id },
        data: { status: validatedStatus.status },
        include: {
          cliente: { include: { user: true } },
          vendedor: { include: { user: true } },
          itens: { include: { produto: true } }
        }
      })

      return NextResponse.json(updatedOrcamento)
    }

    // Atualização completa do orçamento
    const {
      titulo,
      descricao,
      clienteId,
      vendedorId,
      empresaId,
      validadeAte,
      condicoesPagamento,
      prazoEntrega,
      observacoes,
      desconto = 0,
      frete = 0,
      // Campos de exportação
      incoterm,
      portoDestino,
      tipoFrete,
      diasTransito,
      pesoBruto,
      volume,
      medidas,
      numeroCaixas,
      freteInternacional,
      seguroInternacional,
      taxasDesaduanagem,
      itens = []
    } = body

    // Usar transação para garantir consistência
    const updatedOrcamento = await prisma.$transaction(async (tx) => {
      // Remover itens existentes
      await tx.orcamentoItem.deleteMany({
        where: { orcamentoId: id }
      })

      // Calcular totais dos itens usando função segura
      const processedItens = itens.map((item: OrcamentoItemInput) => {
        const quantidade = Number(item.quantidade) || 0
        const precoUnit = Number(item.precoUnit) || 0
        const descontoItem = Number(item.desconto) || 0
        
        const totalItem = calcularTotalItem(quantidade, precoUnit, descontoItem)
        
        return {
          produtoId: item.produtoId,
          quantidade,
          precoUnit,
          desconto: descontoItem,
          total: totalItem,
          observacoes: item.observacoes || null
        }
      })

      // Calcular totais do orçamento
      const totaisCalculados = calcularTotaisOrcamento(processedItens, desconto, frete)
      const { subtotal, total } = totaisCalculados
      const descontoTotal = Number(desconto) || 0
      const freteTotal = Number(frete) || 0

      // Atualizar orçamento
      const updated = await tx.orcamento.update({
        where: { id },
        data: {
          titulo,
          descricao,
          clienteId,
          vendedorId,
          empresaId,
          validadeAte: validadeAte ? new Date(validadeAte) : null,
          condicoesPagamento,
          prazoEntrega,
          observacoes,
          subtotal,
          desconto: descontoTotal,
          frete: freteTotal,
          total,
          // Campos de exportação
          incoterm,
          portoDestino,
          tipoFrete,
          diasTransito: diasTransito ? Number(diasTransito) : null,
          pesoBruto: pesoBruto ? Number(pesoBruto) : null,
          volume: volume ? Number(volume) : null,
          medidas,
          numeroCaixas: numeroCaixas ? Number(numeroCaixas) : null,
          freteInternacional: freteInternacional ? Number(freteInternacional) : null,
          seguroInternacional: seguroInternacional ? Number(seguroInternacional) : null,
          taxasDesaduanagem: taxasDesaduanagem ? Number(taxasDesaduanagem) : null,
          updatedAt: new Date()
        }
      })

      // Criar novos itens
      if (processedItens.length > 0) {
        await tx.orcamentoItem.createMany({
          data: processedItens.map((item: { produtoId: string; quantidade: number; precoUnit: number; desconto: number; total: number; observacoes?: string }) => ({
            ...item,
            orcamentoId: id
          }))
        })
      }

      // Buscar orçamento atualizado com todos os relacionamentos
      return await tx.orcamento.findUnique({
        where: { id },
        include: {
          cliente: { include: { user: true } },
          vendedor: { include: { user: true } },
          empresa: true,
          itens: { include: { produto: true } }
        }
      })
    })

    return NextResponse.json(updatedOrcamento)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar orçamento:', error)
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
    if (!user || (user.role !== 'VENDEDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se orçamento existe
    const existingOrcamento = await prisma.orcamento.findUnique({
      where: { id }
    })

    if (!existingOrcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Verificar se o vendedor tem acesso a este orçamento
    if (user.role === 'VENDEDOR' && existingOrcamento.vendedorId !== user.vendedorProfile?.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se orçamento pode ser excluído (apenas rascunhos ou rejeitados)
    if (!['RASCUNHO', 'REJEITADO'].includes(existingOrcamento.status)) {
      return NextResponse.json(
        { error: 'Apenas orçamentos em rascunho ou rejeitados podem ser excluídos' },
        { status: 400 }
      )
    }

    // Excluir orçamento (itens serão excluídos automaticamente por cascade)
    await prisma.orcamento.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Orçamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
