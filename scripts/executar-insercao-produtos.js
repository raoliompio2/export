#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Executando inserção de produtos Vibromak...\n');

try {
  // Executar o script de inserção de produtos
  console.log('📦 Inserindo produtos no banco de dados...');
  execSync('npx tsx scripts/inserir-produtos-vibromak.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Produtos inseridos com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Atualize os preços no arquivo: scripts/atualizar-precos-vibromak.ts');
  console.log('2. Execute: npx tsx scripts/atualizar-precos-vibromak.ts');
  console.log('3. Ou atualize os preços através do painel administrativo');

} catch (error) {
  console.error('❌ Erro na execução:', error.message);
  process.exit(1);
}
