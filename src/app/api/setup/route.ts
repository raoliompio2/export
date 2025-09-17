import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Criar categorias padrão se não existirem
    const categorias = [
      { nome: 'Eletrônicos', descricao: 'Produtos eletrônicos e tecnologia' },
      { nome: 'Roupas', descricao: 'Vestuário e acessórios' },
      { nome: 'Casa e Jardim', descricao: 'Produtos para casa e jardim' },
      { nome: 'Esportes', descricao: 'Artigos esportivos e fitness' },
      { nome: 'Livros', descricao: 'Livros e material didático' },
      { nome: 'Beleza', descricao: 'Cosméticos e produtos de beleza' },
      { nome: 'Automóveis', descricao: 'Peças e acessórios automotivos' },
      { nome: 'Ferramentas', descricao: 'Ferramentas e equipamentos' },
    ]

    for (const categoria of categorias) {
      await prisma.categoria.upsert({
        where: { nome: categoria.nome },
        update: {},
        create: categoria
      })
    }

    return NextResponse.json({ 
      message: 'Categorias padrão criadas com sucesso',
      categorias: categorias.length 
    })
  } catch (error) {
    console.error('Erro ao criar categorias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
