-- Atualizar empresa com dados da Vibromak
UPDATE empresas 
SET 
  nome = 'Vibromak Equipamentos Ltda',
  nome_fantasia = 'Vibromak',
  email = 'contato@vibromak.com.br',
  telefone = '(14) 3454-1900',
  endereco = 'Avenida Yusaburo Sasazaki, 1900',
  numero = '1900',
  bairro = 'Distrito Industrial Santo Barion',
  cidade = 'Marília',
  estado = 'SP',
  cep = '17512-031',
  banco = 'Banco do Brasil',
  agencia = '1234-5',
  conta = '12345-6',
  cor_primaria = '#1E40AF',
  updated_at = NOW()
WHERE cnpj = '12.345.678/0001-99';

-- Verificar se foi atualizada
SELECT nome, cidade, cnpj FROM empresas WHERE cnpj = '12.345.678/0001-99';
