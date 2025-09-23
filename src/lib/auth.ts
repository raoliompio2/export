import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

// Tipo para o retorno do getCurrentUser
export type AuthUser = {
  id: string
  clerkId: string
  email: string
  nome: string
  role: 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
  telefone?: string
  avatar?: string
  ativo: boolean
  aprovadoPor?: string
  aprovadoEm?: Date
  motivoRejeicao?: string
  createdAt: Date
  updatedAt: Date
  clienteProfile?: any
  vendedorProfile?: any
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      console.log('🔍 Clerk user não encontrado')
      return null
    }

    console.log('👤 Clerk user:', { id: clerkUser.id, email: clerkUser.emailAddresses[0]?.emailAddress })

    // Buscar ou criar usuário no banco de dados
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        clienteProfile: true,
        vendedorProfile: true,
      }
    }).catch((error) => {
      console.error('❌ Erro ao buscar usuário por clerkId:', error)
      return null
    })

    console.log('🔍 User encontrado por clerkId:', user ? { id: user.id, email: user.email, role: user.role } : 'null')

  if (!user) {
    // Se não encontrou por clerkId, tentar encontrar por email
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || ''
    
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        clienteProfile: true,
        vendedorProfile: true,
      }
    }).catch((error) => {
      console.error('❌ Erro ao buscar usuário por email:', error)
      return null
    })

    console.log('🔍 User encontrado por email:', user ? { id: user.id, email: user.email, role: user.role } : 'null')

    if (user) {
      // Se encontrou por email, atualizar o clerkId
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: clerkUser.id,
          nome: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.nome,
          avatar: clerkUser.imageUrl || user.avatar,
        },
        include: {
          clienteProfile: true,
          vendedorProfile: true,
        }
      }).catch((error) => {
        console.error('❌ Erro ao atualizar clerkId:', error)
        return user // Retorna o usuário original se falhar
      })
      console.log('✅ ClerkId atualizado para user existente')
    } else {
      // Se não encontrou nem por clerkId nem por email, criar novo usuário
      console.log('🆕 Criando novo usuário')
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: userEmail,
          nome: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          avatar: clerkUser.imageUrl,
          role: 'CLIENTE', // Padrão é cliente
        },
        include: {
          clienteProfile: true,
          vendedorProfile: true,
        }
      }).catch((error) => {
        console.error('❌ Erro ao criar novo usuário:', error)
        return null
      })

      // NÃO criar perfil automaticamente - só após aprovação
      console.log('✅ Novo usuário criado (PENDENTE aprovação)')
    }
  }

  console.log('🎯 User final:', user ? { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    hasVendedor: !!user.vendedorProfile,
    vendedorId: user.vendedorProfile?.id
  } : 'null')

  return user

  } catch (error) {
    console.error('❌ Erro em getCurrentUser:', error)
    return null
  }
}

export async function updateUserRole(userId: string, newRole: 'ADMIN' | 'VENDEDOR' | 'CLIENTE') {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    include: {
      clienteProfile: true,
      vendedorProfile: true,
    }
  })

  // Criar perfil específico se necessário
  if (newRole === 'VENDEDOR' && !user.vendedorProfile) {
    await prisma.vendedor.create({
      data: {
        userId: user.id,
      }
    })
  }

  return user
}

// Função para aprovar usuário
export async function approveUser(userId: string, role: 'ADMIN' | 'VENDEDOR' | 'CLIENTE', adminId: string) {
  try {
    // Atualizar status e role do usuário
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        aprovadoPor: adminId,
        aprovadoEm: new Date(),
        motivoRejeicao: null, // Limpar se havia
      },
      include: {
        clienteProfile: true,
        vendedorProfile: true,
      }
    })

    // Criar perfil baseado no role aprovado
    if (role === 'CLIENTE' && !user.clienteProfile) {
      await prisma.cliente.create({
        data: { userId: user.id }
      })
    } else if (role === 'VENDEDOR' && !user.vendedorProfile) {
      await prisma.vendedor.create({
        data: { userId: user.id }
      })
    }

    console.log(`✅ Usuário ${user.email} aprovado como ${role}`)
    return user
  } catch (error) {
    console.error('❌ Erro ao aprovar usuário:', error)
    throw error
  }
}

// Função para rejeitar usuário
export async function rejectUser(userId: string, motivo: string, adminId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        aprovadoPor: adminId,
        aprovadoEm: new Date(),
        motivoRejeicao: motivo,
      },
      include: {
        clienteProfile: true,
        vendedorProfile: true,
      }
    })

    console.log(`❌ Usuário ${user.email} rejeitado: ${motivo}`)
    return user
  } catch (error) {
    console.error('❌ Erro ao rejeitar usuário:', error)
    throw error
  }
}

// Função para verificar se usuário está aprovado
export function isUserApproved(user: { aprovadoEm?: Date | null; motivoRejeicao?: string | null }): boolean {
  return !!user?.aprovadoEm && !user?.motivoRejeicao
}

// Função para obter usuários pendentes (para admins)
export async function getPendingUsers() {
  try {
    return await prisma.user.findMany({
      where: { aprovadoEm: null },
      orderBy: { createdAt: 'desc' },
      include: {
        clienteProfile: true,
        vendedorProfile: true,
      }
    })
  } catch (error) {
    console.error('❌ Erro ao buscar usuários pendentes:', error)
    return []
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }
  return user
}

export async function requireVendedor() {
  const user = await requireAuth()
  if (user.role !== 'VENDEDOR' && user.role !== 'ADMIN') {
    return null // Retorna null em vez de lançar erro
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    return null // Retorna null em vez de lançar erro
  }
  return user
}

// Função auxiliar para redirecionar usuário baseado no role
export function getUserRedirectPath(user: AuthUser | null): string {
  if (!user) {
    return '/' // Não logado, ir para login
  }

  switch (user.role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'VENDEDOR':
      return '/vendedor/dashboard'
    case 'CLIENTE':
      return '/cliente/produtos'
    default:
      // Usuário sem role válido ou pendente de aprovação
      return '/aguardando-aprovacao'
  }
}
