import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanSpecificObservation() {
  console.log('🔄 Limpando observação específica que contém "Cotización Dólar"...')
  
  try {
    // Buscar orçamentos que contenham essa frase específica
    const orcamentosComFrase = await prisma.orcamento.findMany({
      where: {
        OR: [
          { observacoes: { contains: 'Cotización Dólar' } },
          { observacoes: { contains: 'TOTAL CIF (USD)' } },
          { observacoes: { contains: 'BRL 5,42' } },
          { observacoes: { contains: '19.679,44' } },
          { observacoes: { contains: '09/09/2025' } }
        ]
      },
      select: {
        id: true,
        numero: true,
        observacoes: true
      }
    })

    console.log(`📋 Encontrados ${orcamentosComFrase.length} orçamentos com a frase:`)
    
    for (const orcamento of orcamentosComFrase) {
      console.log(`- Orçamento ${orcamento.numero} (${orcamento.id}):`)
      console.log(`  Observação atual: "${orcamento.observacoes}"`)
      
      // Limpar a observação
      await prisma.orcamento.update({
        where: { id: orcamento.id },
        data: { observacoes: null }
      })
      
      console.log(`✅ Observação removida do orçamento ${orcamento.numero}`)
    }

    console.log('🎉 Limpeza concluída!')
  } catch (error) {
    console.error('❌ Erro ao limpar observações:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanSpecificObservation()
