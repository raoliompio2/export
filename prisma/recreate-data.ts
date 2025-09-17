import { PrismaClient, UserRole, ProdutoStatus, OrcamentoStatus, CrmStatus, CrmPrioridade } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏗️  Recriando dados com sistema de empresas...')

  try {
    // 1. Criar empresa padrão
    console.log('🏢 Criando empresa padrão...')
    const empresa = await prisma.empresa.create({
      data: {
        nome: 'Export Representações Ltda',
        nomeFantasia: 'Export Rep',
        cnpj: '12.345.678/0001-90',
        inscricaoEstadual: '123456789',
        email: 'contato@exportrep.com.br',
        telefone: '(11) 9999-9999',
        website: 'https://exportrep.com.br',
        endereco: 'Rua das Exportações, 123',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000',
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        logo: 'https://via.placeholder.com/200x80/3B82F6/FFFFFF?text=EXPORT+REP',
        corPrimaria: '#3B82F6'
      }
    })
    console.log(`✅ Empresa criada: ${empresa.nome}`)

    // 2. Criar usuário admin
    console.log('👤 Criando usuário administrador...')
    const adminUser = await prisma.user.create({
      data: {
        clerkId: 'admin_clerk_id_' + Date.now(),
        email: 'rafael.popeartstudio@gmail.com',
        nome: 'Rafael Silva',
        role: UserRole.ADMIN,
        avatar: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=RA',
        ativo: true
      }
    })

    // 3. Criar perfil vendedor para o admin
    console.log('💼 Criando perfil vendedor...')
    const vendedor = await prisma.vendedor.create({
      data: {
        userId: adminUser.id,
        empresaId: empresa.id,
        comissao: 5.0,
        meta: 10000.0,
        ativo: true
      }
    })

    // 4. Criar categorias
    console.log('📂 Criando categorias...')
    const categorias = await Promise.all([
      prisma.categoria.create({
        data: {
          nome: 'Eletrônicos',
          descricao: 'Produtos eletrônicos e tecnologia',
          ativa: true
        }
      }),
      prisma.categoria.create({
        data: {
          nome: 'Informática',
          descricao: 'Equipamentos de informática',
          ativa: true
        }
      }),
      prisma.categoria.create({
        data: {
          nome: 'Escritório',
          descricao: 'Material de escritório',
          ativa: true
        }
      })
    ])

    // 5. Criar produtos
    console.log('📦 Criando produtos...')
    const produtos = await Promise.all([
      prisma.produto.create({
        data: {
          codigo: 'ELEC-001',
          nome: 'Notebook Business Pro',
          descricao: 'Notebook para uso empresarial',
          categoriaId: categorias[1].id,
          empresaId: empresa.id,
          preco: 2500.00,
          precoPromocional: 2200.00,
          unidade: 'UN',
          estoque: 15,
          estoqueMinimo: 5,
          peso: 2.1,
          dimensoes: '35x25x2cm',
          status: ProdutoStatus.ATIVO,
          destaque: true
        }
      }),
      prisma.produto.create({
        data: {
          codigo: 'ELEC-002',
          nome: 'Mouse Wireless Premium',
          descricao: 'Mouse sem fio de alta precisão',
          categoriaId: categorias[1].id,
          empresaId: empresa.id,
          preco: 89.90,
          unidade: 'UN',
          estoque: 50,
          estoqueMinimo: 10,
          peso: 0.1,
          status: ProdutoStatus.ATIVO
        }
      }),
      prisma.produto.create({
        data: {
          codigo: 'ESC-001',
          nome: 'Caderno Executivo',
          descricao: 'Caderno de couro para executivos',
          categoriaId: categorias[2].id,
          empresaId: empresa.id,
          preco: 45.50,
          unidade: 'UN',
          estoque: 30,
          estoqueMinimo: 5,
          peso: 0.3,
          status: ProdutoStatus.ATIVO
        }
      })
    ])

    // 6. Criar clientes
    console.log('👥 Criando clientes...')
    const clientes = []
    
    for (let i = 1; i <= 3; i++) {
      const clienteUser = await prisma.user.create({
        data: {
          clerkId: `cliente_${i}_${Date.now()}`,
          email: `cliente${i}@empresa.com.br`,
          nome: `Cliente Empresa ${i}`,
          role: UserRole.CLIENTE,
          telefone: `(11) 9999-000${i}`,
          ativo: true
        }
      })

      const cliente = await prisma.cliente.create({
        data: {
          userId: clienteUser.id,
          vendedorId: vendedor.id,
          empresa: `Empresa Cliente ${i} Ltda`,
          cnpj: `12.345.${i.toString().padStart(3, '0')}/0001-${i.toString().padStart(2, '0')}`,
          endereco: `Rua Cliente ${i}, 100`,
          cidade: 'São Paulo',
          estado: 'SP',
          cep: `0100${i}-000`,
          observacoes: `Cliente número ${i} criado via migração`
        }
      })

      clientes.push(cliente)
    }

    // 7. Criar orçamentos
    console.log('💰 Criando orçamentos...')
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i]
      
      const orcamento = await prisma.orcamento.create({
        data: {
          numero: `ORC-${Date.now()}-${i + 1}`,
          titulo: `Orçamento para ${cliente.empresa}`,
          clienteId: cliente.id,
          vendedorId: vendedor.id,
          empresaId: empresa.id,
          userId: cliente.userId,
          descricao: `Orçamento detalhado para ${cliente.empresa}`,
          status: i === 0 ? OrcamentoStatus.APROVADO : i === 1 ? OrcamentoStatus.ENVIADO : OrcamentoStatus.RASCUNHO,
          subtotal: 1000.00,
          desconto: 50.00,
          total: 950.00,
          frete: 0.00,
          validadeAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          condicoesPagamento: '30 dias',
          prazoEntrega: '7 dias úteis',
          observacoes: 'Orçamento sujeito a alterações'
        }
      })

      // Adicionar itens ao orçamento
      await prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: produtos[i % produtos.length].id,
          quantidade: 2,
          precoUnit: 500.00,
          desconto: 5.0,
          total: 950.00
        }
      })
    }

    // 8. Criar itens CRM
    console.log('🤝 Criando itens CRM...')
    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i]
      
      await prisma.crmItem.create({
        data: {
          titulo: `Follow-up cliente ${cliente.empresa}`,
          descricao: `Acompanhamento pós-venda para ${cliente.empresa}`,
          clienteId: cliente.id,
          vendedorId: vendedor.id,
          status: i === 0 ? CrmStatus.RESOLVIDO : i === 1 ? CrmStatus.EM_ANDAMENTO : CrmStatus.ABERTO,
          prioridade: i === 0 ? CrmPrioridade.BAIXA : i === 1 ? CrmPrioridade.ALTA : CrmPrioridade.MEDIA,
          dataVencimento: i > 0 ? new Date(Date.now() + (i * 7) * 24 * 60 * 60 * 1000) : null
        }
      })
    }

    console.log('\n🎉 Migração concluída com sucesso!')
    console.log(`✅ Empresa: ${empresa.nome}`)
    console.log(`✅ Admin: ${adminUser.email}`)
    console.log(`✅ ${categorias.length} categorias`)
    console.log(`✅ ${produtos.length} produtos`)
    console.log(`✅ ${clientes.length} clientes`)
    console.log(`✅ Orçamentos e CRM criados`)

  } catch (error) {
    console.error('❌ Erro durante recriação:', error)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
