const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarEmpresas() {
  try {
    const empresas = await prisma.empresa.findMany()
    console.log('📋 Empresas no banco:')
    empresas.forEach(e => console.log(`- ${e.nome} (${e.cnpj}) - ${e.cidade}/${e.estado}`))
    
    const orcamentos = await prisma.orcamento.findMany({
      include: { empresa: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    
    console.log('\n📋 Últimos orçamentos:')
    orcamentos.forEach(o => console.log(`- ${o.numero}: ${o.empresa.nome}`))
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarEmpresas()
