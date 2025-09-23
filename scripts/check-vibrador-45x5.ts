import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVibrador45x5() {
  try {
    console.log('🔍 Verificando produto "Vibrador de 45 x 5 mt"...\n')
    
    // Buscar por diferentes variações do nome
    const searchTerms = [
      'vibrador',
      '45',
      '5',
      'mt',
      'mangote'
    ]
    
    console.log('📋 Buscando produtos com termos relacionados:')
    
    for (const term of searchTerms) {
      const produtos = await prisma.produto.findMany({
        where: {
          OR: [
            { nome: { contains: term, mode: 'insensitive' } },
            { codigo: { contains: term, mode: 'insensitive' } },
            { descricao: { contains: term, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          nome: true,
          codigo: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      console.log(`\n🔎 Termo: "${term}" - ${produtos.length} produtos encontrados:`)
      produtos.forEach((produto, index) => {
        console.log(`   ${index + 1}. ${produto.nome}`)
        console.log(`      Código: ${produto.codigo}`)
        console.log(`      Status: ${produto.status}`)
        console.log(`      Criado: ${produto.createdAt.toISOString().split('T')[0]}`)
        console.log(`      Atualizado: ${produto.updatedAt.toISOString().split('T')[0]}`)
      })
    }
    
    // Buscar especificamente por "45" e "5"
    console.log('\n🎯 Buscando especificamente por "45" e "5":')
    const produtos45x5 = await prisma.produto.findMany({
      where: {
        AND: [
          {
            OR: [
              { nome: { contains: '45', mode: 'insensitive' } },
              { codigo: { contains: '45', mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { nome: { contains: '5', mode: 'insensitive' } },
              { codigo: { contains: '5', mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log(`\n📊 Produtos com "45" e "5": ${produtos45x5.length}`)
    produtos45x5.forEach((produto, index) => {
      console.log(`   ${index + 1}. ${produto.nome}`)
      console.log(`      Código: ${produto.codigo}`)
      console.log(`      Status: ${produto.status}`)
    })
    
    // Verificar se há produtos com "mangote" e "vibrador"
    console.log('\n🔧 Buscando produtos com "mangote" e "vibrador":')
    const produtosMangoteVibrador = await prisma.produto.findMany({
      where: {
        AND: [
          {
            OR: [
              { nome: { contains: 'mangote', mode: 'insensitive' } },
              { codigo: { contains: 'mangote', mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { nome: { contains: 'vibrador', mode: 'insensitive' } },
              { codigo: { contains: 'vibrador', mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log(`\n📊 Produtos com "mangote" e "vibrador": ${produtosMangoteVibrador.length}`)
    produtosMangoteVibrador.forEach((produto, index) => {
      console.log(`   ${index + 1}. ${produto.nome}`)
      console.log(`      Código: ${produto.codigo}`)
      console.log(`      Status: ${produto.status}`)
    })
    
    // Resumo final
    console.log('\n📈 RESUMO:')
    console.log(`   Total de produtos com "vibrador": ${(await prisma.produto.count({ where: { nome: { contains: 'vibrador', mode: 'insensitive' } } }))}`)
    console.log(`   Total de produtos com "45": ${(await prisma.produto.count({ where: { nome: { contains: '45', mode: 'insensitive' } } }))}`)
    console.log(`   Total de produtos com "5": ${(await prisma.produto.count({ where: { nome: { contains: '5', mode: 'insensitive' } } }))}`)
    console.log(`   Total de produtos com "mangote": ${(await prisma.produto.count({ where: { nome: { contains: 'mangote', mode: 'insensitive' } } }))}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVibrador45x5()
