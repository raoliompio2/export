import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔧 Iniciando correção dos dados...')

    // 1. Buscar primeira empresa
    const empresa = await prisma.empresa.findFirst({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log('Empresa encontrada:', empresa?.nome)
    
    if (!empresa) {
      return NextResponse.json({ 
        error: 'Nenhuma empresa encontrada',
        success: false 
      }, { status: 404 })
    }

    // 2. Buscar usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { email: 'rafael.popeartstudio@gmail.com' }
    })

    console.log('Usuário encontrado:', adminUser?.email)

    if (!adminUser) {
      return NextResponse.json({ 
        error: 'Usuário admin não encontrado',
        success: false 
      }, { status: 404 })
    }

    // 3. Criar ou atualizar perfil vendedor (versão simplificada)
    const vendedor = await prisma.vendedor.upsert({
      where: { userId: adminUser.id },
      update: {
        comissao: 5.0,
        meta: 10000.0,
        ativo: true
      },
      create: {
        userId: adminUser.id,
        comissao: 5.0,
        meta: 10000.0,
        ativo: true
      }
    })

    // 3.1. Vincular vendedor à empresa
    await prisma.vendedorEmpresa.upsert({
      where: {
        vendedorId_empresaId: {
          vendedorId: vendedor.id,
          empresaId: empresa.id
        }
      },
      update: {
        ativo: true,
        comissao: 5.0,
        meta: 10000.0
      },
      create: {
        vendedorId: vendedor.id,
        empresaId: empresa.id,
        ativo: true,
        comissao: 5.0,
        meta: 10000.0
      }
    })

    console.log('Vendedor criado/atualizado:', vendedor.id)

    // 4. Tentar criar perfil cliente (opcional)
    try {
      await prisma.cliente.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
          userId: adminUser.id,
          vendedorId: vendedor.id
        }
      })
      console.log('Perfil cliente criado/atualizado')
    } catch (clienteError) {
      console.log('Erro ao criar perfil cliente (não crítico):', clienteError)
    }

    return NextResponse.json({
      success: true,
      message: 'Dados corrigidos com sucesso!',
      data: {
        usuario: adminUser.email,
        vendedorId: vendedor.id,
        empresaId: empresa.id,
        empresaNome: empresa.nome
      }
    })

  } catch (error) {
    console.error('Erro detalhado ao corrigir dados:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
