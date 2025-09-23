import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function criarClienteRsmaq() {
  try {
    console.log('👤 Criando cliente RSMAQ...')

    const email = 'contacto@rsmaq.com'
    const nome = 'RSMAQ Cliente'
    const telefone = '(11) 99999-9999' // Telefone padrão

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      console.log(`⚠️ Usuário já existe: ${email}`)
      console.log(`   - ID: ${usuarioExistente.id}`)
      console.log(`   - Nome: ${usuarioExistente.nome}`)
      console.log(`   - Role: ${usuarioExistente.role}`)
      console.log(`   - Status: ${usuarioExistente.status}`)
      return
    }

    // Criar usuário
    console.log('📝 Criando usuário...')
    const usuario = await prisma.user.create({
      data: {
        clerkId: `rsmaq_${Date.now()}`, // Clerk ID temporário
        email: email,
        nome: nome,
        telefone: telefone,
        role: 'CLIENTE',
        status: 'APROVADO', // Aprovar automaticamente
        ativo: true,
        aprovadoPor: 'system', // Sistema
        aprovadoEm: new Date()
      }
    })

    console.log(`✅ Usuário criado: ${usuario.email}`)

    // Criar perfil de cliente
    console.log('👥 Criando perfil de cliente...')
    const cliente = await prisma.cliente.create({
      data: {
        userId: usuario.id,
        empresa: 'RSMAQ',
        endereco: 'Endereço não informado',
        cidade: 'Cidade não informada',
        estado: 'SP',
        cep: '00000-000',
        observacoes: 'Cliente criado automaticamente via script',
        ativo: true
      }
    })

    console.log(`✅ Perfil de cliente criado: ${cliente.id}`)

    // Buscar vendedor padrão para associar
    console.log('🔗 Associando a vendedor padrão...')
    const vendedorPadrao = await prisma.vendedor.findFirst({
      where: { ativo: true },
      include: { user: true }
    })

    if (vendedorPadrao) {
      await prisma.cliente.update({
        where: { id: cliente.id },
        data: { vendedorId: vendedorPadrao.id }
      })
      console.log(`✅ Associado ao vendedor: ${vendedorPadrao.user.nome}`)
    } else {
      console.log('⚠️ Nenhum vendedor ativo encontrado')
    }

    console.log('\n🎉 Cliente RSMAQ criado com sucesso!')
    console.log('📋 Detalhes:')
    console.log(`   - Email: ${usuario.email}`)
    console.log(`   - Nome: ${usuario.nome}`)
    console.log(`   - Role: ${usuario.role}`)
    console.log(`   - Status: ${usuario.status}`)
    console.log(`   - Ativo: ${usuario.ativo}`)
    console.log(`   - Empresa: ${cliente.empresa}`)
    console.log('\n🔐 Credenciais:')
    console.log(`   - Email: ${email}`)
    console.log(`   - Senha: Rsmaq@2025$`)
    console.log('\n💡 O usuário pode fazer login com essas credenciais no sistema!')

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
criarClienteRsmaq()
  .then(() => {
    console.log('✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
