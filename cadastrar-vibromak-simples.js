const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando cadastro da Vibromak...')
  
  // 1. Criar empresa Vibromak
  const vibromak = await prisma.empresa.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: {
      nome: 'Vibromak Equipamentos Ltda',
      nomeFantasia: 'Vibromak',
      email: 'contato@vibromak.com.br',
      telefone: '(14) 3454-1900',
      endereco: 'Avenida Yusaburo Sasazaki, 1900',
      numero: '1900',
      bairro: 'Distrito Industrial Santo Barion',
      cidade: 'Marília',
      estado: 'SP',
      cep: '17512-031'
    },
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
  
  console.log('Vibromak criada:', vibromak.nome)
  
  // 2. Verificar empresas
  const empresas = await prisma.empresa.findMany()
  console.log('Empresas no banco:')
  empresas.forEach(e => console.log(`- ${e.nome} (${e.cidade})`))
  
  await prisma.$disconnect()
}

main().catch(console.error)
