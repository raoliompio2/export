#!/usr/bin/env node

// Script para garantir que o Prisma Client seja gerado corretamente no Vercel
const { execSync } = require('child_process');

console.log('🔄 Verificando Prisma Client...');

try {
  // Regenerar Prisma Client 
  console.log('📦 Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma Client gerado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao gerar Prisma Client:', error.message);
  process.exit(1);
}
