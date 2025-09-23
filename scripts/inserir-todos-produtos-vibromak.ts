import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dados completos dos produtos Vibromak com preços
const produtosCompletos = [
  // Vibradores de Imersão
  { codigo: "83", nome: "Mangote Vibrador de Imersão 25 x 5", preco: 485, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 15, pesoBruto: 19.1 },
  { codigo: "84", nome: "Mangote Vibrador de Imersão 36 x 5", preco: 509, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 15, pesoBruto: 19.1 },
  { codigo: "86", nome: "Mangote Vibrador de Imersão 63 x 5", preco: 713, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 21, pesoBruto: 25.1 },
  { codigo: "8720", nome: "Mangote Vibrador de Imersão 25 x 9,5", preco: 1461.95, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "8725", nome: "Mangote Vibrador de Imersão 36 x 9,5", preco: 1622.01, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "8730", nome: "Mangote Vibrador de Imersão 46 x 9,5", preco: 1807.48, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "8731", nome: "Mangote Vibrador de Imersão 63 x 9,5", preco: 2301.18, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Vibradores Portáteis
  { codigo: "87", nome: "Mangote Vibrador Portátil 25 x 1,20", preco: 351.74, dimensoes: "65 x 45 x 9 CX", pesoLiquido: 4, pesoBruto: 4.6 },
  { codigo: "1337", nome: "Mangote Vibrador Portátil 25 x 2,40", preco: 614.85, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "88", nome: "Mangote Vibrador Portátil 36 x 1,20", preco: 492.9, dimensoes: "65 x 45 x 9 CX", pesoLiquido: 4, pesoBruto: 4.6 },
  { codigo: "1076", nome: "Mangote Vibrador Portátil 36 x 2,40", preco: 844.77, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "477", nome: "Motor Portátil 220v", preco: 445.27, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Conjuntos Vibradores Portáteis
  { codigo: "CONJ-25-120", nome: "Conjunto Vibrador Portátil 25 x 1,20 + Motor", preco: 796.92, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "CONJ-36-120", nome: "Conjunto Vibrador Portátil 36 x 1,20 + Motor", preco: 937.9, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "CONJ-25-240", nome: "Conjunto Vibrador Portátil 25 x 2,40 + Motor", preco: 1059.32, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "CONJ-36-240", nome: "Conjunto Vibrador Portátil 36 x 2,40 + Motor", preco: 1289.87, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Alta Frequência
  { codigo: "549", nome: "Mangote Alta Frequência 35 x 1,5", preco: 641.66, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 4, pesoBruto: 5 },
  { codigo: "483", nome: "Mangote Alta Frequência 35 x 3,5", preco: 871.58, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 6, pesoBruto: 8 },
  { codigo: "6886", nome: "Motor Alta Rotação 2400w 220v", preco: 1443.72, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "AF-35-4", nome: "Conjunto Alta Frequência 35 x 4,0 + Motor AF", preco: 2085.07, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "AF-45-4", nome: "Conjunto Alta Frequência 45 x 4,0 + Motor AF", preco: 2313.62, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Extensões e Acessórios
  { codigo: "178", nome: "Extensão 5m VB", preco: 1212.02, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "5249", nome: "Extensão 10m VB", preco: 1786.5, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1392", nome: "Kit Manutenção Vibradores/Bomba", preco: 635.78, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "8033", nome: "Escovadeira de Mangote EVK 6.0", preco: 1443.72, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Bombas Submersas
  { codigo: "89", nome: "Bomba Submersa 2\" x 5mts", preco: 1470.46, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 24, pesoBruto: 26.1 },
  { codigo: "507", nome: "Bomba Submersa 2\" x 10mts", preco: 2288.06, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 24, pesoBruto: 26.1 },
  { codigo: "1440", nome: "Bomba Submersa 3\" x 5mts", preco: 1470.46, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 29.1, pesoBruto: 32.1 },
  { codigo: "1463", nome: "Bomba Submersa 3\" x 10mts", preco: 2288.06, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Bombas Compactas
  { codigo: "961", nome: "Bomba Compacta Submersa 2\" x 5mts", preco: 1267.63, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 20, pesoBruto: 22.1 },
  { codigo: "1398", nome: "Bomba Compacta Submersa 2\" x 10mts", preco: 2086.4, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Bombas Alumínio
  { codigo: "3789", nome: "Bomba Alumínio Submersa 2\" x 5 mts", preco: 1210.49, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "3788", nome: "Bomba Alumínio Submersa 2\" x 10 mts", preco: 2288.04, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "925", nome: "Bomba Alumínio Submersa 3\" x 5 mts", preco: 1210.49, dimensoes: "75 x 8 x 90 SACO", pesoLiquido: 22, pesoBruto: 24.1 },
  { codigo: "3790", nome: "Bomba Alumínio Submersa 3\" x 10 mts", preco: 2288.04, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Motores Elétricos
  { codigo: "5828", nome: "Motor Elétrico Monofásico Weg 2,0 CV", preco: 2064.75, dimensoes: "45 x 22 x 32 CX", pesoLiquido: 22, pesoBruto: 22.75 },
  { codigo: "6342", nome: "Motor Elétrico Trifásico Weg 2,0 CV", preco: 1838.09, dimensoes: "45 x 22 x 32 CX", pesoLiquido: 22, pesoBruto: 22.75 },

  // Motovibradores
  { codigo: "1699", nome: "Motovibrador Honda - 5,5cv", preco: 2200.98, dimensoes: "65 x 42 x 51 CX", pesoLiquido: 26, pesoBruto: 28.1 },
  { codigo: "10236", nome: "Motovibrador VBK210-T - 7,0cv", preco: 1454.27, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "93", nome: "Motovibrador Branco - 5,5cv", preco: 1504.58, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Kits Motor Gasolina
  { codigo: "5555", nome: "Kit Motor Gasolina S/ Motor - Honda", preco: 481.24, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "180", nome: "Kit Motor Gasolina S/ Motor - Diversos", preco: 481.24, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Motores Honda
  { codigo: "4956", nome: "Motor Honda GXR120 KRWF", preco: 3055.5, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1545", nome: "Motor Honda GX160 5,5HP", preco: 1636.88, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "5326", nome: "Motor Honda GX270 9,0HP", preco: 3346.5, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10195", nome: "Motor Honda GX430 15,0HP", preco: 4001.25, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Motores Vibromak
  { codigo: "6868", nome: "Motor Compactador Vibromak RM120-V", preco: 1746, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "7421", nome: "Motor Vibromak R210-V - 7,0cv", preco: 1174.16, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "7423", nome: "Motor Vibromak R420-V - 15,0cv", preco: 2348.28, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Cortadoras de Piso CPV 350
  { codigo: "474", nome: "CPV 350 S/ Motor P/ Motores 9.0-13.0 HP", preco: 2845.69, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "5344", nome: "CPV 350 S/ Motor P/ Motores 6.5-7.0 HP", preco: 2845.69, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "5785", nome: "CPV 350 C/ Honda GX270 Cyclone - Gas. 9cv", preco: 6464.14, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10237", nome: "CPV 350 C/ Honda GX430 Cyclone - Gas. 15cv", preco: 7011.35, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10046", nome: "CPV 350 C/ VBK R210-T Gas - 7cv", preco: 5368.95, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10048", nome: "CPV 350 C/ VBK R420-T Gas - 15cv", preco: 5623.09, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "510", nome: "CPV 350 C/ Branco Gas. 8,5cv", preco: 5369.02, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "378", nome: "CPV 350 C/ Branco Gas. 13cv", preco: 5623.09, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Cortadoras de Piso CPV 460
  { codigo: "1548", nome: "CPV 460 S/ Motor", preco: 5034.85, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10403", nome: "CPV 460 C/ Honda GX430 - Gas. 15cv", preco: 7500, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10051", nome: "CPV 460 C/ VBK R420-T - 15cv", preco: 7849.72, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1549", nome: "CPV 460 C/ Branco Gas. 13cv", preco: 8399.57, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10231", nome: "CPV 500 C/ Honda GX430 - Gas. 15cv", preco: 9569.83, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Placas Vibratórias VK 85
  { codigo: "1012", nome: "VK 85 C/ Kit Asperssor S/ Motor", preco: 4111.43, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "8380", nome: "VK 85 Standart S/Kit Asperssor S/Motor", preco: 3800.53, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1515", nome: "VK 85 C/ Honda GX 160 - 5,5cv", preco: 4000, dimensoes: "95 x 55 x 120 CX", pesoLiquido: 84, pesoBruto: 95 },
  { codigo: "10042", nome: "VK 85 C/ VBK R210-T - 7cv", preco: 5620.59, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1011", nome: "VK 85 C/ Branco Gas. 5,5cv", preco: 5620.59, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1727", nome: "Conjunto de Roda VK 85", preco: 382.34, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Placas Vibratórias VK 120
  { codigo: "2699", nome: "VK 120 C/ Kit Asperssor S/ Motor", preco: 4652.76, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "8381", nome: "VK 120 Standart S/Kit Asperssor S/Motor", preco: 4422.84, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "2697", nome: "VK 120 C/ Honda GX 160 - 5,5cv", preco: 4100, dimensoes: "95 x 55 x 120 CX", pesoLiquido: 120, pesoBruto: 130 },
  { codigo: "10043", nome: "VK 120 C/ VBK R210-T - 7cv", preco: 5812.72, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "2696", nome: "VK 120 C/ Branco Gas. 5,5cv", preco: 5870.12, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "3771", nome: "Conjunto de Roda VK 120", preco: 382.34, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Placas Vibratórias Reversíveis
  { codigo: "5934", nome: "VK300 Reversível Honda GX270", preco: 20158.66, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10238", nome: "VK400 Reversível Honda GX430", preco: 32862.51, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10045", nome: "VK400 Reversível VBK R210-T", preco: 27880.16, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Compactadores
  { codigo: "1648", nome: "VMR-75R C/ Motor RM120V", preco: 7300, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },

  // Alisadoras ACV-36
  { codigo: "4623", nome: "ACV-36 S/ Motor (Adap. 8,5 e 9,0HP)", preco: 6599.88, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "2639", nome: "ACV-36 S/ Motor (Adap. 5,5 e 6,5HP)", preco: 6599.88, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "1449", nome: "ACV-36 C/ Honda GX-160", preco: 8146.47, dimensoes: "100 x 100 x 71 CX", pesoLiquido: 90, pesoBruto: 101 },
  { codigo: "6065", nome: "ACV-36 C/ Honda Cyclone GX-270", preco: 7000, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "10241", nome: "ACV-36 C/ VBK R210-T - 7cv", preco: 7995.22, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "3284", nome: "ACV-36 C/ Branco 6,5cv", preco: 8028.71, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 },
  { codigo: "3285", nome: "ACV-36 C/ Branco 8,5cv", preco: 9410.94, dimensoes: "", pesoLiquido: 0, pesoBruto: 0 }
]

async function inserirTodosProdutosVibromak() {
  try {
    console.log('🚀 Iniciando inserção completa dos produtos Vibromak...')
    console.log(`📊 Total de produtos a processar: ${produtosCompletos.length}`)

    // 1. Buscar ou criar categoria "Equipamentos Industriais"
    console.log('📂 Verificando categoria "Equipamentos Industriais"...')
    let categoria = await prisma.categoria.findFirst({
      where: { nome: 'Equipamentos Industriais' }
    })

    if (!categoria) {
      categoria = await prisma.categoria.create({
        data: {
          nome: 'Equipamentos Industriais',
          descricao: 'Equipamentos industriais para construção civil - Vibromak',
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
    let produtosComErro = 0

    for (const produtoData of produtosCompletos) {
      try {
        // Verificar se produto já existe
        const produtoExistente = await prisma.produto.findUnique({
          where: { codigo: produtoData.codigo }
        })

        const dadosProduto = {
          codigo: produtoData.codigo,
          nome: produtoData.nome,
          descricao: produtoData.nome, // Usar o nome como descrição também
          dimensoes: produtoData.dimensoes || null,
          peso: produtoData.pesoLiquido || null,
          categoriaId: categoria.id,
          empresaId: empresa.id,
          preco: produtoData.preco,
          status: 'ATIVO' as const,
          unidade: 'UN',
          estoque: 0,
          estoqueMinimo: 0,
          destaque: false,
          imagens: []
        }

        if (produtoExistente) {
          // Atualizar produto existente
          await prisma.produto.update({
            where: { id: produtoExistente.id },
            data: dadosProduto
          })
          produtosAtualizados++
          console.log(`🔄 Produto atualizado: ${produtoData.codigo} - ${produtoData.nome} - R$ ${produtoData.preco.toFixed(2)}`)
        } else {
          // Criar novo produto
          await prisma.produto.create({
            data: dadosProduto
          })
          produtosCriados++
          console.log(`✅ Produto criado: ${produtoData.codigo} - ${produtoData.nome} - R$ ${produtoData.preco.toFixed(2)}`)
        }
      } catch (error) {
        produtosComErro++
        console.error(`❌ Erro ao processar produto ${produtoData.codigo}:`, error)
      }
    }

    console.log('\n🎉 Inserção completa concluída!')
    console.log(`📊 Estatísticas:`)
    console.log(`   - Produtos criados: ${produtosCriados}`)
    console.log(`   - Produtos atualizados: ${produtosAtualizados}`)
    console.log(`   - Produtos com erro: ${produtosComErro}`)
    console.log(`   - Total processados: ${produtosCompletos.length}`)
    console.log(`   - Categoria: ${categoria.nome}`)
    console.log(`   - Empresa: ${empresa.nome}`)

    // 4. Verificar total de produtos da empresa
    const totalProdutosEmpresa = await prisma.produto.count({
      where: { empresaId: empresa.id }
    })
    console.log(`   - Total de produtos da empresa: ${totalProdutosEmpresa}`)

  } catch (error) {
    console.error('❌ Erro durante a inserção:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
inserirTodosProdutosVibromak()
  .then(() => {
    console.log('✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
