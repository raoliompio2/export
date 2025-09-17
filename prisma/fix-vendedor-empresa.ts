import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando dados do banco...')

  // 1. Buscar usuário admin
  const adminUser = await prisma.user.findFirst({
    where: { email: 'rafael.popeartstudio@gmail.com' },
    include: { 
      vendedorProfile: {
        include: { 
          empresas: {
            include: { empresa: true }
          }
        }
      },
      clienteProfile: true
    }
  })

  console.log('👤 Usuário admin encontrado:', {
    id: adminUser?.id,
    email: adminUser?.email,
    role: adminUser?.role,
    hasVendedor: !!adminUser?.vendedorProfile,
    empresasVinculadas: adminUser?.vendedorProfile?.empresas?.length || 0,
    primeiraEmpresa: adminUser?.vendedorProfile?.empresas?.[0]?.empresa?.nome
  })

  // 2. Buscar empresas
  const empresas = await prisma.empresa.findMany({
    include: {
      vendedores: true,
      produtos: true,
      orcamentos: true
    }
  })

  console.log('🏢 Empresas encontradas:', empresas.length)
  empresas.forEach(empresa => {
    console.log(`  - ${empresa.nome} (${empresa.cnpj})`)
    console.log(`    Vendedores: ${empresa.vendedores.length}`)
    console.log(`    Produtos: ${empresa.produtos.length}`)
    console.log(`    Orçamentos: ${empresa.orcamentos.length}`)
  })

  // 3. Se admin não tem vendedor ou vendedor não tem empresa, corrigir
  if (!adminUser) {
    console.log('❌ Usuário admin não encontrado!')
    return
  }

  let needsUpdate = false

  if (!adminUser.vendedorProfile) {
    console.log('⚠️  Admin não tem perfil de vendedor')
    needsUpdate = true
  } else if (!adminUser.vendedorProfile.empresas || adminUser.vendedorProfile.empresas.length === 0) {
    console.log('⚠️  Vendedor não tem empresa vinculada')
    needsUpdate = true
  }

  if (needsUpdate && empresas.length > 0) {
    console.log('🔧 Corrigindo dados...')

    const empresaPadrao = empresas[0]
    
    // Criar ou atualizar perfil vendedor
    const vendedor = await prisma.vendedor.upsert({
      where: { userId: adminUser.id },
      update: {
        comissao: 5,
        meta: 10000,
        ativo: true
      },
      create: {
        userId: adminUser.id,
        comissao: 5,
        meta: 10000,
        ativo: true
      }
    })

    // Vincular vendedor à empresa
    await prisma.vendedorEmpresa.upsert({
      where: {
        vendedorId_empresaId: {
          vendedorId: vendedor.id,
          empresaId: empresaPadrao.id
        }
      },
      update: {
        ativo: true,
        comissao: 5,
        meta: 10000
      },
      create: {
        vendedorId: vendedor.id,
        empresaId: empresaPadrao.id,
        ativo: true,
        comissao: 5,
        meta: 10000
      }
    })

    console.log(`✅ Vendedor vinculado à empresa: ${empresaPadrao.nome}`)
  }

  // 4. Verificar orçamentos
  const orcamentos = await prisma.orcamento.findMany({
    include: {
      empresa: true,
      vendedor: {
        include: { user: true }
      }
    }
  })

  console.log(`💰 Orçamentos encontrados: ${orcamentos.length}`)
  
  const orcamentosSemEmpresa = orcamentos.filter(o => !o.empresaId)
  if (orcamentosSemEmpresa.length > 0) {
    console.log(`⚠️  ${orcamentosSemEmpresa.length} orçamentos sem empresa`)
  }

  console.log('\n✅ Verificação concluída!')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
