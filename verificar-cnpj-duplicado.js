const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarCNPJDuplicado() {
  try {
    const empresasComMesmoCNPJ = await prisma.empresa.findMany({
      where: { cnpj: '12.345.678/0001-99' }
    })

    console.log(`🔍 Empresas com CNPJ 12.345.678/0001-99: ${empresasComMesmoCNPJ.length}`)
    
    empresasComMesmoCNPJ.forEach((empresa, index) => {
      console.log(`${index + 1}. ${empresa.nome} (ID: ${empresa.id.slice(0, 8)}...)`)
      console.log(`   Cidade: ${empresa.cidade}`)
      console.log(`   Criado em: ${empresa.createdAt}`)
      console.log('')
    })

    if (empresasComMesmoCNPJ.length > 1) {
      console.log('❌ PROBLEMA: CNPJ duplicado!')
      console.log('💡 Solução: Deletar a empresa duplicada ou alterar CNPJ')
    } else {
      console.log('✅ Sem duplicação de CNPJ')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarCNPJDuplicado()
