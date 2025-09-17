import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/perfil - Iniciando...')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário autenticado:', user?.id, user?.role)
    
    if (!user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Buscar dados básicos do usuário primeiro
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        vendedorProfile: {
          include: {
            empresas: {
              include: {
                empresa: true
              }
            }
          }
        },
        clienteProfile: true
      }
    })

    if (!userData) {
      console.log('❌ Usuário não encontrado no banco')
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('👤 Dados do usuário carregados:', {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      role: userData.role,
      vendedorProfile: !!userData.vendedorProfile,
      clienteProfile: !!userData.clienteProfile
    })

    // Se for ADMIN e não tiver vendedorProfile, criar um
    if (user.role === 'ADMIN' && !userData.vendedorProfile) {
      console.log('🔧 Criando perfil de vendedor para ADMIN...')
      
      const vendedorProfile = await prisma.vendedor.create({
        data: {
          userId: userData.id,
          comissao: 5, // Padrão 5%
          meta: 50000, // Padrão R$ 50.000
        }
      })

      // Buscar empresas do vendedor
      const empresas = await prisma.vendedorEmpresa.findMany({
        where: { vendedorId: vendedorProfile.id, ativo: true },
        include: { empresa: true }
      })

      // Atualizar userData para incluir o vendedorProfile com empresas
      userData.vendedorProfile = {
        ...vendedorProfile,
        empresas
      }
      console.log('✅ Perfil de vendedor criado para ADMIN')
    }

    // Buscar estatísticas se for vendedor ou admin
    let stats: any = null
    let orcamentos: any[] = []
    let clientes: any[] = []
    
    if ((user.role === 'VENDEDOR' || user.role === 'ADMIN') && userData.vendedorProfile) {
      const vendedorId = userData.vendedorProfile.id
      
      try {
        const [
          totalClientes,
          totalOrcamentos,
          orcamentosAprovados,
          totalVendas,
          orcamentosData,
          clientesData
        ] = await Promise.all([
          prisma.cliente.count({
            where: { vendedorId }
          }),
          prisma.orcamento.count({
            where: { vendedorId }
          }),
          prisma.orcamento.count({
            where: { 
              vendedorId,
              status: 'APROVADO'
            }
          }),
          prisma.orcamento.aggregate({
            where: { 
              vendedorId,
              status: 'APROVADO'
            },
            _sum: {
              total: true
            }
          }),
          prisma.orcamento.findMany({
            where: { vendedorId },
            include: {
              cliente: {
                include: {
                  user: true
                }
              },
              empresa: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }),
          prisma.cliente.findMany({
            where: { vendedorId },
            include: {
              user: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          })
        ])

        stats = {
          totalClientes,
          totalOrcamentos,
          orcamentosAprovados,
          totalVendas: totalVendas._sum.total || 0
        }

        orcamentos = orcamentosData
        clientes = clientesData
        
        console.log('📊 Estatísticas carregadas:', stats)
      } catch (statsError) {
        console.error('❌ Erro ao carregar estatísticas:', statsError)
        stats = {
          totalClientes: 0,
          totalOrcamentos: 0,
          orcamentosAprovados: 0,
          totalVendas: 0
        }
      }
    }

    // Estruturar dados corretamente para o frontend
    const responseData = {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      telefone: userData.telefone,
      avatar: userData.avatar,
      role: userData.role,
      createdAt: userData.createdAt,
      user: {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone,
        avatar: userData.avatar,
        role: userData.role,
        createdAt: userData.createdAt
      },
      vendedorProfile: userData.vendedorProfile,
      clienteProfile: userData.clienteProfile,
      orcamentos,
      clientes,
      stats
    }

    console.log('📤 Dados enviados para o frontend:', {
      id: responseData.id,
      nome: responseData.nome,
      email: responseData.email,
      role: responseData.role,
      hasUser: !!responseData.user,
      hasVendedorProfile: !!responseData.vendedorProfile,
      hasStats: !!responseData.stats
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}