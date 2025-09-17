import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function populateRealData() {
  try {
    console.log('🚀 Iniciando população com dados reais...')

    // 1. Criar categorias
    console.log('📂 Criando categorias...')
    const categorias = await Promise.all([
      prisma.categoria.upsert({
        where: { nome: 'Eletrônicos' },
        update: {},
        create: {
          nome: 'Eletrônicos',
          descricao: 'Produtos eletrônicos e tecnologia',
          ativa: true
        }
      }),
      prisma.categoria.upsert({
        where: { nome: 'Autopeças' },
        update: {},
        create: {
          nome: 'Autopeças',
          descricao: 'Peças e acessórios automotivos',
          ativa: true
        }
      }),
      prisma.categoria.upsert({
        where: { nome: 'Ferramentas' },
        update: {},
        create: {
          nome: 'Ferramentas',
          descricao: 'Ferramentas e equipamentos',
          ativa: true
        }
      }),
      prisma.categoria.upsert({
        where: { nome: 'Casa e Jardim' },
        update: {},
        create: {
          nome: 'Casa e Jardim',
          descricao: 'Produtos para casa e jardim',
          ativa: true
        }
      })
    ])

    // 2. Criar empresas
    console.log('🏢 Criando empresas...')
    const empresas = await Promise.all([
      prisma.empresa.upsert({
        where: { cnpj: '12.345.678/0001-99' },
        update: {},
        create: {
          nome: 'TechExport Ltda',
          nomeFantasia: 'TechExport',
          cnpj: '12.345.678/0001-99',
          inscricaoEstadual: '123456789',
          email: 'contato@techexport.com.br',
          telefone: '(11) 3456-7890',
          website: 'https://www.techexport.com.br',
          endereco: 'Rua das Flores, 123',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567',
          banco: 'Banco do Brasil',
          agencia: '1234-5',
          conta: '12345-6',
          corPrimaria: '#2563EB',
          ativa: true
        }
      }),
      prisma.empresa.upsert({
        where: { cnpj: '98.765.432/0001-11' },
        update: {},
        create: {
          nome: 'AutoParts Brasil S.A.',
          nomeFantasia: 'AutoParts',
          cnpj: '98.765.432/0001-11',
          inscricaoEstadual: '987654321',
          email: 'vendas@autoparts.com.br',
          telefone: '(11) 2345-6789',
          website: 'https://www.autoparts.com.br',
          endereco: 'Avenida Industrial, 456',
          numero: '456',
          bairro: 'Industrial',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '04567-890',
          banco: 'Itaú',
          agencia: '4567-8',
          conta: '45678-9',
          corPrimaria: '#DC2626',
          ativa: true
        }
      }),
      prisma.empresa.upsert({
        where: { cnpj: '11.222.333/0001-44' },
        update: {},
        create: {
          nome: 'Ferramentas Pro Indústria',
          nomeFantasia: 'Ferramentas Pro',
          cnpj: '11.222.333/0001-44',
          email: 'comercial@ferramentaspro.com.br',
          telefone: '(11) 3333-4444',
          endereco: 'Rua dos Operários, 789',
          numero: '789',
          bairro: 'Vila Industrial',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '05678-123',
          corPrimaria: '#059669',
          ativa: true
        }
      })
    ])

    // 3. Criar produtos
    console.log('📦 Criando produtos...')
    const produtos = [
      {
        codigo: 'TECH001',
        nome: 'Smartphone Samsung Galaxy A54',
        descricao: 'Smartphone com tela de 6.4", 128GB, 6GB RAM, câmera tripla 50MP',
        categoriaId: categorias[0].id,
        empresaId: empresas[0].id,
        preco: 1299.99,
        precoPromocional: 1199.99,
        unidade: 'UN',
        estoque: 50,
        estoqueMinimo: 10,
        peso: 0.202,
        dimensoes: '158.2 x 76.7 x 8.2 mm',
        imagens: ['https://images.samsung.com/is/image/samsung/p6pim/br/sm-a546ezkqzto/gallery/br-galaxy-a54-5g-sm-a546e-447253-sm-a546ezkqzto-535285080'],
        status: 'ATIVO',
        destaque: true
      },
      {
        codigo: 'AUTO001',
        nome: 'Filtro de Óleo Tecfil PSL140',
        descricao: 'Filtro de óleo para motores 1.0, 1.4 e 1.6 - Volkswagen, Ford, Chevrolet',
        categoriaId: categorias[1].id,
        empresaId: empresas[1].id,
        preco: 29.90,
        unidade: 'UN',
        estoque: 200,
        estoqueMinimo: 50,
        peso: 0.3,
        dimensoes: '10 x 8 x 8 cm',
        status: 'ATIVO',
        destaque: false
      },
      {
        codigo: 'FERR001',
        nome: 'Furadeira de Impacto Bosch GSB 450 RE',
        descricao: 'Furadeira de impacto 450W, mandril 13mm, velocidade variável',
        categoriaId: categorias[2].id,
        empresaId: empresas[2].id,
        preco: 189.90,
        precoPromocional: 169.90,
        unidade: 'UN',
        estoque: 25,
        estoqueMinimo: 5,
        peso: 1.5,
        dimensoes: '25 x 8 x 20 cm',
        status: 'ATIVO',
        destaque: true
      },
      {
        codigo: 'CASA001',
        nome: 'Conjunto de Panelas Antiaderente Tramontina',
        descricao: 'Conjunto com 5 peças - panelas 16, 18, 20cm + frigideiras 20, 24cm',
        categoriaId: categorias[3].id,
        empresaId: empresas[0].id,
        preco: 299.90,
        precoPromocional: 249.90,
        unidade: 'CJ',
        estoque: 15,
        estoqueMinimo: 3,
        peso: 3.2,
        dimensoes: '30 x 30 x 15 cm',
        status: 'ATIVO',
        destaque: false
      }
    ]

    for (const produto of produtos) {
      await prisma.produto.upsert({
        where: { codigo: produto.codigo },
        update: produto,
        create: produto
      })
    }

    console.log('✅ População com dados reais concluída!')
    console.log(`📊 Criados: ${categorias.length} categorias, ${empresas.length} empresas, ${produtos.length} produtos`)

  } catch (error) {
    console.error('❌ Erro na população:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateRealData()
