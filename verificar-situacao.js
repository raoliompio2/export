const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarSituacao() {
  try {
    console.log('🔍 Verificando situação atual...')

    // 1. Listar todas as empresas
    const empresas = await prisma.empresa.findMany()
    console.log('\n📋 Empresas no banco:')
    empresas.forEach((e, i) => {
      console.log(`${i+1}. ${e.nome} (${e.cnpj}) - ${e.cidade}/${e.estado}`)
    })

    // 2. Verificar último orçamento criado
    const ultimoOrcamento = await prisma.orcamento.findFirst({
      include: { empresa: true },
      orderBy: { createdAt: 'desc' }
    })

    if (ultimoOrcamento) {
      console.log('\n📄 Último orçamento criado:')
      console.log(`- Número: ${ultimoOrcamento.numero}`)
      console.log(`- Empresa vinculada: ${ultimoOrcamento.empresa.nome}`)
      console.log(`- Cidade: ${ultimoOrcamento.empresa.cidade}`)
    }

    // 3. Verificar se existe orçamento da G.T.A. COLOMBIA
    const orcamentoGTA = await prisma.orcamento.findFirst({
      where: {
        titulo: { contains: 'G.T.A. COLOMBIA' }
      },
      include: { empresa: true, cliente: true }
    })

    if (orcamentoGTA) {
      console.log('\n🇨🇴 Orçamento G.T.A. COLOMBIA:')
      console.log(`- Empresa: ${orcamentoGTA.empresa.nome}`)
      console.log(`- Cliente: ${orcamentoGTA.cliente.empresa}`)
      console.log(`- Total: ${orcamentoGTA.total}`)
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarSituacao()
