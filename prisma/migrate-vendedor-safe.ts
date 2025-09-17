import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateVendedorEmpresa() {
  try {
    console.log('🔄 Iniciando migração de vendedores...')

    // 1. Buscar todos os vendedores existentes
    const vendedores = await prisma.$queryRaw`
      SELECT id, "empresaId", comissao, meta, ativo 
      FROM vendedores 
      WHERE "empresaId" IS NOT NULL
    ` as any[]

    console.log(`📊 Encontrados ${vendedores.length} vendedores para migrar`)

    // 2. Criar registros na nova tabela VendedorEmpresa
    for (const vendedor of vendedores) {
      const existingRelation = await prisma.$queryRaw`
        SELECT id FROM vendedor_empresas 
        WHERE vendedor_id = ${vendedor.id} AND empresa_id = ${vendedor.empresaId}
      ` as any[]

      if (existingRelation.length === 0) {
        await prisma.$queryRaw`
          INSERT INTO vendedor_empresas (id, vendedor_id, empresa_id, ativo, comissao, meta, created_at, updated_at)
          VALUES (
            've_' || ${vendedor.id} || '_' || ${vendedor.empresaId},
            ${vendedor.id},
            ${vendedor.empresaId},
            ${vendedor.ativo || true},
            ${vendedor.comissao || 0},
            ${vendedor.meta || 0},
            NOW(),
            NOW()
          )
        `
        console.log(`✅ Migrado vendedor ${vendedor.id} -> empresa ${vendedor.empresaId}`)
      } else {
        console.log(`⚠️  Relação já existe: vendedor ${vendedor.id} -> empresa ${vendedor.empresaId}`)
      }
    }

    // 3. Atualizar orçamentos existentes
    await prisma.$queryRaw`
      UPDATE orcamentos 
      SET vendedor_empresa_id = (
        SELECT ve.id 
        FROM vendedor_empresas ve 
        WHERE ve.vendedor_id = orcamentos.vendedor_id 
        AND ve.empresa_id = orcamentos.empresa_id 
        LIMIT 1
      )
      WHERE vendedor_empresa_id IS NULL
    `

    console.log('✅ Orçamentos atualizados com sucesso')
    console.log('🎉 Migração concluída! Agora você pode executar: npx prisma db push --accept-data-loss')

  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateVendedorEmpresa()
