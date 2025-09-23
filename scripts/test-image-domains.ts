import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testImageDomains() {
  try {
    console.log('🧪 Testando domínios de imagens...\n')
    
    const produtos = await prisma.produto.findMany({
      select: {
        id: true,
        nome: true,
        imagens: true
      },
      where: {
        imagens: {
          not: {
            equals: []
          }
        }
      },
      take: 5
    })

    const domains = new Set<string>()
    const imageTests: Array<{
      produto: string
      url: string
      domain: string
      status: 'pending' | 'success' | 'error'
    }> = []

    // Coletar domínios únicos
    produtos.forEach(produto => {
      produto.imagens.forEach(img => {
        try {
          const url = new URL(img)
          domains.add(url.hostname)
          imageTests.push({
            produto: produto.nome,
            url: img,
            domain: url.hostname,
            status: 'pending'
          })
        } catch (e) {
          console.log(`❌ URL inválida: ${img}`)
        }
      })
    })

    console.log('🌐 Domínios encontrados:')
    domains.forEach(domain => {
      console.log(`   - ${domain}`)
    })
    console.log('')

    // Testar algumas URLs
    console.log('🔍 Testando URLs de imagens...\n')
    
    for (const test of imageTests.slice(0, 3)) {
      try {
        console.log(`Testando: ${test.produto}`)
        console.log(`URL: ${test.url}`)
        
        const response = await fetch(test.url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (response.ok) {
          console.log(`✅ Status: ${response.status} ${response.statusText}`)
          console.log(`   Content-Type: ${response.headers.get('content-type')}`)
          console.log(`   Content-Length: ${response.headers.get('content-length')}`)
        } else {
          console.log(`❌ Status: ${response.status} ${response.statusText}`)
        }
        
        test.status = response.ok ? 'success' : 'error'
      } catch (error) {
        console.log(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        test.status = 'error'
      }
      console.log('')
    }

    // Resumo
    const successCount = imageTests.filter(t => t.status === 'success').length
    const errorCount = imageTests.filter(t => t.status === 'error').length
    
    console.log('📊 Resumo dos testes:')
    console.log(`   ✅ Sucessos: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    console.log(`   📈 Taxa de sucesso: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImageDomains()
