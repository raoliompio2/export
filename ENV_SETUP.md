# Configuração de Variáveis de Ambiente

## Arquivo .env.local

Este projeto requer um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

## Variáveis Obrigatórias

### Banco de Dados (PostgreSQL)
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/export_db"
```
- **Formato**: `postgresql://usuario:senha@host:porta/database`
- **Exemplo local**: `postgresql://postgres:senha@localhost:5432/export_db`
- **Exemplo produção**: `postgresql://usuario:senha@host.provedor.com:5432/database?sslmode=require`

### Clerk (Autenticação)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```
- Obtenha essas chaves em: https://dashboard.clerk.com
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Pode ser exposta publicamente
- **CLERK_SECRET_KEY**: NUNCA compartilhe esta chave

### URLs do Clerk (Opcional)
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

### Next.js
```env
NODE_ENV="development"
NEXTAUTH_SECRET="seu-secret-aqui"
```
- **NODE_ENV**: `development`, `production` ou `test`
- **NEXTAUTH_SECRET**: Gere uma chave segura: `openssl rand -base64 32`

## Como Configurar

1. **Crie o arquivo `.env.local` na raiz do projeto:**
   ```bash
   # No PowerShell
   New-Item -Path ".env.local" -ItemType File
   ```

2. **Adicione todas as variáveis acima com os valores corretos**

3. **NUNCA commite o arquivo `.env.local` no git** (já está no .gitignore)

4. **Para produção**, configure as variáveis no painel da Vercel/hospedagem

## Exemplo Completo

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:senha@localhost:5432/export_db"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_abc123..."
CLERK_SECRET_KEY="sk_test_xyz789..."

# URLs do Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Next.js
NODE_ENV="development"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

## Verificação

Após configurar, execute:
```bash
npm run dev
```

Se houver erros de variáveis de ambiente, verifique se todas as variáveis estão configuradas corretamente.

## Importante

- ⚠️ **NUNCA** compartilhe suas chaves secretas
- ⚠️ **NUNCA** commite o arquivo `.env.local`
- ✅ Use `.env.local` para desenvolvimento local
- ✅ Configure variáveis no painel da Vercel para produção

