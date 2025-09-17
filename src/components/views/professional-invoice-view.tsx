'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Download, 
  Printer, 
  Mail, 
  FileText,
  Building,
  User,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import ModernButton from '@/components/ui/modern-button'
import ExchangeRateDisplay from '@/components/ui/exchange-rate-display'

interface OrcamentoItem {
  id: string
  produto: {
    nome: string
    codigo: string
  }
  quantidade: number
  precoUnit: number
  desconto: number
  total: number
  observacoes?: string
}

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
  condicoesPagamento?: string
  prazoEntrega?: string
  observacoes?: string
  vendedor: {
    user: {
      nome: string
      email?: string
      telefone?: string
    }
  }
  empresa: {
    nome: string
    nomeFantasia?: string
    cnpj?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
    telefone?: string
    email?: string
    website?: string
    logo?: string
  }
  cliente?: {
    user: {
      nome: string
      email?: string
    }
    empresa?: string
    cnpj?: string
    endereco?: string
    cidade?: string
    estado?: string
  }
  itens: OrcamentoItem[]
}

interface ProfessionalInvoiceViewProps {
  orcamento: Orcamento
  onClose: () => void
  language?: string
  currency?: 'BRL' | 'USD'
}

export default function ProfessionalInvoiceView({ 
  orcamento, 
  onClose,
  language = 'pt',
  currency = 'USD'
}: ProfessionalInvoiceViewProps) {
  const [conversionRates, setConversionRates] = useState<{[key: string]: number}>({})
  const t = useTranslations('orcamentos.proforma')

  // Buscar todas as conversões de uma vez
  useEffect(() => {
    const fetchAllConversions = async () => {
      try {
        const amounts = [
          ...orcamento.itens.map(item => item.precoUnit),
          ...orcamento.itens.map(item => item.total),
          orcamento.subtotal,
          orcamento.desconto,
          orcamento.frete,
          orcamento.total
        ]

        const conversions: {[key: string]: number} = {}
        
        for (const amount of amounts) {
          if (amount && amount > 0) {
            const response = await fetch(`/api/currency?from=BRL&to=USD&amount=${amount}`)
            if (response.ok) {
              const data = await response.json()
              conversions[amount.toString()] = data.convertedAmount
            }
          }
        }
        
        setConversionRates(conversions)
      } catch (error) {
        console.error('Erro ao buscar conversões:', error)
      }
    }

    if (currency === 'USD') {
      fetchAllConversions()
    }
  }, [orcamento, currency])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Implementar download PDF
    console.log('Download PDF')
  }

  const handleEmail = () => {
    // Implementar envio por email
    console.log('Enviar por email')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR'
    )
  }

  const formatCurrency = (amount: number, targetCurrency: string = currency) => {
    // Se for USD e temos a conversão, usar valor convertido
    if (targetCurrency === 'USD' && conversionRates[amount.toString()]) {
      amount = conversionRates[amount.toString()]
    }
    
    return new Intl.NumberFormat(
      targetCurrency === 'USD' ? 'en-US' : 'pt-BR',
      {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: 2
      }
    ).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header com ações */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('title')} #{orcamento.numero}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mostrar cotação atual */}
            <ExchangeRateDisplay size="sm" className="mr-4" />
            
            <ModernButton
              variant="outline"
              size="sm"
              onClick={handleEmail}
              icon={<Mail className="h-4 w-4" />}
            >
              Email
            </ModernButton>
            
            <ModernButton
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="h-4 w-4" />}
            >
              Imprimir
            </ModernButton>
            
            <ModernButton
              variant="primary"
              size="sm"
              onClick={handleDownload}
              icon={<Download className="h-4 w-4" />}
            >
              PDF
            </ModernButton>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conteúdo da Invoice */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-8 bg-white print:p-6">
            
            {/* Cabeçalho da empresa */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start gap-6">
                {orcamento.empresa.logo && (
                  <Image
                    src={orcamento.empresa.logo}
                    alt={orcamento.empresa.nome}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {orcamento.empresa.nome}
                  </h1>
                  {orcamento.empresa.nomeFantasia && (
                    <p className="text-lg text-gray-600 mb-1">
                      {orcamento.empresa.nomeFantasia}
                    </p>
                  )}
                  <div className="text-sm text-gray-600 space-y-1">
                    {orcamento.empresa.cnpj && (
                      <p>CNPJ: {orcamento.empresa.cnpj}</p>
                    )}
                    {orcamento.empresa.endereco && (
                      <p>{orcamento.empresa.endereco}</p>
                    )}
                    {(orcamento.empresa.cidade || orcamento.empresa.estado) && (
                      <p>
                        {orcamento.empresa.cidade}
                        {orcamento.empresa.cidade && orcamento.empresa.estado && ', '}
                        {orcamento.empresa.estado}
                        {orcamento.empresa.cep && ` - ${orcamento.empresa.cep}`}
                      </p>
                    )}
                    {orcamento.empresa.telefone && (
                      <p>Tel: {orcamento.empresa.telefone}</p>
                    )}
                    {orcamento.empresa.email && (
                      <p>Email: {orcamento.empresa.email}</p>
                    )}
                    {orcamento.empresa.website && (
                      <p>Web: {orcamento.empresa.website}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-emerald-600 mb-2">
                  {t('title')}
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">{t('numero')}:</span> {orcamento.numero}</p>
                  <p><span className="font-medium">{t('data')}:</span> {formatDate(orcamento.createdAt)}</p>
                  {orcamento.validadeAte && (
                    <p><span className="font-medium">{t('validadeAte')}:</span> {formatDate(orcamento.validadeAte)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informações do vendedor e cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Vendedor */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  {t('vendedor')}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{orcamento.vendedor.user.nome}</p>
                  {orcamento.vendedor.user.email && (
                    <p>Email: {orcamento.vendedor.user.email}</p>
                  )}
                  {orcamento.vendedor.user.telefone && (
                    <p>Tel: {orcamento.vendedor.user.telefone}</p>
                  )}
                </div>
              </div>

              {/* Cliente */}
              {orcamento.cliente && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="h-5 w-5 text-emerald-600" />
                    {t('cliente')}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{orcamento.cliente.user.nome}</p>
                    {orcamento.cliente.empresa && (
                      <p>{orcamento.cliente.empresa}</p>
                    )}
                    {orcamento.cliente.cnpj && (
                      <p>CNPJ: {orcamento.cliente.cnpj}</p>
                    )}
                    {orcamento.cliente.endereco && (
                      <p>{orcamento.cliente.endereco}</p>
                    )}
                    {(orcamento.cliente.cidade || orcamento.cliente.estado) && (
                      <p>
                        {orcamento.cliente.cidade}
                        {orcamento.cliente.cidade && orcamento.cliente.estado && ', '}
                        {orcamento.cliente.estado}
                      </p>
                    )}
                    {orcamento.cliente.user.email && (
                      <p>Email: {orcamento.cliente.user.email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Título e descrição */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {orcamento.titulo}
              </h3>
              {orcamento.descricao && (
                <p className="text-gray-600">{orcamento.descricao}</p>
              )}
            </div>

            {/* Tabela de itens */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                      {t('produto')}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 w-20">
                      {t('quantidade')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200 w-28">
                      {t('precoUnitario')} (USD)
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200 w-28">
                      {t('total')} (USD)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orcamento.itens.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">{item.produto.nome}</p>
                          <p className="text-sm text-gray-600">Código: {item.produto.codigo}</p>
                          {item.observacoes && (
                            <p className="text-sm text-gray-500 mt-1">{item.observacoes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center border-b border-gray-200">
                        {item.quantidade}
                      </td>
                      <td className="px-4 py-3 text-right border-b border-gray-200">
                        {formatCurrency(item.precoUnit, currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold border-b border-gray-200">
                        {formatCurrency(item.total, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="flex justify-end mb-8">
              <div className="w-80 space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">{t('subtotal')}:</span>
                  <span className="font-medium">
                    {formatCurrency(orcamento.subtotal, currency)}
                  </span>
                </div>
                
                {orcamento.desconto > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('desconto')}:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(orcamento.desconto, currency)}
                    </span>
                  </div>
                )}
                
                {orcamento.frete > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('frete')}:</span>
                    <span className="font-medium">
                      {formatCurrency(orcamento.frete, currency)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-semibold text-gray-900">{t('valorTotal')}:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(orcamento.total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Condições */}
            <div className="space-y-6">
              {orcamento.condicoesPagamento && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    {t('condicoesPagamento')}
                  </h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {orcamento.condicoesPagamento}
                  </p>
                </div>
              )}

              {orcamento.prazoEntrega && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    {t('prazoEntrega')}
                  </h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {orcamento.prazoEntrega}
                  </p>
                </div>
              )}

              {orcamento.observacoes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    {t('observacoes')}
                  </h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {orcamento.observacoes}
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>
                Este é um documento gerado eletronicamente e é válido sem assinatura física.
              </p>
              <p className="mt-1">
                {orcamento.empresa.nome} - Gerado em {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
