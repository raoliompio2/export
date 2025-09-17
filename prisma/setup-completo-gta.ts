import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupCompletoGTA() {
  try {
    console.log('🚀 Iniciando setup completo...')

    // 1. Criar/verificar empresa Vibromak
    console.log('🏢 Criando empresa Vibromak...')
    const vibromak = await prisma.empresa.upsert({
      where: { cnpj: '12.345.678/0001-99' },
      update: {},
      create: {
        nome: 'Vibromak Equipamentos Ltda',
        nomeFantasia: 'Vibromak',
        cnpj: '12.345.678/0001-99',
        email: 'contato@vibromak.com.br',
        telefone: '(14) 3454-1900',
        endereco: 'Avenida Yusaburo Sasazaki, 1900',
        numero: '1900',
        bairro: 'Distrito Industrial Santo Barion',
        cidade: 'Marília',
        estado: 'SP',
        cep: '17512-031',
        corPrimaria: '#1E40AF',
        ativa: true
      }
    })

    // 2. Buscar usuário Pop&Art Studio
    const user = await prisma.user.findFirst({
      where: { email: 'rafael.popeartstudio@gmail.com' },
      include: { vendedorProfile: true }
    })

    if (!user?.vendedorProfile) {
      throw new Error('Usuário vendedor não encontrado')
    }

    // 3. Vincular vendedor à Vibromak se não estiver vinculado
    await prisma.vendedorEmpresa.upsert({
      where: {
        vendedorId_empresaId: {
          vendedorId: user.vendedorProfile.id,
          empresaId: vibromak.id
        }
      },
      update: {},
      create: {
        vendedorId: user.vendedorProfile.id,
        empresaId: vibromak.id,
        ativo: true,
        comissao: 5.0,
        meta: 50000.0
      }
    })

    // 4. Criar cliente G.T.A. COLOMBIA
    console.log('👤 Criando cliente G.T.A. COLOMBIA...')
    const clienteUser = await prisma.user.upsert({
      where: { email: 'paulina@gtacolombia.com' },
      update: {},
      create: {
        nome: 'Paulina',
        email: 'paulina@gtacolombia.com',
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
        cnpj: '81102290889',
        endereco: 'TV 34 A SUR 32 D 13 IN 101',
        cidade: 'Mosquera',
        estado: 'Cundinamarca',
        cep: '250047'
      }
    })

    // 5. Criar categorias
    console.log('📂 Criando categorias...')
    const bombas = await prisma.categoria.upsert({
      where: { nome: 'Bombas' },
      update: {},
      create: { nome: 'Bombas', descricao: 'Bombas e equipamentos de bombeamento' }
    })

    const motovibradores = await prisma.categoria.upsert({
      where: { nome: 'Motovibradores' },
      update: {},
      create: { nome: 'Motovibradores', descricao: 'Motovibradores e equipamentos de vibração' }
    })

    const mangueiras = await prisma.categoria.upsert({
      where: { nome: 'Mangueiras' },
      update: {},
      create: { nome: 'Mangueiras', descricao: 'Mangueiras e acessórios' }
    })

    // 6. Criar produtos
    console.log('📦 Criando produtos...')
    const bomba = await prisma.produto.create({
      data: {
        empresaId: vibromak.id,
        categoriaId: bombas.id,
        nome: 'Bomba Mangote Alumínio 3"',
        codigo: 'BMA-3-10M',
        descricao: 'Bomba mangote de alumínio 3 polegadas\\nComprimento: 10 metros',
        preco: 4088.59,
        moeda: 'BRL',
        peso: 45.5,
        dimensoes: '1.20x0.40x0.30',
        origem: 'Nacional',
        status: 'ATIVO'
      }
    })

    const motovibrador = await prisma.produto.create({
      data: {
        empresaId: vibromak.id,
        categoriaId: motovibradores.id,
        nome: 'Motovibrador',
        codigo: 'MV-HONDA-5.5',
        descricao: 'Motovibrador com motor Honda 5,5 cv\\nAlta performance e durabilidade',
        preco: 3025.40,
        moeda: 'BRL',
        peso: 28.0,
        dimensoes: '0.80x0.50x0.40',
        origem: 'Nacional',
        status: 'ATIVO'
      }
    })

    const mangueira = await prisma.produto.create({
      data: {
        empresaId: vibromak.id,
        categoriaId: mangueiras.id,
        nome: 'Mangueira de Vazão Azul',
        codigo: 'MVA-50M',
        descricao: 'Mangueira de vazão azul de alta resistência\\nComprimento: 50 metros',
        preco: 2500.00,
        moeda: 'BRL',
        peso: 15.2,
        dimensoes: '0.30x0.30x1.50',
        origem: 'Nacional',
        status: 'ATIVO'
      }
    })

    // 7. Criar orçamento
    console.log('📋 Criando orçamento...')
    const orcamento = await prisma.orcamento.create({
      data: {
        numero: 'ORC-2025-001',
        titulo: 'Equipamentos Vibromak para G.T.A. COLOMBIA',
        clienteId: cliente.id,
        empresaId: vibromak.id,
        vendedorId: user.vendedorProfile.id,
        status: 'PENDENTE',
        moeda: 'USD',
        subtotal: 17737.99,
        desconto: 0,
        frete: 1941.45,
        total: 19679.44,
        validadeAte: new Date('2025-09-26'),
        observacoes: 'A Vibromak NÃO é responsável pelo desembaraço aduaneiro. O cliente deve realizar o desembaraço e retirar a carga no porto de destino.',
        condicoesPagamento: 'Quantidade: 10 unidades de cada artículo | Transporte: CIF | Pago: Al contado',
        prazoEntrega: '19/09/2025',
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

    // 8. Criar itens do orçamento
    await Promise.all([
      prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: bomba.id,
          quantidade: 10,
          precoUnit: 754.35,
          desconto: 0,
          total: 7543.52
        }
      }),
      prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: motovibrador.id,
          quantidade: 10,
          precoUnit: 558.19,
          desconto: 0,
          total: 5581.92
        }
      }),
      prisma.orcamentoItem.create({
        data: {
          orcamentoId: orcamento.id,
          produtoId: mangueira.id,
          quantidade: 10,
          precoUnit: 461.25,
          desconto: 0,
          total: 4612.55
        }
      })
    ])

    console.log('')
    console.log('🎉 Setup completo finalizado!')
    console.log(`✅ Empresa: ${vibromak.nome}`)
    console.log(`✅ Cliente: ${clienteUser.nome} (${cliente.empresa})`)
    console.log(`✅ Produtos: 3 criados`)
    console.log(`✅ Orçamento: ${orcamento.numero} - USD ${orcamento.total}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupCompletoGTA()
