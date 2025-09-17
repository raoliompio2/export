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
  Package,
  Globe,
  Truck,
  Anchor,
  Weight,
  Ruler
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import ModernButton from '@/components/ui/modern-button'
import ProfessionalPrintLayout from './professional-print-layout'
import { createSafeExportData, safeToFixed, formatCurrencySafe, debugCalculations, detectarDescontoReal } from '@/utils/safe-formatting'
import InvoiceTotalsSummary from '@/components/ui/invoice-totals-summary'

// Interface compatível com o Orcamento existente
interface OrcamentoItem {
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
  validadeAte?: string
  createdAt: string
  observacoes?: string
  condicoesPagamento?: string
  prazoEntrega?: string
  frete: number
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
  itens: OrcamentoItem[]
}

// Props específicas para campos de exportação (opcionais)
interface ExportInfo {
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
  totalFreteInternacional?: number
}

interface ExportInvoiceViewProps {
  orcamento: Orcamento
  onClose: () => void
  language?: 'pt' | 'en' | 'es'
  exportInfo?: ExportInfo // Campos específicos de exportação opcionais
  isPublicView?: boolean // Para view pública
}

const translations = {
  pt: {
    title: 'Orçamento de Exportação',
    cliente: 'CLIENTE',
    nomeEmpresa: 'Nome da Empresa / Razão Social:',
    idFiscal: 'ID Fiscal (RUT, CUIT, etc.):',
    enderecoFaturamento: 'Endereço de Faturamento:',
    enderecoEnvio: 'Endereço de Envio:',
    transportista: 'Transportista:',
    dataDespacho: 'Data de Despacho:',
    nomeContato: 'Nome de Contato:',
    emailTelefone: 'E-mail / Telefone de Contato:',
    dataOrcamento: 'Data do Orçamento:',
    validez: 'Validez:',
    vendedor: 'Vendedor:',
    condicoesComerciais: 'Condições Comerciais',
    quantidade: 'Quantidade:',
    transporte: 'Transporte:',
    pagamento: 'Pago:',
    artigos: 'Artigos do Orçamento',
    produto: 'PRODUTO',
    descricao: 'DESCRIÇÃO',
    origem: 'ORIGEM',
    cant: 'CANT.',
    precoUnit: 'PREÇO UNIT. (BRL/USD)',
    totalItem: 'TOTAL (BRL/USD)',
    infoLogistica: 'Informação de Logística',
    freteInternacional: 'Frete Internacional',
    portoDestino: 'Porto de Destino:',
    diasTransito: 'Dias de Trânsito:',
    frete: 'Frete Internacional:',
    seguro: 'Seguro Internacional:',
    taxas: 'Outras Taxas/Desaduanagem:',
    totalFrete: 'Total Frete Internacional:',
    cotacao: 'Cotização Dólar',
    totalBrl: 'TOTAL (BRL):',
    totalUsd: 'TOTAL CIF (USD):',
    observacaoDesaduanagem: 'A empresa NÃO é responsável pelo desembaraço aduaneiro. O cliente deve realizar o desembaraço e retirar a carga no porto de destino.',
    produtos: 'unidades de cada artículo',
    importante: 'IMPORTANTE:',
    mercosur: 'Produtos de origem nacional podem ser elegíveis para benefícios fiscais sob o acordo do Mercosur.',
    presupuesto: 'Este é um orçamento e não uma ordem de venda. Os preços e condições são válidos até a data especificada.'
  },
  en: {
    title: 'Export Quote',
    cliente: 'CLIENT',
    nomeEmpresa: 'Company Name / Corporate Name:',
    idFiscal: 'Tax ID (RUT, CUIT, etc.):',
    enderecoFaturamento: 'Billing Address:',
    enderecoEnvio: 'Shipping Address:',
    transportista: 'Carrier:',
    dataDespacho: 'Dispatch Date:',
    nomeContato: 'Contact Name:',
    emailTelefone: 'E-mail / Contact Phone:',
    dataOrcamento: 'Quote Date:',
    validez: 'Validity:',
    vendedor: 'Salesperson:',
    condicoesComerciais: 'Commercial Conditions',
    quantidade: 'Quantity:',
    transporte: 'Transport:',
    pagamento: 'Payment:',
    artigos: 'Quote Items',
    produto: 'PRODUCT',
    descricao: 'DESCRIPTION',
    origem: 'ORIGIN',
    cant: 'QTY.',
    precoUnit: 'UNIT PRICE (BRL/USD)',
    totalItem: 'TOTAL (BRL/USD)',
    infoLogistica: 'Logistics Information',
    freteInternacional: 'International Freight',
    portoDestino: 'Destination Port:',
    diasTransito: 'Transit Days:',
    frete: 'International Freight:',
    seguro: 'International Insurance:',
    taxas: 'Other Taxes/Customs Clearance:',
    totalFrete: 'Total International Freight:',
    cotacao: 'Dollar Exchange Rate',
    totalBrl: 'TOTAL (BRL):',
    totalUsd: 'TOTAL CIF (USD):',
    observacaoDesaduanagem: 'The company is NOT responsible for customs clearance. The client must perform customs clearance and collect the cargo at the destination port.',
    produtos: 'units of each item',
    importante: 'IMPORTANT:',
    mercosur: 'Products of national origin may be eligible for tax benefits under the Mercosur agreement.',
    presupuesto: 'This is a quote and not a sales order. Prices and conditions are valid until the specified date.'
  },
  es: {
    title: 'Presupuesto de Exportación',
    cliente: 'CLIENTE',
    nomeEmpresa: 'Nombre de la Empresa / Razón Social:',
    idFiscal: 'ID Fiscal (RUT, CUIT, etc.):',
    enderecoFaturamento: 'Dirección de Facturación:',
    enderecoEnvio: 'Dirección de Envío:',
    transportista: 'Transportista:',
    dataDespacho: 'Fecha de Despacho:',
    nomeContato: 'Nombre de Contacto:',
    emailTelefone: 'E-mail / Teléfono de Contacto:',
    dataOrcamento: 'Fecha del Presupuesto:',
    validez: 'Validez:',
    vendedor: 'Vendedor:',
    condicoesComerciais: 'Condiciones Comerciales',
    quantidade: 'Cantidad:',
    transporte: 'Transporte:',
    pagamento: 'Pago:',
    artigos: 'Artículos del Presupuesto',
    produto: 'PRODUCTO',
    descricao: 'DESCRIPCIÓN',
    origem: 'ORIGEN',
    cant: 'CANT.',
    precoUnit: 'PRECIO UNIT. (BRL/USD)',
    totalItem: 'TOTAL (BRL/USD)',
    infoLogistica: 'Información de Logística',
    freteInternacional: 'Flete Internacional',
    portoDestino: 'Puerto de Destino:',
    diasTransito: 'Días de Tránsito:',
    frete: 'Flete Internacional:',
    seguro: 'Seguro Internacional:',
    taxas: 'Otras Tasas/Desaduanaje:',
    totalFrete: 'Total Flete Internacional:',
    cotacao: 'Cotización Dólar',
    totalBrl: 'TOTAL (BRL):',
    totalUsd: 'TOTAL CIF (USD):',
    observacaoDesaduanagem: 'La empresa NO es responsable del desaduanaje. El cliente debe realizar el desaduanaje y retirar la carga en el puerto de destino.',
    produtos: 'unidades de cada artículo',
    importante: 'IMPORTANTE:',
    mercosur: 'Productos de origen nacional pueden ser elegibles para beneficios fiscales bajo el acuerdo del Mercosur.',
    presupuesto: 'Este es un presupuesto y no una orden de venta. Los precios y condiciones son válidos hasta la fecha especificada.'
  }
}

