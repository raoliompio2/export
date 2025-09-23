import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento de imagens por categoria/tipo de produto
const imagensProdutos = {
  // Vibradores de Imersão (VBK)
  '83': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png', // Vibrador de concreto pendular
  '84': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png',
  '86': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png',
  '8720': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png',
  '8725': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png',
  '8730': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png',
  '8731': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png',

  // Vibradores Portáteis (VBP)
  '87': 'https://vibromak.com.br/wp-content/uploads/2024/01/Design-sem-nome-2024-01-28T161758.586.png', // Vibrador Portátil
  '1337': 'https://vibromak.com.br/wp-content/uploads/2024/01/Design-sem-nome-2024-01-28T161758.586.png',
  '88': 'https://vibromak.com.br/wp-content/uploads/2024/01/Design-sem-nome-2024-01-28T161758.586.png',
  '1076': 'https://vibromak.com.br/wp-content/uploads/2024/01/Design-sem-nome-2024-01-28T161758.586.png',

  // Alta Frequência (VBA)
  '549': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3782-1.png', // Vibrador de Alta Frequencia
  '483': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3782-1.png',
  '6886': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3755-1-1.png', // Motor Dupla Isolação
  'AF-35-4': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3782-1.png',
  'AF-45-4': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3782-1.png',

  // Bombas Compactas (BSC)
  '961': 'https://vibromak.com.br/wp-content/uploads/2024/01/15-1.png', // Bomba Compacta
  '1398': 'https://vibromak.com.br/wp-content/uploads/2024/01/15-1.png',

  // Bombas Submersas (BSS/BSK)
  '89': 'https://vibromak.com.br/wp-content/uploads/2024/01/13.png', // Bomba de Ferro
  '507': 'https://vibromak.com.br/wp-content/uploads/2024/01/13.png',
  '1440': 'https://vibromak.com.br/wp-content/uploads/2024/01/13.png',
  '1463': 'https://vibromak.com.br/wp-content/uploads/2024/01/13.png',
  '80': 'https://vibromak.com.br/wp-content/uploads/2024/01/13.png',

  // Bombas Alumínio (BSA)
  '3789': 'https://vibromak.com.br/wp-content/uploads/2024/01/14.png', // Bomba De Aluminio
  '3788': 'https://vibromak.com.br/wp-content/uploads/2024/01/14.png',
  '925': 'https://vibromak.com.br/wp-content/uploads/2024/01/14.png',
  '3790': 'https://vibromak.com.br/wp-content/uploads/2024/01/14.png',

  // Motores Elétricos
  '5828': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3755-1-1.png', // Motor Dupla Isolação
  '6342': 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3755-1-1.png',

  // Motovibradores
  '1699': 'https://vibromak.com.br/wp-content/uploads/2024/01/6-2.png', // Motovibrador
  '10236': 'https://vibromak.com.br/wp-content/uploads/2024/01/6-2.png',
  '93': 'https://vibromak.com.br/wp-content/uploads/2024/01/6-2.png',

  // Placas Vibratórias VK
  '1515': 'https://vibromak.com.br/wp-content/uploads/2024/01/4-3.png', // VK-85
  '10042': 'https://vibromak.com.br/wp-content/uploads/2024/01/4-3.png',
  '1011': 'https://vibromak.com.br/wp-content/uploads/2024/01/4-3.png',
  '1012': 'https://vibromak.com.br/wp-content/uploads/2024/01/4-3.png',
  '8380': 'https://vibromak.com.br/wp-content/uploads/2024/01/4-3.png',

  '2697': 'https://vibromak.com.br/wp-content/uploads/2024/01/5-3.png', // VK-120
  '10043': 'https://vibromak.com.br/wp-content/uploads/2024/01/5-3.png',
  '2696': 'https://vibromak.com.br/wp-content/uploads/2024/01/5-3.png',
  '2699': 'https://vibromak.com.br/wp-content/uploads/2024/01/5-3.png',
  '8381': 'https://vibromak.com.br/wp-content/uploads/2024/01/5-3.png',

  '5934': 'https://vibromak.com.br/wp-content/uploads/2024/01/5-1.png', // VK-300
  '10238': 'https://vibromak.com.br/wp-content/uploads/2024/01/6-1.png', // VK-400
  '10045': 'https://vibromak.com.br/wp-content/uploads/2024/01/6-1.png',

  // Compactadores VMR
  '1648': 'https://vibromak.com.br/wp-content/uploads/2023/12/Copia-de-VMR-75R-Post-para-Instagram-1.png', // VMR-75R

  // Cortadoras CPV
  '1548': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-9.png', // CPV-460
  '10403': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-9.png',
  '10051': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-9.png',
  '1549': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-9.png',
  '10231': 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-9.png',

  '474': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png', // CPV-350
  '5344': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',
  '5785': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',
  '10237': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',
  '10046': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',
  '10048': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',
  '510': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',
  '378': 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png',

  // Alisadoras ACV
  '1449': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png', // ACV-36
  '6065': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png',
  '10241': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png',
  '3284': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png',
  '3285': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png',
  '4623': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png',
  '2639': 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png'
}

