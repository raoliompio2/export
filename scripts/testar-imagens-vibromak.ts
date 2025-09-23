import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testarImagensVibromak() {
  try {
    console.log('🖼️ Testando URLs das imagens Vibromak...')

    // Buscar alguns produtos com imagens
    const produtos = await prisma.produto.findMany({
      where: {
        empresa: {
          nome: { contains: 'Vibromak', mode: 'insensitive' }
        },
        imagens: { isEmpty: false }
      },
      select: {
        codigo: true,
        nome: true,
        imagens: true
      },
      take: 5
    })

    console.log(`📊 Encontrados ${produtos.length} produtos com imagens:`)
    
    produtos.forEach(produto => {
      console.log(`\n🔍 ${produto.codigo} - ${produto.nome}`)
      produto.imagens.forEach((imagem, index) => {
        console.log(`   ${index + 1}. ${imagem}`)
      })
    })

    // Testar se as URLs são válidas
    console.log('\n🌐 Testando URLs...')
    for (const produto of produtos) {
      if (produto.imagens.length > 0) {
        const url = produto.imagens[0]
        try {
          const response = await fetch(url, { method: 'HEAD' })
          if (response.ok) {
            console.log(`✅ ${produto.codigo}: URL válida`)
          } else {
            console.log(`❌ ${produto.codigo}: HTTP ${response.status}`)
          }
        } catch (error) {
          console.log(`❌ ${produto.codigo}: Erro na requisição`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro ao testar imagens:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
testarImagensVibromak()
  .then(() => {
    console.log('✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
