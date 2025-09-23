import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImages() {
  try {
    console.log('🔍 Verificando URLs de imagens dos produtos...\n')
    
    const produtos = await prisma.produto.findMany({
      select: {
        id: true,
        nome: true,
        imagens: true
      },
      take: 10
    })

    produtos.forEach((produto, index) => {
      console.log(`${index + 1}. ${produto.nome}`)
      console.log(`   ID: ${produto.id}`)
      console.log(`   Imagens: ${produto.imagens.length}`)
      
      if (produto.imagens.length > 0) {
        produto.imagens.forEach((img, imgIndex) => {
          console.log(`   [${imgIndex + 1}] ${img}`)
        })
      } else {
        console.log('   ❌ Nenhuma imagem')
      }
      console.log('')
    })

    // Verificar domínios das imagens
    const allImages = produtos.flatMap(p => p.imagens)
    const domains = new Set<string>()
    
    allImages.forEach(img => {
      try {
        const url = new URL(img)
        domains.add(url.hostname)
      } catch (e) {
        console.log(`❌ URL inválida: ${img}`)
      }
    })

    console.log('🌐 Domínios encontrados:')
    domains.forEach(domain => {
      console.log(`   - ${domain}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkImages()
