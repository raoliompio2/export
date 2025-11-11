import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarBanco() {
  try {
    console.log('🔍 Verificando conexão com o banco de dados...\n')
    
    // Tentar obter a URL do banco (sem exibir credenciais completas)
    const databaseUrl = process.env.DATABASE_URL
    if (databaseUrl) {
      // Mascarar a senha na URL
      const urlMasked = databaseUrl.replace(
        /:([^:@]+)@/,
        ':***@'
      )
      console.log('📊 DATABASE_URL:', urlMasked)
      
      // Tentar identificar se é produção ou desenvolvimento
      const isProduction = databaseUrl.includes('prod') || 
                          databaseUrl.includes('production') ||
                          databaseUrl.includes('amazonaws.com') ||
                          databaseUrl.includes('neon.tech') ||
                          databaseUrl.includes('supabase.co') ||
                          databaseUrl.includes('vercel-storage.com')
      
      const isLocal = databaseUrl.includes('localhost') || 
                     databaseUrl.includes('127.0.0.1') ||
                     databaseUrl.includes('5432')
      
      if (isProduction) {
        console.log('⚠️  AMBIENTE: PRODUÇÃO')
      } else if (isLocal) {
        console.log('✅ AMBIENTE: DESENVOLVIMENTO (Local)')
      } else {
        console.log('❓ AMBIENTE: Desconhecido ou Staging')
      }
      
      console.log('')
    } else {
      console.log('❌ DATABASE_URL não encontrada nas variáveis de ambiente!')
      console.log('')
    }
    
    // Tentar conectar e obter informações do banco
    console.log('🔌 Testando conexão...')
    const result = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `
    
    if (result && result.length > 0) {
      console.log('✅ Conexão estabelecida com sucesso!')
      console.log('📋 Versão do PostgreSQL:', result[0].version.split(',')[0])
      console.log('')
    }
    
    // Verificar algumas tabelas para identificar o ambiente
    console.log('📊 Verificando dados do banco...')
    const userCount = await prisma.user.count()
    const produtoCount = await prisma.produto.count()
    const empresaCount = await prisma.empresa.count()
    const orcamentoCount = await prisma.orcamento.count()
    
    console.log(`👥 Usuários: ${userCount}`)
    console.log(`📦 Produtos: ${produtoCount}`)
    console.log(`🏢 Empresas: ${empresaCount}`)
    console.log(`📄 Orçamentos: ${orcamentoCount}`)
    console.log('')
    
    if (userCount > 10 || produtoCount > 50 || orcamentoCount > 20) {
      console.log('⚠️  ATENÇÃO: Banco parece ser de PRODUÇÃO (muitos dados)')
    } else if (userCount === 0 && produtoCount === 0) {
      console.log('✅ Banco parece ser de DESENVOLVIMENTO (vazio ou poucos dados)')
    } else {
      console.log('❓ Banco pode ser de desenvolvimento ou staging')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error)
    if (error instanceof Error) {
      console.error('Mensagem:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

verificarBanco()

