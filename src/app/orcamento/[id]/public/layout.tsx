import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params
  
  try {
    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        empresa: true,
        cliente: { include: { user: true } }
      }
    })

    if (!orcamento) {
      return {
        title: 'Orçamento não encontrado | Sistema de Exportação',
        description: 'O orçamento solicitado não foi encontrado.',
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    return {
      title: `Orçamento ${orcamento.numero} | ${orcamento.empresa.nome} - Sistema de Exportação`,
      description: `Orçamento de exportação ${orcamento.numero} da empresa ${orcamento.empresa.nome}. ${orcamento.titulo || 'Visualização pública de orçamento de exportação.'}`,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      openGraph: {
        title: `Orçamento ${orcamento.numero} | ${orcamento.empresa.nome}`,
        description: `Orçamento de exportação da empresa ${orcamento.empresa.nome}`,
        type: 'website',
      },
    }
  } catch (error) {
    return {
      title: 'Orçamento de Exportação | Visualização Pública',
      description: 'Visualização pública de orçamento de exportação - Sistema de Orçamentos de Exportação',
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export default function PublicOrcamentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
