const { PrismaClient } = require('@prisma/client')

async function fix() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Verificando dados...')
    
    // Buscar empresa
    const empresa = await prisma.empresa.findFirst()
    console.log('Empresa encontrada:', empresa?.nome)
    
    // Buscar usuário
    const user = await prisma.user.findFirst({
      where: { email: 'rafael.popeartstudio@gmail.com' }
    })
    console.log('Usuário encontrado:', user?.email)
    
    if (!empresa || !user) {
      console.log('❌ Empresa ou usuário não encontrado')
      return
    }
    
    // Corrigir vendedor
    const result = await prisma.vendedor.upsert({
      where: { userId: user.id },
      update: { empresaId: empresa.id },
      create: {
        userId: user.id,
        empresaId: empresa.id,
        comissao: 5,
        meta: 10000,
        ativo: true
      }
    })
    
    console.log('✅ Vendedor corrigido:', result.id)
    console.log('✅ Empresa vinculada:', empresa.nome)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fix()
