import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanOrcamentosProdutos() {
  try {
    console.log('🗑️  Iniciando limpeza de orçamentos e produtos...')

    // 1. Deletar itens de orçamento primeiro (por causa das foreign keys)
    console.log('🔸 Deletando itens de orçamentos...')
    const orcamentoItensDeleted = await prisma.orcamentoItem.deleteMany({})
    console.log(`✅ ${orcamentoItensDeleted.count} itens de orçamentos deletados`)

    // 2. Deletar orçamentos
    console.log('🔸 Deletando orçamentos...')
    const orcamentosDeleted = await prisma.orcamento.deleteMany({})
    console.log(`✅ ${orcamentosDeleted.count} orçamentos deletados`)

    // 3. Deletar produtos
    console.log('🔸 Deletando produtos...')
    const produtosDeleted = await prisma.produto.deleteMany({})
    console.log(`✅ ${produtosDeleted.count} produtos deletados`)

    // 4. Deletar categorias (se não quiser manter)
    console.log('🔸 Deletando categorias...')
    const categoriasDeleted = await prisma.categoria.deleteMany({})
    console.log(`✅ ${categoriasDeleted.count} categorias deletadas`)

    console.log('')
    console.log('🎉 Limpeza concluída com sucesso!')
    console.log('📋 Mantido:')
    console.log('   - Usuários')
    console.log('   - Empresas')
    console.log('   - Vendedores')
    console.log('   - Clientes')
    console.log('   - CRM Items')
    console.log('')
    console.log('🗑️  Deletado:')
    console.log('   - Orçamentos e seus itens')
    console.log('   - Produtos')
    console.log('   - Categorias')

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanOrcamentosProdutos()
}

export default cleanOrcamentosProdutos
