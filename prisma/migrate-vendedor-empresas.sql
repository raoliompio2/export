-- Migração para permitir vendedores representarem múltiplas empresas
-- Mudança de relacionamento 1:N para N:N entre Vendedor e Empresa

-- 1. Criar nova tabela de relacionamento N:N
CREATE TABLE vendedor_empresas (
    id TEXT PRIMARY KEY,
    vendedor_id TEXT NOT NULL,
    empresa_id TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    comissao DECIMAL(5,2),
    meta DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendedor_id, empresa_id),
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 2. Migrar dados existentes da tabela vendedores
INSERT INTO vendedor_empresas (id, vendedor_id, empresa_id, ativo, comissao, meta, created_at, updated_at)
SELECT 
    've_' || v.id || '_' || v.empresa_id,
    v.id,
    v.empresa_id,
    v.ativo,
    v.comissao,
    v.meta,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM vendedores v 
WHERE v.empresa_id IS NOT NULL;

-- 3. Adicionar campo vendedor_empresa_id na tabela orcamentos
ALTER TABLE orcamentos ADD COLUMN vendedor_empresa_id TEXT;

-- 4. Atualizar orçamentos existentes para referenciar a nova tabela
UPDATE orcamentos 
SET vendedor_empresa_id = (
    SELECT ve.id 
    FROM vendedor_empresas ve 
    WHERE ve.vendedor_id = orcamentos.vendedor_id 
    AND ve.empresa_id = orcamentos.empresa_id 
    LIMIT 1
);

-- 5. Remover campos antigos da tabela vendedores
ALTER TABLE vendedores DROP COLUMN empresa_id;
ALTER TABLE vendedores DROP COLUMN comissao;
ALTER TABLE vendedores DROP COLUMN meta;

-- 6. Adicionar foreign key para vendedor_empresa_id
ALTER TABLE orcamentos 
ADD FOREIGN KEY (vendedor_empresa_id) REFERENCES vendedor_empresas(id);
