const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function atualizarVibromak() {
  try {
    console.log('🔄 Atualizando empresa para Vibromak...')

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
        cep: '17512-031',
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        corPrimaria: '#1E40AF'
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
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        corPrimaria: '#1E40AF',
        ativa: true
      }
    })

    console.log('✅ Vibromak atualizada:', vibromak.nome)
    console.log('📍', vibromak.endereco + ',', vibromak.cidade + '/' + vibromak.estado)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

atualizarVibromak()
