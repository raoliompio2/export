import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function atualizarEstoqueVibromak() {
  try {
    console.log('📦 Atualizando estoque dos produtos Vibromak para 999...')

    // Buscar empresa Vibromak
    const empresa = await prisma.empresa.findFirst({
      where: {
        OR: [
          { nome: { contains: 'Vibromak', mode: 'insensitive' } },
          { nomeFantasia: { contains: 'Vibromak', mode: 'insensitive' } }
        ]
      }
    })

    if (!empresa) {
      throw new Error('❌ Empresa Vibromak não encontrada no banco de dados!')
    }

    console.log(`✅ Empresa encontrada: ${empresa.nome}`)

    // Atualizar estoque de todos os produtos da Vibromak
    const resultado = await prisma.produto.updateMany({
      where: {
        empresaId: empresa.id
      },
      data: {
        estoque: 999,
        estoqueMinimo: 10 // Estoque mínimo padrão
      }
    })

    console.log(`✅ Estoque atualizado com sucesso!`)
    console.log(`📊 Produtos atualizados: ${resultado.count}`)
    console.log(`📦 Novo estoque: 999 unidades`)
    console.log(`⚠️ Estoque mínimo: 10 unidades`)

    // Verificar alguns produtos para confirmar
    const produtosExemplo = await prisma.produto.findMany({
      where: {
        empresaId: empresa.id
      },
      select: {
        codigo: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true
      },
      take: 5
    })

    console.log('\n📋 Exemplos de produtos atualizados:')
    produtosExemplo.forEach(produto => {
      console.log(`   ${produto.codigo} - ${produto.nome} - Estoque: ${produto.estoque}`)
    })

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
atualizarEstoqueVibromak()
  .then(() => {
    console.log('✅ Script de estoque executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
