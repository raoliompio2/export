import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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

// Schema para atualização de perfil
const updatePerfilSchema = z.object({
  userData: z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido').optional(),
    telefone: z.string().optional(),
    avatar: z.string().optional(),
  }),
  clienteData: z.object({
    empresa: z.string().optional(),
    cnpj: z.string().optional(),
    cpf: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
    observacoes: z.string().optional(),
  }).optional(),
  vendedorData: z.object({
    comissao: z.number().min(0).max(100),
    meta: z.number().min(0),
  }).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/perfil - Iniciando...')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário:', user?.id, user?.role)
    
    if (!user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Dados recebidos:', {
      hasUserData: !!body.userData,
      hasClienteData: !!body.clienteData,
      hasVendedorData: !!body.vendedorData
    })
    
    const validatedData = updatePerfilSchema.parse(body)
    console.log('✅ Dados validados')

    // Verificar se email já existe (se está sendo alterado)
    if (validatedData.userData.email && validatedData.userData.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.userData.email }
      })

      if (existingUser && existingUser.id !== user.id) {
        console.log('❌ Email já está em uso')
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Atualizar dados do usuário
    const userUpdateData: any = {
      nome: validatedData.userData.nome,
    }
    
    if (validatedData.userData.email) {
      userUpdateData.email = validatedData.userData.email
    }
    if (validatedData.userData.telefone !== undefined) {
      userUpdateData.telefone = validatedData.userData.telefone
    }
    if (validatedData.userData.avatar !== undefined) {
      userUpdateData.avatar = validatedData.userData.avatar
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: userUpdateData
    })

    console.log('✅ Dados do usuário atualizados')

    // Atualizar dados do cliente se fornecidos
    if (validatedData.clienteData && user.clienteProfile) {
      await prisma.cliente.update({
        where: { id: user.clienteProfile.id },
        data: {
          empresa: validatedData.clienteData.empresa,
          cnpj: validatedData.clienteData.cnpj,
          cpf: validatedData.clienteData.cpf,
          endereco: validatedData.clienteData.endereco,
          cidade: validatedData.clienteData.cidade,
          estado: validatedData.clienteData.estado,
          cep: validatedData.clienteData.cep,
          observacoes: validatedData.clienteData.observacoes,
        }
      })
      console.log('✅ Dados do cliente atualizados')
    }

    // Atualizar dados do vendedor se fornecidos
    if (validatedData.vendedorData && user.vendedorProfile) {
      await prisma.vendedor.update({
        where: { id: user.vendedorProfile.id },
        data: {
          comissao: validatedData.vendedorData.comissao,
          meta: validatedData.vendedorData.meta,
        }
      })
      console.log('✅ Dados do vendedor atualizados')
    }

    console.log('🎉 Perfil atualizado com sucesso')
    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    })

  } catch (error) {
    console.log('❌ Erro capturado:', error)
    
    if (error instanceof z.ZodError) {
      console.log('🔍 Erro de validação Zod:', error.issues)
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('❌ Erro ao atualizar perfil:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}