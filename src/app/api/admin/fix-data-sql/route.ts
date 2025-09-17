import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔧 Iniciando correção com SQL direto...')

    // Executar SQL direto para corrigir
    await prisma.$executeRaw`
      UPDATE vendedores 
      SET "empresaId" = (SELECT id FROM empresas ORDER BY "createdAt" LIMIT 1)
      WHERE "userId" = (
        SELECT id FROM users 
        WHERE email = 'rafael.popeartstudio@gmail.com'
      );
    `

    console.log('✅ SQL executado com sucesso')

    // Verificar resultado
    const result = await prisma.$queryRaw`
      SELECT 
        u.email,
        v.id as vendedor_id,
        v."empresaId",
        e.nome as empresa_nome
      FROM users u 
      LEFT JOIN vendedores v ON u.id = v."userId" 
      LEFT JOIN empresas e ON v."empresaId" = e.id
      WHERE u.email = 'rafael.popeartstudio@gmail.com'
    ` as { id: string; nome: string; email: string; role: string }[]

    return NextResponse.json({
      success: true,
      message: 'Dados corrigidos com SQL direto!',
      data: result[0] || {}
    })

  } catch (error) {
    console.error('Erro SQL:', error)
    return NextResponse.json({ 
      error: 'Erro ao executar SQL',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false 
    }, { status: 500 })
  }
}
