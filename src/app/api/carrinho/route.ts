import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para adicionar item ao carrinho
const addItemSchema = z.object({
  produtoId: z.string().min(1, 'Produto é obrigatório'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  observacoes: z.string().optional()
})

// GET - Listar itens do carrinho
export async function GET() {
  console.log('🛒 GET /api/carrinho - iniciando...')
  
  try {
    const user = await getCurrentUser()
    console.log('🛒 GET - user obtido:', user ? { id: user.id, email: user.email, role: user.role } : 'null')
    
    if (!user) {
      console.log('🛒 GET - user não autenticado')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Se for admin, pode usar carrinho para testes
    let clienteProfile = user.clienteProfile
    console.log('🛒 GET - clienteProfile inicial:', clienteProfile ? { id: clienteProfile.id } : 'null')
    
    if (!clienteProfile && user.role === 'ADMIN') {
      console.log('🛒 GET - buscando clienteProfile para admin...')
      clienteProfile = await prisma.cliente.findUnique({
        where: { userId: user.id }
      })
      console.log('🛒 GET - clienteProfile encontrado para admin:', clienteProfile ? { id: clienteProfile.id } : 'null')
    }

    if (!clienteProfile) {
      console.log('🛒 GET - clienteProfile não encontrado')
      return NextResponse.json(
        { error: 'Acesso negado - apenas clientes podem usar o carrinho' },
        { status: 403 }
      )
    }

    console.log('🛒 GET - buscando itens do carrinho...')
    const carrinhoItens = await prisma.carrinhoItem.findMany({
      where: {
        clienteId: clienteProfile.id
      },
      include: {
        produto: {
          include: {
            categoria: true,
            empresa: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`🛒 GET - encontrados ${carrinhoItens.length} itens`)
    return NextResponse.json(carrinhoItens)
  } catch (error) {
    console.error('❌ Erro ao listar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Iniciando POST /api/carrinho...')
    const user = await getCurrentUser()
    console.log('🛒 User obtido:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      hasClienteProfile: !!user.clienteProfile,
      clienteProfileId: user.clienteProfile?.id
    } : 'null')
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Se for admin, pode usar carrinho para testes (criará perfil de cliente se necessário)
    let clienteProfile = user.clienteProfile
    
    if (!clienteProfile && user.role === 'ADMIN') {
      console.log('🔧 Admin testando carrinho - criando perfil de cliente temporário')
      clienteProfile = await prisma.cliente.create({
        data: {
          userId: user.id,
          empresa: 'Administrador - Teste',
          ativo: true
        }
      })
    }

    if (!clienteProfile) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas clientes podem usar o carrinho', details: `Usuário ${user.email} tem role ${user.role} mas não tem clienteProfile` },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📦 Dados recebidos no carrinho:', body)
    const validatedData = addItemSchema.parse(body)
    console.log('✅ Dados validados:', validatedData)

    // Verificar se o produto existe e está ativo
    const produto = await prisma.produto.findFirst({
      where: {
        id: validatedData.produtoId,
        status: 'ATIVO'
      }
    })

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado ou indisponível' },
        { status: 404 }
      )
    }

      // Verificar se já existe no carrinho
      const itemExistente = await prisma.carrinhoItem.findUnique({
        where: {
          clienteId_produtoId: {
            clienteId: clienteProfile.id,
            produtoId: validatedData.produtoId
          }
        }
      })

    if (itemExistente) {
      // Atualizar quantidade
      const itemAtualizado = await prisma.carrinhoItem.update({
        where: {
          id: itemExistente.id
        },
        data: {
          quantidade: itemExistente.quantidade + validatedData.quantidade,
          observacoes: validatedData.observacoes || itemExistente.observacoes
        },
        include: {
          produto: {
            include: {
              categoria: true,
              empresa: true
            }
          }
        }
      })

      return NextResponse.json(itemAtualizado)
    } else {
      // Criar novo item
      const novoItem = await prisma.carrinhoItem.create({
        data: {
          clienteId: clienteProfile.id,
          produtoId: validatedData.produtoId,
          quantidade: validatedData.quantidade,
          observacoes: validatedData.observacoes
        },
        include: {
          produto: {
            include: {
              categoria: true,
              empresa: true
            }
          }
        }
      })

      return NextResponse.json(novoItem, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erro de validação Zod:', error.issues)
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('❌ Erro ao adicionar ao carrinho:', error)
    console.error('❌ Stack trace completo:', error.stack)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Limpar carrinho
export async function DELETE() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    if (!user.clienteProfile) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas clientes podem usar o carrinho' },
        { status: 403 }
      )
    }

    await prisma.carrinhoItem.deleteMany({
      where: {
        clienteId: user.clienteProfile.id
      }
    })

    return NextResponse.json({ message: 'Carrinho limpo com sucesso' })
  } catch (error) {
    console.error('❌ Erro ao limpar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
