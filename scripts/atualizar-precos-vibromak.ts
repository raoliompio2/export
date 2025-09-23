import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Template para atualizar preços dos produtos Vibromak
// Substitua os valores 0 pelos preços reais quando disponíveis
const precosProdutos = [
  { codigo: "83-VBK 255", preco: 0 }, // VB DE IMERSÃO 25MM X 5MT
  { codigo: "84-VBK 365", preco: 0 }, // VB DE IMERSÃO 36MM X 5MT
  { codigo: "85-VBK 465", preco: 0 }, // VB DE IMERSÃO 46MM X 5MT
  { codigo: "86-VBK 635", preco: 0 }, // VB DE IMERSÃO 63MM X 5MT
  { codigo: "549-VBA 3516", preco: 0 }, // VB AF 35MM X 1,50MT
  { codigo: "483-VBA 3535", preco: 0 }, // VB AF 35MM X 3,50MT
  { codigo: "554", preco: 0 }, // MOTOR VBAF 220V
  { codigo: "87 VBP 2512", preco: 0 }, // VB PORTÁTIL 25MM X 1,20MT
  { codigo: "88 VBP 3612", preco: 0 }, // VB PORTÁTIL 36MM X 1,20MT
  { codigo: "422 MEVP", preco: 0 }, // MOTOR PORTÁTIL 220
  { codigo: "961 BSC 2.0", preco: 0 }, // BOMBA COMPACTA 2" X 5MT
  { codigo: "990 BSS 2.0", preco: 0 }, // BOMBA SUBMERSA 2" X 5MT
  { codigo: "80 BSK 2.5", preco: 0 }, // BOMBA SUBMERSA 2 1/2" X 5MT
  { codigo: "1440 BSK 3.0", preco: 0 }, // BOMBA SUBMERSA 3" X 5MT
  { codigo: "925 BSA 3.0", preco: 0 }, // BOMBA SUBMERSA ALUMÍNIO 3" X 5MT
  { codigo: "989 BSA 2.0", preco: 0 }, // BOMBA SUBMERSA ALUMÍNIO 2" X 5MT
  { codigo: "1216 MEMD", preco: 0 }, // MOTOR ELETR DI MONOF 1,5CV
  { codigo: "1277 METD*", preco: 0 }, // MOTOR ELETR DI TRIF 2,0CV
  { codigo: "91 MEM 1.5", preco: 0 }, // MOTOR ELETR MONOF 1,5CV
  { codigo: "192 MEM 2.0", preco: 0 }, // MOTOR ELETR TRIF 2,0CV
  { codigo: "1697 MGK 5.5", preco: 0 }, // MOTOVIB C MOTOR 5,5HP
  { codigo: "3889", preco: 0 }, // COMPACTADOR C MOTOR
  { codigo: "1515-VK85", preco: 0 }, // PLACA VK85 C MOTOR 5,5HP
  { codigo: "2697-VK120", preco: 0 }, // PLACA VK120 C MOTOR 5,5HP
  { codigo: "1514 CPV350", preco: 0 }, // CORTADORA PISO C MOTOR 5,5
  { codigo: "5592 CPV460", preco: 0 }, // CORTADORA PISO C MOTOR 5,5
  { codigo: "1449 ACV36", preco: 0 }, // ALISADORA ACV36 C MOTOR
  { codigo: "1450 ACV46", preco: 0 }, // ALISADORA ACV46 C MOTOR
]

async function atualizarPrecosVibromak() {
  try {
    console.log('💰 Iniciando atualização de preços dos produtos Vibromak...')

    let produtosAtualizados = 0
    let produtosNaoEncontrados = 0

    for (const item of precosProdutos) {
      try {
        const produto = await prisma.produto.findUnique({
          where: { codigo: item.codigo }
        })

        if (produto) {
          await prisma.produto.update({
            where: { id: produto.id },
            data: { preco: item.preco }
          })
          produtosAtualizados++
          console.log(`✅ Preço atualizado: ${item.codigo} - R$ ${item.preco.toFixed(2)}`)
        } else {
          produtosNaoEncontrados++
          console.log(`❌ Produto não encontrado: ${item.codigo}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar produto ${item.codigo}:`, error)
      }
    }

    console.log('\n🎉 Atualização de preços concluída!')
    console.log(`📊 Estatísticas:`)
    console.log(`   - Produtos atualizados: ${produtosAtualizados}`)
    console.log(`   - Produtos não encontrados: ${produtosNaoEncontrados}`)

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
atualizarPrecosVibromak()
  .then(() => {
    console.log('✅ Script de preços executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error)
    process.exit(1)
  })
