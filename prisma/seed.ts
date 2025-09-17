import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Fazendo seed das categorias...')

  const categorias = [
    { nome: 'Eletrônicos', descricao: 'Produtos eletrônicos e tecnologia' },
    { nome: 'Roupas', descricao: 'Vestuário e acessórios' },
    { nome: 'Casa e Jardim', descricao: 'Produtos para casa e jardim' },
    { nome: 'Esportes', descricao: 'Artigos esportivos e fitness' },
    { nome: 'Ferramentas', descricao: 'Ferramentas e equipamentos' },
  ]

  for (const categoria of categorias) {
    const result = await prisma.categoria.upsert({
      where: { nome: categoria.nome },
      update: {},
      create: {
        nome: categoria.nome,
        descricao: categoria.descricao,
        ativa: true
      }
    })
    console.log(`✅ Categoria: ${result.nome}`)
  }

  console.log('🎉 Seed concluído!')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
