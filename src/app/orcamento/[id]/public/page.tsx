'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import ProfessionalPrintLayout from '@/components/views/professional-print-layout'
import { Loader2, Download, Globe } from 'lucide-react'
import './globals.css'

interface Orcamento {
  id: string
  numero: string
  titulo: string
  descricao?: string
  status: string
  subtotal: number
  desconto: number
  total: number
  frete: number
  validadeAte?: string
  createdAt: string
  observacoes?: string
  condicoesPagamento?: string
  prazoEntrega?: string
  
  // Campos de exportação
  incoterm?: string
  portoDestino?: string
  tipoFrete?: string
  diasTransito?: number
  pesoBruto?: number
  volume?: number
  medidas?: string
  numeroCaixas?: number
  freteInternacional?: number
  seguroInternacional?: number
  taxasDesaduanagem?: number
  
  cliente: {
    user: {
      nome: string
      email: string
      telefone?: string
    }
    empresa?: string
    cnpj?: string
    cpf?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  vendedor: {
    user: {
      nome: string
      email: string
    }
  }
  empresa: {
    nome: string
    cnpj: string
    endereco: string
    numero?: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
    email: string
    telefone?: string
    logo?: string
  }
  itens: Array<{
    id: string
    produto: {
      nome: string
      descricao?: string
      codigo: string
      unidade: string
      imagens?: string[]
      origem?: string
    }
    quantidade: number
    precoUnit: number
    desconto: number
    total: number
    observacoes?: string
  }>
}

export default function PublicOrcamentoPage() {
  const params = useParams()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt')

  useEffect(() => {
    if (!params.id) {
      console.log('❌ ID do orçamento não fornecido')
      return
    }

    const fetchOrcamento = async () => {
      try {
        console.log('🔄 Buscando orçamento:', params.id)
        const response = await fetch(`/api/orcamentos/${params.id}/public`)
        
        console.log('📡 Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log('❌ Erro na response:', errorData)
          
          if (response.status === 404) {
            notFound()
          }
          throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro ao carregar orçamento'}`)
        }

        const data = await response.json()
        console.log('✅ Orçamento carregado com sucesso:', data.numero)
        setOrcamento(data)
      } catch (error) {
        console.error('💥 Erro ao carregar orçamento:', error)
        setError(error instanceof Error ? error.message : 'Erro ao carregar orçamento')
      } finally {
        setLoading(false)
      }
    }

    fetchOrcamento()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    )
  }

  if (error || !orcamento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Orçamento não encontrado</h1>
          <p className="text-gray-600">O link pode estar inválido ou o orçamento foi removido.</p>
        </div>
      </div>
    )
  }

  const handleGeneratePDF = () => {
    window.print()
  }

  const handleLanguageChange = () => {
    const languages: ('pt' | 'en' | 'es')[] = ['pt', 'en', 'es']
    const currentIndex = languages.indexOf(language)
    const nextIndex = (currentIndex + 1) % languages.length
    setLanguage(languages[nextIndex])
  }

  const getLanguageDisplay = () => {
    const flags = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' }
    const names = { pt: 'Português', en: 'English', es: 'Español' }
    return `${flags[language]} ${names[language]}`
  }

  return (
    <>
      {/* CSS global para garantir que botões desapareçam na impressão */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .floating-buttons,
            button,
            .no-print {
              display: none !important;
              visibility: hidden !important;
            }
          }
        `
      }} />
      
      <div className="min-h-screen bg-white relative">
        {/* Botões flutuantes - só aparecem na tela, não na impressão */}
        <div className="floating-buttons fixed top-4 right-4 z-50 flex gap-2 print:hidden no-print">
        {/* Botão de idioma */}
        <button
          onClick={handleLanguageChange}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200"
          title="Trocar idioma"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{getLanguageDisplay()}</span>
        </button>

        {/* Botão de PDF */}
        <button
          onClick={handleGeneratePDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200"
          title="Gerar PDF"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">PDF</span>
        </button>
        </div>

        <ProfessionalPrintLayout 
          orcamento={orcamento}
          language={language}
        />
      </div>
    </>
  )
}
