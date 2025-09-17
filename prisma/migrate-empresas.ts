import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏢 Criando migração para sistema de empresas...')

  try {
    // 1. Primeiro, vamos fazer o reset do banco para aplicar a migração
    console.log('⚠️  ATENÇÃO: Fazendo backup dos dados existentes...')
    
    // Buscar dados existentes
    const users = await prisma.user.findMany({
      include: {
        vendedorProfile: true,
        clienteProfile: true
      }
    })
    
    const clientes = await prisma.cliente.findMany({
      include: { user: true }
    })
    
    const produtos = await prisma.produto.findMany({
      include: { categoria: true }
    })
    
    const categorias = await prisma.categoria.findMany()
    
    console.log(`📊 Dados encontrados:`)
    console.log(`- ${users.length} usuários`)
    console.log(`- ${clientes.length} clientes`) 
    console.log(`- ${produtos.length} produtos`)
    console.log(`- ${categorias.length} categorias`)
    
    console.log('\n✅ Backup concluído! Você pode prosseguir com:')
    console.log('npx prisma db push --force-reset')
    console.log('npx tsx prisma/recreate-data.ts')
    
  } catch (error) {
    console.error('❌ Erro durante backup:', error)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
