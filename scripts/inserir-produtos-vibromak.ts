import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dados dos produtos fornecidos pelo usuário
const produtosData = [
  {
    codigo: "83-VBK 255",
    nome: "VB DE IMERSÃO 25MM X 5MT",
    descricao: "Vibrador de imersão 25mm x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 15.00,
    pesoBruto: 15.10
  },
  {
    codigo: "84-VBK 365",
    nome: "VB DE IMERSÃO 36MM X 5MT",
    descricao: "Vibrador de imersão 36mm x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 16.00,
    pesoBruto: 16.10
  },
  {
    codigo: "85-VBK 465",
    nome: "VB DE IMERSÃO 46MM X 5MT",
    descricao: "Vibrador de imersão 46mm x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 17.00,
    pesoBruto: 17.10
  },
  {
    codigo: "86-VBK 635",
    nome: "VB DE IMERSÃO 63MM X 5MT",
    descricao: "Vibrador de imersão 63mm x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 21.00,
    pesoBruto: 21.10
  },
  {
    codigo: "549-VBA 3516",
    nome: "VB AF 35MM X 1,50MT",
    descricao: "Vibrador de alta frequência 35mm x 1,50 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 6.00,
    pesoBruto: 6.10
  },
  {
    codigo: "483-VBA 3535",
    nome: "VB AF 35MM X 3,50MT",
    descricao: "Vibrador de alta frequência 35mm x 3,50 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 6.00,
    pesoBruto: 6.10
  },
  {
    codigo: "554",
    nome: "MOTOR VBAF 220V",
    descricao: "Motor para vibrador de alta frequência 220V",
    dimensoes: "23 X 31 X 20 CX",
    pesoLiquido: 4.00,
    pesoBruto: 4.50
  },
  {
    codigo: "87 VBP 2512",
    nome: "VB PORTÁTIL 25MM X 1,20MT",
    descricao: "Vibrador portátil 25mm x 1,20 metros",
    dimensoes: "65 X 45 X 9 CX",
    pesoLiquido: 2.00,
    pesoBruto: 2.40
  },
  {
    codigo: "88 VBP 3612",
    nome: "VB PORTÁTIL 36MM X 1,20MT",
    descricao: "Vibrador portátil 36mm x 1,20 metros",
    dimensoes: "65 X 45 X 9 CX",
    pesoLiquido: 4.00,
    pesoBruto: 4.60
  },
  {
    codigo: "422 MEVP",
    nome: "MOTOR PORTÁTIL 220",
    descricao: "Motor portátil 220V",
    dimensoes: "65 X 45 X 9 CX",
    pesoLiquido: 2.00,
    pesoBruto: 2.20
  },
  {
    codigo: "961 BSC 2.0",
    nome: "BOMBA COMPACTA 2\" X 5MT",
    descricao: "Bomba compacta 2\" x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 20.00,
    pesoBruto: 20.10
  },
  {
    codigo: "990 BSS 2.0",
    nome: "BOMBA SUBMERSA 2\" X 5MT",
    descricao: "Bomba submersa 2\" x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 22.00,
    pesoBruto: 22.10
  },
  {
    codigo: "80 BSK 2.5",
    nome: "BOMBA SUBMERSA 2 1/2\" X 5MT",
    descricao: "Bomba submersa 2 1/2\" x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 26.00,
    pesoBruto: 26.10
  },
  {
    codigo: "1440 BSK 3.0",
    nome: "BOMBA SUBMERSA 3\" X 5MT",
    descricao: "Bomba submersa 3\" x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 29.00,
    pesoBruto: 29.10
  },
  {
    codigo: "925 BSA 3.0",
    nome: "BOMBA SUBMERSA ALUMÍNIO 3\" X 5MT",
    descricao: "Bomba submersa de alumínio 3\" x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 22.00,
    pesoBruto: 22.10
  },
  {
    codigo: "989 BSA 2.0",
    nome: "BOMBA SUBMERSA ALUMÍNIO 2\" X 5MT",
    descricao: "Bomba submersa de alumínio 2\" x 5 metros",
    dimensoes: "75 X 8 X 90 SACO",
    pesoLiquido: 22.00,
    pesoBruto: 22.10
  },
  {
    codigo: "1216 MEMD",
    nome: "MOTOR ELETR DI MONOF 1,5CV",
    descricao: "Motor elétrico direto monofásico 1,5CV",
    dimensoes: "45 X 22 X 32 CX",
    pesoLiquido: 22.75,
    pesoBruto: 22.75
  },
  {
    codigo: "1277 METD*",
    nome: "MOTOR ELETR DI TRIF 2,0CV",
    descricao: "Motor elétrico direto trifásico 2,0CV",
    dimensoes: "45 X 22 X 32 CX",
    pesoLiquido: 21.75,
    pesoBruto: 21.75
  },
  {
    codigo: "91 MEM 1.5",
    nome: "MOTOR ELETR MONOF 1,5CV",
    descricao: "Motor elétrico monofásico 1,5CV",
    dimensoes: "41 X 28 X 32 CX",
    pesoLiquido: 21.75,
    pesoBruto: 21.75
  },
  {
    codigo: "192 MEM 2.0",
    nome: "MOTOR ELETR TRIF 2,0CV",
    descricao: "Motor elétrico trifásico 2,0CV",
    dimensoes: "41 X 28 X 32 CX",
    pesoLiquido: 21.75,
    pesoBruto: 21.75
  },
  {
    codigo: "1697 MGK 5.5",
    nome: "MOTOVIB C MOTOR 5,5HP",
    descricao: "Motovibrador com motor 5,5HP",
    dimensoes: "65 X 40 X 50 CX",
    pesoLiquido: 87.00,
    pesoBruto: 87.00
  },
  {
    codigo: "3889",
    nome: "COMPACTADOR C MOTOR",
    descricao: "Compactador com motor",
    dimensoes: "78 X 46 X 1,15",
    pesoLiquido: 60.00,
    pesoBruto: 60.00
  },
  {
    codigo: "1515-VK85",
    nome: "PLACA VK85 C MOTOR 5,5HP",
    descricao: "Placa vibratória VK85 com motor 5,5HP",
    dimensoes: "95 X 55 X 120 CX",
    pesoLiquido: 84.00,
    pesoBruto: 95.00
  },
  {
    codigo: "2697-VK120",
    nome: "PLACA VK120 C MOTOR 5,5HP",
    descricao: "Placa vibratória VK120 com motor 5,5HP",
    dimensoes: "95 X 55 X 120 CX",
    pesoLiquido: 120.00,
    pesoBruto: 130.00
  },
  {
    codigo: "1514 CPV350",
    nome: "CORTADORA PISO C MOTOR 5,5",
    descricao: "Cortadora de piso com motor 5,5HP",
    dimensoes: "100 X 68 X 110 CX",
    pesoLiquido: 72.00,
    pesoBruto: 87.00
  },
  {
    codigo: "5592 CPV460",
    nome: "CORTADORA PISO C MOTOR 5,5",
    descricao: "Cortadora de piso com motor 5,5HP",
    dimensoes: "105 X 53 X 94",
    pesoLiquido: 95.00,
    pesoBruto: 110.00
  },
  {
    codigo: "1449 ACV36",
    nome: "ALISADORA ACV36 C MOTOR",
    descricao: "Alisadora ACV36 com motor",
    dimensoes: "100 X 100 X 71",
    pesoLiquido: 90.00,
    pesoBruto: 101.00
  },
  {
    codigo: "1450 ACV46",
    nome: "ALISADORA ACV46 C MOTOR",
    descricao: "Alisadora ACV46 com motor",
    dimensoes: "100 X 100 X 71",
    pesoLiquido: 120.00,
    pesoBruto: 131.00
  }
]

