const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugVibromak() {
  try {
    const vibromak = await prisma.empresa.findUnique({
      where: { id: 'cmfnfgy0w0000l804jd2t3rwp' }
    })

    if (vibromak) {
      console.log('📋 Dados atuais da Vibromak:')
      console.log('Nome:', vibromak.nome)
      console.log('CNPJ:', vibromak.cnpj, '(length:', vibromak.cnpj?.length, ')')
      console.log('Telefone:', vibromak.telefone, '(length:', vibromak.telefone?.length, ')')
      console.log('CEP:', vibromak.cep, '(length:', vibromak.cep?.length, ')')
      console.log('Estado:', vibromak.estado, '(length:', vibromak.estado?.length, ')')
      console.log('Número:', vibromak.numero)
      console.log('Email:', vibromak.email)
      
      // Verificar campos problemáticos
      const problemas = []
      if (!vibromak.cnpj || vibromak.cnpj.length < 14) problemas.push('CNPJ muito curto')
      if (!vibromak.telefone || vibromak.telefone.length < 10) problemas.push('Telefone muito curto')
      if (!vibromak.cep || vibromak.cep.length < 8) problemas.push('CEP muito curto')
      if (!vibromak.estado || vibromak.estado.length < 2) problemas.push('Estado muito curto')
      if (!vibromak.numero) problemas.push('Número obrigatório')
      
      if (problemas.length > 0) {
        console.log('❌ Problemas encontrados:')
        problemas.forEach(p => console.log('  -', p))
      } else {
        console.log('✅ Todos os campos parecem válidos')
      }
    } else {
      console.log('❌ Empresa não encontrada')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugVibromak()
