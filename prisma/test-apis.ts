import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testando busca de dados como ADMIN...')
  
  const email = 'rafael.popeartstudio@gmail.com'
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendedorProfile: true,
        clienteProfile: true
      }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log(`👤 Usuário: ${user.nome} (${user.role})`)

    // Testar lógica das APIs
    console.log('\n🔧 Testando lógica whereCondition...')
    
    // Lógica atual das APIs
    const whereCondition = user.role === 'VENDEDOR' && user.vendedorProfile 
      ? { vendedorId: user.vendedorProfile.id }
      : {}

    console.log('WhereCondition:', whereCondition)

    // Buscar dados com whereCondition
    console.log('\n📋 Testando busca de clientes...')
    const clientes = await prisma.cliente.findMany({
      where: whereCondition,
      include: {
        user: true,
        vendedor: { include: { user: true } },
        _count: {
          select: {
            orcamentos: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`✅ Clientes encontrados: ${clientes.length}`)
    if (clientes.length > 0) {
      console.log('   Primeiro cliente:', clientes[0].user.nome)
    }

    console.log('\n💰 Testando busca de orçamentos...')
    const orcamentos = await prisma.orcamento.findMany({
      where: whereCondition,
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        itens: {
          include: { produto: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`✅ Orçamentos encontrados: ${orcamentos.length}`)
    if (orcamentos.length > 0) {
      console.log('   Primeiro orçamento:', orcamentos[0].numero, '-', orcamentos[0].titulo)
    }

    console.log('\n🤝 Testando busca de CRM...')
    const crmItems = await prisma.crmItem.findMany({
      where: whereCondition,
      include: {
        cliente: { include: { user: true } },
        vendedor: { include: { user: true } },
        interacoes: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { user: true }
        }
      },
      orderBy: [
        { prioridade: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    console.log(`✅ CRM Items encontrados: ${crmItems.length}`)
    if (crmItems.length > 0) {
      console.log('   Primeiro item:', crmItems[0].titulo)
    }

    console.log('\n📦 Testando busca de produtos...')
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true
      },
      orderBy: [
        { destaque: 'desc' },
        { nome: 'asc' }
      ],
    })
    console.log(`✅ Produtos encontrados: ${produtos.length}`)
    if (produtos.length > 0) {
      console.log('   Primeiro produto:', produtos[0].nome)
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
