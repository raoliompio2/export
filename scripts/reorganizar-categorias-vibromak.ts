import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento de produtos por categoria específica
const categoriasProdutos = {
  'Vibradores de Concreto': [
    '83', '84', '86', '8720', '8725', '8730', '8731', // Vibradores de Imersão
    '87', '1337', '88', '1076', // Vibradores Portáteis
    '477', // Motor Portátil
    'CONJ-25-120', 'CONJ-36-120', 'CONJ-25-240', 'CONJ-36-240' // Conjuntos
  ],
  'Vibradores de Alta Frequência': [
    '549', '483', '6886', 'AF-35-4', 'AF-45-4' // Alta Frequência
  ],
  'Bombas Submersas': [
    '89', '507', '1440', '1463', // Bombas Submersas
    '961', '1398', // Bombas Compactas
    '3789', '3788', '925', '3790' // Bombas Alumínio
  ],
  'Motores Elétricos': [
    '5828', '6342', // Motores Elétricos
    '4956', '1545', '5326', '10195', // Motores Honda
    '6868', '7421', '7423' // Motores Vibromak
  ],
  'Motovibradores': [
    '1699', '10236', '93', // Motovibradores
    '5555', '180' // Kits Motor Gasolina
  ],
  'Placas Vibratórias': [
    '1515', '10042', '1011', '1012', '8380', // VK-85
    '2697', '10043', '2696', '2699', '8381', // VK-120
    '5934', // VK-300
    '10238', '10045' // VK-400
  ],
  'Compactadores': [
    '1648' // VMR-75R
  ],
  'Cortadoras de Piso': [
    '474', '5344', '5785', '10237', '10046', '10048', '510', '378', // CPV-350
    '1548', '10403', '10051', '1549', '10231' // CPV-460
  ],
  'Alisadoras': [
    '1449', '6065', '10241', '3284', '3285', '4623', '2639' // ACV-36
  ],
  'Acessórios e Peças': [
    '178', '5249', '1392', '8033', // Extensões e Acessórios
    '1727', '3771' // Conjuntos de Roda
  ]
}

async function reorganizarCategoriasVibromak() {
  try {
    console.log('📂 Reorganizando categorias dos produtos Vibromak...')

    // Buscar empresa Vibromak
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

    // Criar categorias específicas
    console.log('📁 Criando categorias específicas...')
    const categoriasCriadas = {}

    for (const [nomeCategoria, codigosProdutos] of Object.entries(categoriasProdutos)) {
      // Verificar se categoria já existe
      let categoria = await prisma.categoria.findFirst({
        where: { nome: nomeCategoria }
      })

      if (!categoria) {
        categoria = await prisma.categoria.create({
          data: {
            nome: nomeCategoria,
            descricao: `Produtos ${nomeCategoria.toLowerCase()} da Vibromak`,
            ativa: true
          }
        })
        console.log(`✅ Categoria criada: ${nomeCategoria}`)
      } else {
        console.log(`✅ Categoria encontrada: ${nomeCategoria}`)
      }

      categoriasCriadas[nomeCategoria] = categoria.id
    }

    // Atualizar produtos com suas categorias específicas
    console.log('🔄 Atualizando produtos com categorias específicas...')
    let produtosAtualizados = 0
    let produtosNaoEncontrados = 0

    for (const [nomeCategoria, codigosProdutos] of Object.entries(categoriasProdutos)) {
      const categoriaId = categoriasCriadas[nomeCategoria]
      
      for (const codigo of codigosProdutos) {
        try {
          const produto = await prisma.produto.findUnique({
            where: { codigo }
          })

          if (produto) {
            await prisma.produto.update({
              where: { id: produto.id },
              data: { categoriaId }
            })
            produtosAtualizados++
            console.log(`✅ ${codigo} → ${nomeCategoria}`)
          } else {
            produtosNaoEncontrados++
            console.log(`❌ Produto não encontrado: ${codigo}`)
          }
        } catch (error) {
          console.error(`❌ Erro ao atualizar produto ${codigo}:`, error)
        }
      }
    }

    // Verificar se há produtos sem categoria específica
    console.log('\n🔍 Verificando produtos sem categoria específica...')
    const produtosSemCategoria = await prisma.produto.findMany({
      where: {
        empresaId: empresa.id,
        categoria: {
          nome: 'Equipamentos Industriais'
        }
      }
    })

    if (produtosSemCategoria.length > 0) {
      console.log(`⚠️ ${produtosSemCategoria.length} produtos ainda na categoria "Equipamentos Industriais":`)
      produtosSemCategoria.forEach(produto => {
        console.log(`   - ${produto.codigo}: ${produto.nome}`)
      })
    }

    // Estatísticas finais
    console.log('\n🎉 Reorganização concluída!')
    console.log(`📊 Estatísticas:`)
    console.log(`   - Categorias criadas/encontradas: ${Object.keys(categoriasCriadas).length}`)
    console.log(`   - Produtos atualizados: ${produtosAtualizados}`)
    console.log(`   - Produtos não encontrados: ${produtosNaoEncontrados}`)
    console.log(`   - Produtos sem categoria específica: ${produtosSemCategoria.length}`)

    // Listar categorias criadas
    console.log('\n📋 Categorias disponíveis:')
    for (const nomeCategoria of Object.keys(categoriasCriadas)) {
      const count = await prisma.produto.count({
        where: {
          empresaId: empresa.id,
          categoria: { nome: nomeCategoria }
        }
      })
      console.log(`   - ${nomeCategoria}: ${count} produtos`)
    }

  } catch (error) {
    console.error('❌ Erro durante a reorganização:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
reorganizarCategoriasVibromak()
  .then(() => {
    console.log('✅ Script de reorganização executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