async function inserirProdutosVibromak() {
  try {
    console.log('🚀 Iniciando inserção dos produtos Vibromak...')

    // 1. Buscar ou criar categoria "Equipamentos Industriais"
    console.log('📂 Verificando categoria "Equipamentos Industriais"...')
    let categoria = await prisma.categoria.findFirst({
      where: { nome: 'Equipamentos Industriais' }
    })

    if (!categoria) {
      categoria = await prisma.categoria.create({
        data: {
          nome: 'Equipamentos Industriais',
          descricao: 'Equipamentos industriais para construção civil',
          ativa: true
        }
      })
      console.log(`✅ Categoria criada: ${categoria.nome}`)
    } else {
      console.log(`✅ Categoria encontrada: ${categoria.nome}`)
    }

    // 2. Buscar empresa Vibromak
    console.log('🏢 Buscando empresa Vibromak...')
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

    // 3. Inserir produtos
    console.log('📦 Inserindo produtos...')
    let produtosCriados = 0
    let produtosAtualizados = 0

    for (const produtoData of produtosData) {
      try {
        // Verificar se produto já existe
        const produtoExistente = await prisma.produto.findUnique({
          where: { codigo: produtoData.codigo }
        })

        if (produtoExistente) {
          // Atualizar produto existente
          await prisma.produto.update({
            where: { id: produtoExistente.id },
            data: {
              nome: produtoData.nome,
              descricao: produtoData.descricao,
              dimensoes: produtoData.dimensoes,
              peso: produtoData.pesoLiquido,
              categoriaId: categoria.id,
              empresaId: empresa.id,
              // Manter preço existente se não especificado
              preco: produtoExistente.preco,
              status: 'ATIVO',
              unidade: 'UN',
              estoque: produtoExistente.estoque || 0,
              estoqueMinimo: produtoExistente.estoqueMinimo || 0
            }
          })
          produtosAtualizados++
          console.log(`🔄 Produto atualizado: ${produtoData.codigo} - ${produtoData.nome}`)
        } else {
          // Criar novo produto
          await prisma.produto.create({
            data: {
              codigo: produtoData.codigo,
              nome: produtoData.nome,
              descricao: produtoData.descricao,
              dimensoes: produtoData.dimensoes,
              peso: produtoData.pesoLiquido,
              categoriaId: categoria.id,
              empresaId: empresa.id,
              preco: 0, // Preço temporário - deve ser atualizado
              status: 'ATIVO',
              unidade: 'UN',
              estoque: 0,
              estoqueMinimo: 0,
              destaque: false,
              imagens: []
            }
          })
          produtosCriados++
          console.log(`✅ Produto criado: ${produtoData.codigo} - ${produtoData.nome}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao processar produto ${produtoData.codigo}:`, error)
      }
    }

    console.log('\n🎉 Inserção concluída!')
    console.log(`📊 Estatísticas:`)
    console.log(`   - Produtos criados: ${produtosCriados}`)
    console.log(`   - Produtos atualizados: ${produtosAtualizados}`)
    console.log(`   - Total processados: ${produtosData.length}`)
    console.log('\n⚠️  IMPORTANTE: Os preços foram definidos como 0 (zero).')
    console.log('   Você deve atualizar os preços através do painel administrativo.')

  } catch (error) {
    console.error('❌ Erro durante a inserção:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
inserirProdutosVibromak()
  .then(() => {
    console.log('✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
