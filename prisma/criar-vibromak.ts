import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function criarVibromak() {
  try {
    console.log('🏢 Criando empresa Vibromak...')

    const vibromak = await prisma.empresa.create({
      data: {
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

    console.log(`✅ Empresa Vibromak criada com ID: ${vibromak.id}`)
    console.log(`📍 ${vibromak.nome} - ${vibromak.cidade}/${vibromak.estado}`)

  } catch (error) {
    console.error('❌ Erro ao criar Vibromak:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarVibromak()