async function atualizarImagensVibromak() {
  try {
    console.log('🖼️ Iniciando atualização de imagens dos produtos Vibromak...')

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

    let produtosAtualizados = 0
    let produtosNaoEncontrados = 0
    let produtosSemImagem = 0

    // Atualizar imagens dos produtos
    for (const [codigo, imagemUrl] of Object.entries(imagensProdutos)) {
      try {
        const produto = await prisma.produto.findUnique({
          where: { codigo }
        })

        if (produto) {
          await prisma.produto.update({
            where: { id: produto.id },
            data: { imagens: [imagemUrl] }
          })
          produtosAtualizados++
          console.log(`✅ Imagem atualizada: ${codigo} - ${produto.nome}`)
        } else {
          produtosNaoEncontrados++
          console.log(`❌ Produto não encontrado: ${codigo}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar produto ${codigo}:`, error)
      }
    }

    // Buscar produtos Vibromak sem imagem para aplicar imagens padrão por categoria
    console.log('\n🔍 Aplicando imagens padrão para produtos sem imagem...')
    
    const produtosSemImagemList = await prisma.produto.findMany({
      where: {
        empresaId: empresa.id,
        OR: [
          { imagens: { isEmpty: true } },
          { imagens: { equals: [] } }
        ]
      }
    })

    for (const produto of produtosSemImagemList) {
      try {
        let imagemPadrao = ''

        // Determinar imagem padrão baseada no nome/código
        if (produto.nome.toLowerCase().includes('vibrador') && produto.nome.toLowerCase().includes('imersão')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-2024-01-28T170017.438.png'
        } else if (produto.nome.toLowerCase().includes('vibrador') && produto.nome.toLowerCase().includes('portátil')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/Design-sem-nome-2024-01-28T161758.586.png'
        } else if (produto.nome.toLowerCase().includes('alta frequência')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3782-1.png'
        } else if (produto.nome.toLowerCase().includes('bomba') && produto.nome.toLowerCase().includes('compacta')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/15-1.png'
        } else if (produto.nome.toLowerCase().includes('bomba') && produto.nome.toLowerCase().includes('alumínio')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/14.png'
        } else if (produto.nome.toLowerCase().includes('bomba')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/13.png'
        } else if (produto.nome.toLowerCase().includes('motor')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2023/12/IMG_3755-1-1.png'
        } else if (produto.nome.toLowerCase().includes('motovibrador')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/6-2.png'
        } else if (produto.nome.toLowerCase().includes('vk-85') || produto.nome.toLowerCase().includes('vk85')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/4-3.png'
        } else if (produto.nome.toLowerCase().includes('vk-120') || produto.nome.toLowerCase().includes('vk120')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/5-3.png'
        } else if (produto.nome.toLowerCase().includes('vk-300') || produto.nome.toLowerCase().includes('vk300')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/5-1.png'
        } else if (produto.nome.toLowerCase().includes('vk-400') || produto.nome.toLowerCase().includes('vk400')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/6-1.png'
        } else if (produto.nome.toLowerCase().includes('vmr')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2023/12/Copia-de-VMR-75R-Post-para-Instagram-1.png'
        } else if (produto.nome.toLowerCase().includes('cpv-460') || produto.nome.toLowerCase().includes('cpv460')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2023/12/Design-sem-nome-9.png'
        } else if (produto.nome.toLowerCase().includes('cpv-350') || produto.nome.toLowerCase().includes('cpv350')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2023/12/bomba-lameira-eletrica-blumenau-locablu-locacao-2.png'
        } else if (produto.nome.toLowerCase().includes('acv')) {
          imagemPadrao = 'https://vibromak.com.br/wp-content/uploads/2024/01/3-3.png'
        }

        if (imagemPadrao) {
          await prisma.produto.update({
            where: { id: produto.id },
            data: { imagens: [imagemPadrao] }
          })
          produtosSemImagem++
          console.log(`✅ Imagem padrão aplicada: ${produto.codigo} - ${produto.nome}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao aplicar imagem padrão para ${produto.codigo}:`, error)
      }
    }

    console.log('\n🎉 Atualização de imagens concluída!')
    console.log(`📊 Estatísticas:`)
    console.log(`   - Produtos com imagem específica: ${produtosAtualizados}`)
    console.log(`   - Produtos não encontrados: ${produtosNaoEncontrados}`)
    console.log(`   - Produtos com imagem padrão: ${produtosSemImagem}`)
    console.log(`   - Total processados: ${produtosAtualizados + produtosSemImagem}`)

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
atualizarImagensVibromak()
  .then(() => {
    console.log('✅ Script de imagens executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
