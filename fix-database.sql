-- Script para corrigir vinculação vendedor-empresa

-- 1. Verificar dados atuais
SELECT 'DADOS ATUAIS:' as status;

SELECT 
  u.email,
  u.role,
  v.id as vendedor_id,
  v.empresaId as empresa_atual,
  e.nome as empresa_nome
FROM users u 
LEFT JOIN vendedores v ON u.id = v."userId" 
LEFT JOIN empresas e ON v."empresaId" = e.id
WHERE u.email = 'rafael.popeartstudio@gmail.com';

-- 2. Verificar empresas disponíveis
SELECT 'EMPRESAS DISPONÍVEIS:' as status;
SELECT id, nome, cnpj FROM empresas;

-- 3. Corrigir vinculação (usar ID da primeira empresa)
UPDATE vendedores 
SET "empresaId" = (SELECT id FROM empresas ORDER BY "createdAt" LIMIT 1)
WHERE "userId" = (
  SELECT id FROM users 
  WHERE email = 'rafael.popeartstudio@gmail.com'
);

-- 4. Verificar resultado
SELECT 'RESULTADO:' as status;

SELECT 
  u.email,
  u.role,
  v.id as vendedor_id,
  v."empresaId" as empresa_atual,
  e.nome as empresa_nome
FROM users u 
LEFT JOIN vendedores v ON u.id = v."userId" 
LEFT JOIN empresas e ON v."empresaId" = e.id
WHERE u.email = 'rafael.popeartstudio@gmail.com';
