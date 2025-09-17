import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
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
          role: UserRole.CLIENTE, // Padrão é cliente
        },
        include: {
          clienteProfile: true,
          vendedorProfile: true,
        }
      })

      // Criar perfil de cliente por padrão
      await prisma.cliente.create({
        data: {
          userId: user.id,
        }
      })
      console.log('✅ Novo usuário e perfil cliente criados')
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

export async function updateUserRole(userId: string, newRole: UserRole) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    include: {
      clienteProfile: true,
      vendedorProfile: true,
    }
  })

  // Criar perfil específico se necessário
  if (newRole === UserRole.VENDEDOR && !user.vendedorProfile) {
    await prisma.vendedor.create({
      data: {
        userId: user.id,
      }
    })
  }

  return user
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
  if (user.role !== UserRole.VENDEDOR && user.role !== UserRole.ADMIN) {
    throw new Error('Acesso restrito a vendedores')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    throw new Error('Acesso restrito a administradores')
  }
  return user
}
