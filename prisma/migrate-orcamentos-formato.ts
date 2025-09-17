import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script para migrar orçamentos existentes para o novo formato
 * De: ORC-1726513200000-abc123456
 * Para: OPDEXPORT20250917001
 */
async function migrarOrcamentosFormato() {
  console.log('🔄 Iniciando migração dos números de orçamentos...')

  try {
    // Buscar todos os orçamentos existentes
    const orcamentos = await prisma.orcamento.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        numero: true,
        createdAt: true
      }
    })

    console.log(`📋 Encontrados ${orcamentos.length} orçamentos para migrar`)

    let contadorPorDia: { [key: string]: number } = {}

    for (const orcamento of orcamentos) {
      // Extrair data do orçamento
      const dataOrcamento = orcamento.createdAt
      const ano = dataOrcamento.getFullYear()
      const mes = String(dataOrcamento.getMonth() + 1).padStart(2, '0')
      const dia = String(dataOrcamento.getDate()).padStart(2, '0')
      const dataFormatada = `${ano}${mes}${dia}`

      // Controlar contador por dia
      if (!contadorPorDia[dataFormatada]) {
        contadorPorDia[dataFormatada] = 0
      }
      contadorPorDia[dataFormatada]++

      // Gerar novo número
      const numeroSequencial = String(contadorPorDia[dataFormatada]).padStart(3, '0')
      const novoNumero = `OPDEXPORT${dataFormatada}${numeroSequencial}`

      // Atualizar orçamento
      await prisma.orcamento.update({
        where: { id: orcamento.id },
        data: { numero: novoNumero }
      })

      console.log(`✅ ${orcamento.numero} → ${novoNumero}`)
    }

    console.log(`🎉 Migração concluída! ${orcamentos.length} orçamentos atualizados`)

    // Mostrar estatísticas
    console.log('\n📊 Resumo por dia:')
    Object.entries(contadorPorDia).forEach(([data, count]) => {
      const ano = data.slice(0, 4)
      const mes = data.slice(4, 6)
      const diaNum = data.slice(6, 8)
      console.log(`   ${diaNum}/${mes}/${ano}: ${count} orçamentos`)
    })

  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  migrarOrcamentosFormato()
}

export { migrarOrcamentosFormato }
