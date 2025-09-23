#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Executando inserção completa dos produtos Vibromak...\n');

try {
  // Executar o script de inserção completa
  console.log('📦 Inserindo todos os produtos Vibromak no banco de dados...');
  execSync('npx tsx scripts/inserir-todos-produtos-vibromak.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Todos os produtos Vibromak foram inseridos com sucesso!');
  console.log('\n📋 Resumo:');
  console.log('- ✅ Produtos com preços reais');
  console.log('- ✅ Dimensões e pesos corretos');
  console.log('- ✅ Categoria: Equipamentos Industriais');
  console.log('- ✅ Empresa: Vibromak');
  console.log('- ✅ Status: ATIVO');

} catch (error) {
  console.error('❌ Erro na execução:', error.message);
  process.exit(1);
}