export default function ExportInvoiceView({ 
  orcamento, 
  onClose,
  language = 'pt',
  exportInfo = {},
  isPublicView = false
}: ExportInvoiceViewProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'pt' | 'en' | 'es'>(language)
  
  // Debug para verificar props
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ExportInvoiceView props:', { language, currentLanguage, isPublicView })
  }
  const [exchangeRate, setExchangeRate] = useState(5.42) // Cotação atual
  const [showPrintView, setShowPrintView] = useState(false)
  const t = translations[currentLanguage]

  // USAR APENAS DADOS REAIS DO ORÇAMENTO - COM VALORES SEGUROS!
  const exportData = createSafeExportData(orcamento)
  
  // DEBUG: Para investigar problemas nos cálculos E DESCONTO
  if (process.env.NODE_ENV === 'development') {
    debugCalculations(orcamento, 'ExportInvoiceView')
    console.log('🔍 DEBUG DESCONTO - ExportInvoiceView:', {
      itensCount: orcamento.itens?.length,
      itens: orcamento.itens?.map(item => ({
        id: item.id,
        produto: item.produto?.nome,
        quantidade: item.quantidade,
        precoUnit: item.precoUnit,
        desconto: item.desconto, // ← VALOR CRÍTICO
        total: item.total,
        calculoEsperado: item.quantidade * item.precoUnit * (1 - (item.desconto || 0) / 100)
      }))
    })
  }

  useEffect(() => {
    // Buscar cotação atual do dólar
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('/api/currency?from=USD&to=BRL&amount=1')
        if (response.ok) {
          const data = await response.json()
          setExchangeRate(data.convertedAmount)
        }
      } catch (error) {
        console.error('Erro ao buscar cotação:', error)
      }
    }
    fetchExchangeRate()
  }, [])

  const formatCurrency = (amount: number, currency: 'BRL' | 'USD') => {
    return formatCurrencySafe(amount, currency, exchangeRate)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : 'pt-BR'
    )
  }

  const handlePrint = () => {
    setShowPrintView(true)
    setTimeout(() => {
      window.print()
      setShowPrintView(false)
    }, 500)
  }
  
  const handleDirectPrint = () => {
    setShowPrintView(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  // Cálculo CIF correto: Valor dos produtos em USD + Frete Internacional em USD
  const subtotalUSD = (Number(orcamento.subtotal) || 0) / exchangeRate
  const descontoUSD = (Number(orcamento.desconto) || 0) / exchangeRate
  const freteNacionalUSD = (Number(orcamento.frete) || 0) / exchangeRate
  const totalProdutosUSD = subtotalUSD - descontoUSD + freteNacionalUSD
  const totalCIF = totalProdutosUSD + exportData.totalFreteInternacional

  // Se está em modo de impressão, mostrar apenas o layout profissional
  if (showPrintView) {
    return <ProfessionalPrintLayout orcamento={orcamento} language={currentLanguage} />
  }
  
  // Para página pública, continuar com ExportInvoiceView mas sem ações

  return (
    <div className={`print-container invoice-print-content ${isPublicView ? 'relative bg-white' : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'} print:fixed print:inset-0 print:p-0 print:bg-white print:z-auto print:flex print:items-start print:justify-center`}>
      <div className={`bg-white invoice-content ${isPublicView ? 'w-full min-h-screen' : 'rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden'} print:rounded-none print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible print:relative`}>
        
        {/* Header com ações - OCULTAR NA PÁGINA PÚBLICA */}
        {!isPublicView && (
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 print:hidden`}>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t.title} #{orcamento.numero}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Seletor de idioma */}
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value as 'pt' | 'en' | 'es')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pt">Português 🇧🇷</option>
              <option value="en">English 🇺🇸</option>
              <option value="es">Español 🇪🇸</option>
            </select>
            
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${orcamento.cliente.user.email}`)}
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
            
            {!isPublicView && (
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => {
                  const publicUrl = `${window.location.origin}/orcamento/${orcamento.id}/public`
                  navigator.clipboard.writeText(publicUrl)
                  alert('Link público copiado!')
                }}
                icon={<Globe className="h-4 w-4" />}
              >
                Link Público
              </ModernButton>
            )}
            
            {isPublicView && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                📧 Visualização Pública • USD Focus
              </div>
            )}

             <ModernButton
               variant="primary"
               size="sm"
               onClick={handleDirectPrint}
               icon={<Download className="h-4 w-4" />}
             >
               Gerar PDF
             </ModernButton>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        )}
        
        {/* Header especial para página pública */}
        {isPublicView && (
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-6 print:hidden">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{t.title} #{orcamento.numero}</h1>
                <p className="text-blue-100 mt-1">🌍 International Export Quote • USD Focus</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Exchange Rate</div>
                <div className="text-xl font-bold">US$ 1 = R$ {exchangeRate.toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Invoice */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] print:overflow-visible print:max-h-none">
          <div className="p-8 bg-white print:p-6 print:w-full print:max-w-none">
            
            {/* Cabeçalho da empresa */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start gap-6">
                {orcamento.empresa.logo && (
                  <img
                    src={orcamento.empresa.logo}
                    alt={orcamento.empresa.nome}
                    className="h-20 w-20 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {orcamento.empresa.nome}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{orcamento.empresa.endereco}</p>
                    <p>{orcamento.empresa.cidade}, {orcamento.empresa.estado} - {orcamento.empresa.cep}</p>
                    {orcamento.empresa.telefone && <p>Tel: {orcamento.empresa.telefone}</p>}
                    {orcamento.empresa.email && <p>Email: {orcamento.empresa.email}</p>}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-emerald-600 mb-4">
                  {t.title}
                </h2>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-600" />
                {t.cliente}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">{t.nomeEmpresa}</span>
                    <p className="text-gray-900">{orcamento.cliente.empresa}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">{t.idFiscal}</span>
                    <p className="text-gray-900 font-mono tracking-wider">{orcamento.cliente.cnpj}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">{t.enderecoFaturamento}</span>
                    <p className="text-gray-900">{orcamento.cliente.endereco}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">{t.enderecoEnvio}</span>
                    <p className="text-gray-900">
                      {(orcamento.cliente as any).enderecoEntrega || orcamento.cliente.endereco}
                    </p>
                    <p className="text-gray-900">{orcamento.cliente.cidade}, {orcamento.cliente.estado} {(orcamento.cliente as any).pais || ''}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">{t.transportista}</span>
                    <p className="text-gray-900">{exportData.tipoFrete}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">{t.dataDespacho}</span>
                    <p className="text-gray-900">{formatDate(orcamento.createdAt)}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">{t.nomeContato}</span>
                    <p className="text-gray-900">{(orcamento.cliente as any).contato || orcamento.cliente.user.nome}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">{t.emailTelefone}</span>
                    <p className="text-gray-900">{orcamento.cliente.user.email}</p>
                    {(orcamento.cliente as any).telefone && <p className="text-gray-900">{(orcamento.cliente as any).telefone}</p>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
                <div>
                  <span className="font-semibold text-gray-700">{t.dataOrcamento}</span>
                  <p className="text-gray-900">{formatDate(orcamento.createdAt)}</p>
                </div>
                
                {orcamento.validadeAte && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.validez}</span>
                    <p className="text-gray-900">{formatDate(orcamento.validadeAte)}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-semibold text-gray-700">{t.vendedor}</span>
                  <p className="text-gray-900">{orcamento.vendedor.user.nome}</p>
                </div>
              </div>
            </div>

            {/* Condições Comerciais */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.condicoesComerciais}</h3>
              <div className="flex flex-wrap gap-6">
                <div>
                  <span className="font-semibold text-gray-700">{t.quantidade}</span>
                  <span className="ml-2">{orcamento.itens.length} {t.produtos}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">{t.transporte}</span>
                  <span className="ml-2">{exportData.incoterm}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">{t.pagamento}</span>
                  <span className="ml-2">{orcamento.condicoesPagamento || 'Al contado'}</span>
                </div>
              </div>
            </div>

            {/* Artigos do Orçamento */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.artigos}</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b border-gray-200">
                        {t.produto}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b border-gray-200">
                        {t.descricao}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border-b border-gray-200">
                        {t.origem}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border-b border-gray-200 w-20">
                        {t.cant}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border-b border-gray-200 w-32">
                        {t.precoUnit}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border-b border-gray-200 w-24">
                        DESC. (%)
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border-b border-gray-200 w-32">
                        {t.totalItem}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orcamento.itens.map((item, index) => {
                      const descontoReal = detectarDescontoReal(item)
                      return (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-4 border-b border-gray-200">
                            <div className="flex items-start gap-3">
                              {/* Imagem do produto */}
                              <img 
                                src={item.produto.imagens && item.produto.imagens.length > 0 ? item.produto.imagens[0] : '/images/product-placeholder.svg'} 
                                alt={item.produto.nome}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/product-placeholder.svg'
                                }}
                              />
                              
                              {/* Informações do produto */}
                              <div>
                                <div className="font-semibold text-gray-900">{item.produto.nome}</div>
                                <div className="text-sm text-gray-500">{item.produto.codigo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b border-gray-200">
                            <div className="text-gray-700">
                              {item.produto.descricao}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center border-b border-gray-200">
                            <span className="text-sm font-medium">{item.produto.origem}</span>
                          </td>
                          <td className="px-4 py-4 text-center border-b border-gray-200">
                            <span className="font-semibold">{item.quantidade}</span>
                          </td>
                          <td className="px-4 py-4 text-center border-b border-gray-200">
                            <div className="space-y-1">
                              <div className="font-semibold">{formatCurrency(item.precoUnit, 'BRL')}</div>
                              <div className="text-sm text-gray-600">({formatCurrency(item.precoUnit, 'USD')})</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center border-b border-gray-200">
                            {descontoReal > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                                {descontoReal.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center font-semibold border-b border-gray-200">
                            <div className="space-y-1">
                              <div className="font-bold">{formatCurrency(item.total, 'BRL')}</div>
                              <div className="text-sm text-gray-600">({formatCurrency(item.total, 'USD')})</div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Informações de Logística */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  {t.infoLogistica}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Incoterm:</span>
                    <span>{exportData.incoterm} - {exportData.portoDestino}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Tipo de Flete:</span>
                    <span>{exportData.tipoFrete}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Porto/Destino:</span>
                    <span>{exportData.portoDestino}</span>
                  </div>
                  
                   <div className="flex justify-between">
                     <span className="font-semibold">Peso Bruto Total:</span>
                     <span>{safeToFixed(exportData.pesoBruto)} kg</span>
                   </div>
                   
                   <div className="flex justify-between">
                     <span className="font-semibold">Volume Total:</span>
                     <span>{safeToFixed(exportData.volume)} m³</span>
                   </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Medidas (A x L x C):</span>
                    <span>{exportData.medidas}</span>
                  </div>
                  
                   <div className="flex justify-between">
                     <span className="font-semibold">Número de Caixas:</span>
                     <span>{exportData.numeroCaixas || 0}</span>
                   </div>
                </div>
              </div>

              {/* Frete Internacional */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-blue-600" />
                  {t.freteInternacional}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t.portoDestino}</span>
                    <span>{exportData.portoDestino}</span>
                  </div>
                  
                   {(exportData.diasTransito || 0) > 0 && (
                     <div className="flex justify-between">
                       <span className="font-semibold">{t.diasTransito}</span>
                       <span>{exportData.diasTransito || 0} dias</span>
                     </div>
                   )}
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">{t.frete}</span>
                    <span className="font-mono">${(exportData.freteInternacional || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">{t.seguro}</span>
                    <span className="font-mono">${(exportData.seguroInternacional || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">{t.taxas}</span>
                    <span className="font-mono">${(exportData.taxasDesaduanagem || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t border-blue-200">
                    <span className="font-bold">{t.totalFrete}</span>
                    <span className="font-bold font-mono">${(exportData.totalFreteInternacional || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observação importante */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="text-sm text-yellow-800">
                <strong>Observação:</strong> {t.observacaoDesaduanagem}
              </div>
            </div>

            {/* Resumo de Totais - NOVO COMPONENTE CLARO */}
            <InvoiceTotalsSummary
              totalBRL={orcamento.total}
              exchangeRate={exchangeRate}
              freteInternacional={exportData.totalFreteInternacional}
              language={currentLanguage}
              className="mb-8"
            />

            {/* Notas importantes */}
            <div className="mt-8 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="text-sm text-red-800">
                  <strong>{t.importante}</strong> {t.observacaoDesaduanagem.replace('A empresa', orcamento.empresa.nome)}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>{t.mercosur}</p>
                <p>{t.presupuesto}</p>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p className="font-semibold">
                {orcamento.empresa.nome} - {orcamento.empresa.endereco}, {orcamento.empresa.cidade}, {orcamento.empresa.estado}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
