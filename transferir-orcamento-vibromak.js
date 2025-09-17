const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function transferirOrcamentoParaVibromak() {
  try {
    console.log('🔄 Transferindo orçamento para Vibromak...')

    // 1. Buscar a empresa Vibromak
    const vibromak = await prisma.empresa.findFirst({
      where: { 
        OR: [
          { nome: { contains: 'Vibromak' } },
          { nomeFantasia: { contains: 'Vibromak' } }
        ]
      }
    })

    if (!vibromak) {
      console.log('❌ Empresa Vibromak não encontrada!')
      return
    }

    console.log(`✅ Vibromak encontrada: ${vibromak.nome} (ID: ${vibromak.id})`)

    // 2. Buscar o orçamento #ORC-2025-001
    const orcamento = await prisma.orcamento.findFirst({
      where: { numero: 'ORC-2025-001' },
      include: { empresa: true }
    })

    if (!orcamento) {
      console.log('❌ Orçamento ORC-2025-001 não encontrado!')
      return
    }

    console.log(`📄 Orçamento encontrado: ${orcamento.numero}`)
    console.log(`🏢 Empresa atual: ${orcamento.empresa.nome}`)

    // 3. Atualizar o orçamento para usar a Vibromak
    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: orcamento.id },
      data: { empresaId: vibromak.id },
      include: { empresa: true }
    })

    console.log('')
    console.log('🎉 Orçamento transferido com sucesso!')
    console.log(`📄 Orçamento: ${orcamentoAtualizado.numero}`)
    console.log(`🏢 Nova empresa: ${orcamentoAtualizado.empresa.nome}`)
    console.log(`📍 Endereço: ${orcamentoAtualizado.empresa.endereco}, ${orcamentoAtualizado.empresa.cidade}/${orcamentoAtualizado.empresa.estado}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

transferirOrcamentoParaVibromak()
