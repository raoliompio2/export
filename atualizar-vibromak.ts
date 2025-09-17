import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function atualizarVibromak() {
  try {
    console.log('🔄 Atualizando empresa para Vibromak...')

    // Verificar se existe empresa com CNPJ 12.345.678/0001-99
    const empresaExistente = await prisma.empresa.findUnique({
      where: { cnpj: '12.345.678/0001-99' }
    })

    if (empresaExistente) {
      // Atualizar empresa existente
      const vibromak = await prisma.empresa.update({
        where: { cnpj: '12.345.678/0001-99' },
        data: {
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
          corPrimaria: '#1E40AF',
          ativa: true
        }
      })
      console.log(`✅ Empresa atualizada: ${vibromak.nome}`)
      console.log(`📍 ${vibromak.endereco}, ${vibromak.cidade}/${vibromak.estado}`)
    } else {
      // Criar nova empresa
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
          banco: 'Banco do Brasil',
          agencia: '1234-5',
          conta: '12345-6',
          corPrimaria: '#1E40AF',
          ativa: true
        }
      })
      console.log(`✅ Empresa criada: ${vibromak.nome}`)
    }

    // Verificar todas as empresas
    const empresas = await prisma.empresa.findMany()
    console.log('\n📋 Empresas no sistema:')
    empresas.forEach(empresa => {
      console.log(`- ${empresa.nome} (${empresa.cidade}/${empresa.estado})`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

atualizarVibromak()
