import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cadastrarGTAColombia() {
  try {
    console.log('🏢 Cadastrando empresa G.T.A. COLOMBIA S.A.S...')

    // 1. Buscar o usuário Pop&Art Studio
    const user = await prisma.user.findFirst({
      where: { email: 'rafael.popeartstudio@gmail.com' },
      include: { 
        vendedorProfile: true,
        clienteProfile: true 
      }
    })

    if (!user) {
      throw new Error('Usuário Pop&Art Studio não encontrado')
    }

    // 2. Buscar a empresa Vibromak
    const vibromak = await prisma.empresa.findFirst({
      where: { nome: { contains: 'Vibromak' } }
    })

    if (!vibromak) {
      throw new Error('Empresa Vibromak não encontrada')
    }

    // 3. Criar cliente G.T.A. COLOMBIA
    console.log('👤 Criando cliente G.T.A. COLOMBIA...')
    const clienteUser = await prisma.user.upsert({
      where: { email: 'export@vibromak.com.br' },
      update: {},
      create: {
        clerkId: 'user_gta_colombia_paulina',
        nome: 'Paulina',
        email: 'export@vibromak.com.br',
        telefone: '+57 (1) 234-5678',
        role: 'CLIENTE',
        ativo: true
      }
    })

    const cliente = await prisma.cliente.upsert({
      where: { userId: clienteUser.id },
      update: {},
      create: {
        userId: clienteUser.id,
        empresa: 'G.T.A. COLOMBIA S.A.S',
        cnpj: '81102290889', // RUT colombiano
        endereco: 'TV 34 A SUR 32 D 13 IN 101',
        cidade: 'Mosquera',
        estado: 'Cundinamarca',
        cep: '250047',
        pais: 'Colombia'
      }
    })

    // 4. Criar categorias
    console.log('📂 Criando categorias...')
    const categorias = await Promise.all([
      prisma.categoria.upsert({
        where: { nome: 'Bombas' },
        update: {},
        create: {
          nome: 'Bombas',
          descricao: 'Bombas e equipamentos de bombeamento'
        }
      }),
      prisma.categoria.upsert({
        where: { nome: 'Motovibradores' },
        update: {},
        create: {
          nome: 'Motovibradores',
          descricao: 'Motovibradores e equipamentos de vibração'
        }
      }),
      prisma.categoria.upsert({
        where: { nome: 'Mangueiras' },
        update: {},
        create: {
          nome: 'Mangueiras',
          descricao: 'Mangueiras e acessórios'
        }
      })
    ])

    // 5. Criar produtos
    console.log('📦 Criando produtos...')
    const produtos = await Promise.all([
      prisma.produto.create({
        data: {
          empresaId: vibromak.id,
          categoriaId: categorias[0].id, // Bombas
          nome: 'Bomba Mangote Alumínio 3"',
          codigo: 'BMA-3-10M',
          descricao: 'Bomba mangote de alumínio 3 polegadas\nComprimento: 10 metros',
          preco: 4088.59,
          moeda: 'BRL',
          peso: 45.5,
          dimensoes: '1.20x0.40x0.30',
          origem: 'Nacional',
          status: 'ATIVO',
          destaque: true
        }
      }),
      prisma.produto.create({
        data: {
          empresaId: vibromak.id,
          categoriaId: categorias[1].id, // Motovibradores
          nome: 'Motovibrador',
          codigo: 'MV-HONDA-5.5',
          descricao: 'Motovibrador com motor Honda 5,5 cv\nAlta performance e durabilidade',
          preco: 3025.40,
          moeda: 'BRL',
          peso: 28.0,
          dimensoes: '0.80x0.50x0.40',
          origem: 'Nacional',
          status: 'ATIVO',
          destaque: true
        }
      }),
      prisma.produto.create({
        data: {
          empresaId: vibromak.id,
          categoriaId: categorias[2].id, // Mangueiras
          nome: 'Mangueira de Vazão Azul',
          codigo: 'MVA-50M',
          descricao: 'Mangueira de vazão azul de alta resistência\nComprimento: 50 metros',
          preco: 2500.00,
          moeda: 'BRL',
          peso: 15.2,
          dimensoes: '0.30x0.30x1.50',
          origem: 'Nacional',
          status: 'ATIVO',
          destaque: false
        }
      })
    ])

    // 6. Criar orçamento
    console.log('📋 Criando orçamento...')
    const orcamento = await prisma.orcamento.create({
      data: {
        numero: 'ORC-2025-001',
        titulo: 'Equipamentos Vibromak para G.T.A. COLOMBIA',
        clienteId: cliente.id,
        empresaId: vibromak.id,
        vendedorId: user.vendedorProfile!.id,
        status: 'PENDENTE',
        moeda: 'BRL',
        subtotal: 96139.90,
        desconto: 0,
        frete: 0,
        total: 96139.90,
        validadeAte: new Date('2025-09-26'),
        observacoes: 'A Vibromak NÃO é responsável pelo desembaraço aduaneiro. O cliente deve realizar o desembaraço e retirar a carga no porto de destino.',
        condicoesPagamento: 'Quantidade: 10 unidades de cada artículo | Transporte: CIF | Pago: Al contado',
        prazoEntrega: '19/09/2025',
        
        // Campos de exportação
        incoterm: 'CIF',
        portoDestino: 'Cartagena',
        tipoFrete: 'Marítimo + Terrestre',
        diasTransito: 13,
        pesoBruto: 528.00,
        volumeTotal: 1.92,
        numeroCaixas: 2,
        freteInternacional: 132.48,
        seguroInternacional: 53.52,
        taxasDesaduanagem: 1755.45
      }
    })

    // 7. Criar itens do orçamento
    console.log('📦 Criando itens do orçamento...')
    await Promise.all([
      prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: produtos[0].id, // Bomba
          quantidade: 10,
          precoUnit: 4088.59,
          desconto: 0,
          total: 40885.90
        }
      }),
      prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: produtos[1].id, // Motovibrador
          quantidade: 10,
          precoUnit: 3025.40,
          desconto: 0,
          total: 30254.00
        }
      }),
      prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: produtos[2].id, // Mangueira
          quantidade: 10,
          precoUnit: 2500.00,
          desconto: 0,
          total: 25000.00
        }
      })
    ])

    console.log('')
    console.log('🎉 Cadastro concluído com sucesso!')
    console.log('📋 Criado:')
    console.log(`   - Cliente: ${clienteUser.nome} (${clienteUser.email})`)
    console.log(`   - Empresa: G.T.A. COLOMBIA S.A.S`)
    console.log(`   - ${categorias.length} categorias`)
    console.log(`   - ${produtos.length} produtos`)
    console.log(`   - Orçamento: ${orcamento.numero} (R$ ${orcamento.total.toLocaleString('pt-BR')})`)
    console.log(`   - ${3} itens no orçamento`)

  } catch (error) {
    console.error('❌ Erro durante o cadastro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cadastrarGTAColombia()
}

export default cadastrarGTAColombia
