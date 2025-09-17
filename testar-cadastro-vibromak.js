const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testarCadastroVibromak() {
  try {
    // Pegar dados atuais da Vibromak
    const vibromakAtual = await prisma.empresa.findUnique({
      where: { id: 'cmfnfgy0w0000l804jd2t3rwp' }
    })

    console.log('📋 Dados da Vibromak que estão causando erro:')
    console.log(JSON.stringify(vibromakAtual, null, 2))

    // Tentar criar uma nova empresa com os mesmos dados (mas CNPJ diferente)
    console.log('\n🧪 Testando criação de empresa similar...')
    
    const dadosTeste = {
      nome: vibromakAtual.nome,
      nomeFantasia: vibromakAtual.nomeFantasia,
      cnpj: '99999999999999', // CNPJ diferente para teste
      inscricaoEstadual: vibromakAtual.inscricaoEstadual,
      inscricaoMunicipal: vibromakAtual.inscricaoMunicipal,
      email: 'teste@vibromak.com.br',
      telefone: vibromakAtual.telefone,
      website: vibromakAtual.website,
      endereco: vibromakAtual.endereco,
      numero: vibromakAtual.numero,
      complemento: vibromakAtual.complemento,
      bairro: vibromakAtual.bairro,
      cidade: vibromakAtual.cidade,
      estado: vibromakAtual.estado,
      cep: vibromakAtual.cep,
      banco: vibromakAtual.banco,
      agencia: vibromakAtual.agencia,
      conta: vibromakAtual.conta,
      logo: vibromakAtual.logo,
      corPrimaria: vibromakAtual.corPrimaria,
      ativa: vibromakAtual.ativa
    }

    console.log('📤 Dados de teste:')
    console.log(JSON.stringify(dadosTeste, null, 2))

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarCadastroVibromak()
