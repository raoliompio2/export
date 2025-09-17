'use client'

import { useState, useEffect } from 'react'
import { createSafeExportData, safeToFixed, formatCurrencySafe, debugCalculations, detectarDescontoReal } from '@/utils/safe-formatting'

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
  itens: OrcamentoItem[]
}

interface ProfessionalPrintLayoutProps {
  orcamento: Orcamento
  language?: 'pt' | 'en' | 'es'
}

const translations = {
  en: {
    title: 'EXPORT QUOTE',
    date: 'Date',
    customer: 'CUSTOMER',
    commercialConditions: 'COMMERCIAL CONDITIONS',
    items: 'QUOTATION ITEMS',
    product: 'PRODUCT',
    image: 'IMAGE',
    origin: 'ORIGIN',
    qty: 'QTY.',
    unitPrice: 'UNIT PRICE (USD/BRL)',
    discount: 'DISC. (%)',
    total: 'TOTAL (USD/BRL)',
    logistics: 'LOGISTICS INFORMATION',
    freight: 'International Freight',
    totals: 'TOTALS',
    subtotal: 'Subtotal',
    grandTotal: 'GRAND TOTAL',
    exchangeRate: 'Exchange Rate',
    incoterm: 'Incoterm',
    port: 'Destination Port',
    payment: 'Payment Terms',
    delivery: 'Delivery',
    weight: 'Gross Weight',
    volume: 'Volume',
    boxes: 'Boxes',
    transitDays: 'Transit Days',
    notes: 'Important Notes',
    customsNote: 'The company is NOT responsible for customs clearance. The client must perform customs clearance and collect the cargo at the destination port.',
    mercosurNote: 'Products of national origin may be eligible for tax benefits under the Mercosur agreement.',
    quoteNote: 'This is a quote and not a sales order. Prices and conditions are valid until the specified date.'
  },
  pt: {
    title: 'ORÇAMENTO DE EXPORTAÇÃO',
    quote: 'COTAÇÃO',
    client: 'DADOS DO CLIENTE',
    seller: 'VENDEDOR',
    commercialConditions: 'CONDIÇÕES COMERCIAIS',
    items: 'ITENS DO ORÇAMENTO',
    logistics: 'INFORMAÇÕES LOGÍSTICAS',
    totals: 'RESUMO FINANCEIRO',
    notes: 'OBSERVAÇÕES IMPORTANTES',
    product: 'PRODUTO',
    image: 'IMAGEM',
    origin: 'ORIGEM',
    qty: 'QTD',
    unitPrice: 'PREÇO UNIT.',
    total: 'TOTAL',
    subtotal: 'Subtotal',
    discount: 'Desconto',
    freight: 'Frete',
    grandTotal: 'TOTAL GERAL',
    incoterm: 'Incoterm',
    port: 'Porto Destino',
    weight: 'Peso Bruto',
    volume: 'Volume',
    boxes: 'Caixas',
    transitDays: 'Dias Trânsito',
    payment: 'Pagamento',
    delivery: 'Entrega',
    validity: 'Validade',
    date: 'Data',
    exchangeRate: 'Cotação USD',
    customsNote: 'A empresa não é responsável pelo desembaraço aduaneiro.',
    mercosurNote: 'Produtos nacionais podem ter benefícios fiscais no Mercosul.',
    quoteNote: 'Este é um orçamento. Preços válidos até a data especificada.'
  }
}

export default function ProfessionalPrintLayout({ 
  orcamento, 
  language = 'pt' 
}: ProfessionalPrintLayoutProps) {
  
  // DEBUG: Para investigar problemas nos cálculos
  if (process.env.NODE_ENV === 'development') {
    debugCalculations(orcamento, 'ProfessionalPrintLayout')
  }
  const [exchangeRate, setExchangeRate] = useState(5.42)
  const t = translations[language as keyof typeof translations] || translations.en

  useEffect(() => {
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
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Dados de exportação seguros
  const exportData = createSafeExportData(orcamento)

  const totalCIF = (orcamento.total / exchangeRate) + 
                   (exportData.freteInternacional + exportData.seguroInternacional + exportData.taxasDesaduanagem)

  return (
    <div className="professional-print-layout">
      <div className="print-page">
        
        {/* CABEÇALHO */}
        <header className="page-header">
          <div className="company-info">
            {orcamento.empresa.logo && (
              <div className="company-logo">
                <img src={orcamento.empresa.logo} alt={orcamento.empresa.nome} />
              </div>
            )}
            <div className="company-details">
              <h1 className="company-name">{orcamento.empresa.nome}</h1>
              <div className="company-address">
                <p>{orcamento.empresa.endereco}, {orcamento.empresa.numero}</p>
                <p>{orcamento.empresa.cidade}, {orcamento.empresa.estado} - {orcamento.empresa.cep}</p>
                <p>Tel: {orcamento.empresa.telefone} | Email: {orcamento.empresa.email}</p>
                <p>CNPJ: {orcamento.empresa.cnpj}</p>
              </div>
            </div>
          </div>
          <div className="document-info">
            <h2 className="document-title">{t.title}</h2>
            <div className="document-details">
              <p><strong>Nº:</strong> {orcamento.numero}</p>
              <p><strong>{t.date}:</strong> {formatDate(orcamento.createdAt)}</p>
              {orcamento.validadeAte && (
                <p><strong>{(t as any).validity || 'Validity'}:</strong> {formatDate(orcamento.validadeAte)}</p>
              )}
            </div>
          </div>
        </header>

        {/* INFORMAÇÕES PRINCIPAIS - LAYOUT COMPACTO */}
        <section className="main-info-compact">
          <div className="info-table">
            <div className="info-row">
              <div className="info-cell">
                <strong>BILL TO:</strong>
                <div className="client-details">
                  {orcamento.cliente.empresa || orcamento.cliente.user.nome}<br/>
                  {orcamento.cliente.cnpj && `CNPJ: ${orcamento.cliente.cnpj}`}
                  {orcamento.cliente.cpf && `CPF: ${orcamento.cliente.cpf}`}<br/>
                  {orcamento.cliente.endereco && `${orcamento.cliente.endereco}`}<br/>
                  {orcamento.cliente.cidade}, {orcamento.cliente.estado}
                </div>
              </div>
              <div className="info-cell">
                <strong>CONTACT:</strong>
                <div className="contact-details">
                  {orcamento.cliente.user.nome}<br/>
                  {orcamento.cliente.user.email}
                  {orcamento.cliente.user.telefone && <><br/>{orcamento.cliente.user.telefone}</>}
                </div>
              </div>
              <div className="info-cell">
                <strong>SALES REP:</strong>
                <div className="seller-details">
                  {orcamento.vendedor.user.nome}<br/>
                  {orcamento.vendedor.user.email}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONDIÇÕES COMERCIAIS */}
        <section className="commercial-conditions">
          <h3 className="section-title">{t.commercialConditions}</h3>
          <div className="conditions-grid">
            <div className="condition-item">
              <strong>{t.incoterm}:</strong>
              <span>{exportData.incoterm}</span>
            </div>
            <div className="condition-item">
              <strong>{t.port}:</strong>
              <span>{exportData.portoDestino}</span>
            </div>
            <div className="condition-item">
              <strong>{t.payment}:</strong>
              <span>{orcamento.condicoesPagamento || 'À vista'}</span>
            </div>
            <div className="condition-item">
              <strong>{t.delivery}:</strong>
              <span>{orcamento.prazoEntrega || 'A combinar'}</span>
            </div>
          </div>
        </section>

        {/* TABELA DE ITENS */}
        <section className="items-section">
          <h3 className="section-title">{t.items || (language === 'en' ? 'QUOTATION ITEMS' : 'ITENS DO ORÇAMENTO')}</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th className="col-product">{t.product}</th>
                <th className="col-image">{t.image || (language === 'en' ? 'IMAGE' : 'IMAGEM')}</th>
                <th className="col-origin">{t.origin}</th>
                <th className="col-qty">{t.qty}</th>
                <th className="col-price">{t.unitPrice}</th>
                <th className="col-discount">DESC. (%)</th>
                <th className="col-total">{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {orcamento.itens.map((item, index) => {
                const descontoReal = detectarDescontoReal(item)
                return (
                  <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="product-cell">
                      <div className="product-info">
                        <strong>{item.produto.nome}</strong>
                        <br />
                        <small>Cód: {item.produto.codigo}</small>
                      </div>
                    </td>
                    <td className="image-cell">
                      {item.produto.imagens && item.produto.imagens.length > 0 ? (
                        <img 
                          src={item.produto.imagens[0]} 
                          alt={item.produto.nome}
                          className="product-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="no-image">📦</div>';
                          }}
                        />
                      ) : (
                        <div className="no-image">📦</div>
                      )}
                    </td>
                    <td className="origin-cell">
                      {item.produto.origem || 'BR'}
                    </td>
                    <td className="qty-cell">
                      {item.quantidade}
                    </td>
                    <td className="price-cell">
                      <div className="price-display">
                        <div>{formatCurrency(item.precoUnit, 'BRL')}</div>
                        <small>({formatCurrency(item.precoUnit, 'USD')})</small>
                      </div>
                    </td>
                    <td className="discount-cell">
                      {descontoReal > 0 ? (
                        <strong>{descontoReal.toFixed(1)}%</strong>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="total-cell">
                      <div className="price-display">
                        <div><strong>{formatCurrency(item.total, 'BRL')}</strong></div>
                        <small>({formatCurrency(item.total, 'USD')})</small>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* INFORMAÇÕES LOGÍSTICAS */}
        {(exportData.pesoBruto > 0 || exportData.volume > 0) && (
          <section className="logistics-section">
            <h3 className="section-title">{t.logistics}</h3>
            {/* LAYOUT COMPACTO - 2 COLUNAS */}
            <div className="logistics-compact">
              <div className="logistics-row">
                <div className="logistics-col">
                  <strong>Weight:</strong> {safeToFixed(exportData.pesoBruto)} kg
                </div>
                <div className="logistics-col">
                  <strong>Volume:</strong> {safeToFixed(exportData.volume)} m³
                </div>
              </div>
              <div className="logistics-row">
                <div className="logistics-col">
                  <strong>Boxes:</strong> {exportData.numeroCaixas || 1}
                </div>
                <div className="logistics-col">
                  <strong>Transit:</strong> {exportData.diasTransito || 0} days
                </div>
              </div>
              {(exportData.incoterm || exportData.portoDestino) && (
                <div className="logistics-row">
                  {exportData.incoterm && (
                    <div className="logistics-col">
                      <strong>Incoterm:</strong> {exportData.incoterm}
                    </div>
                  )}
                  {exportData.portoDestino && (
                    <div className="logistics-col">
                      <strong>Port:</strong> {exportData.portoDestino}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* FRETE INTERNACIONAL - SEÇÃO SEPARADA */}
            {(exportData.freteInternacional > 0 || exportData.seguroInternacional > 0 || exportData.taxasDesaduanagem > 0) && (
              <div className="freight-section">
                <h4 className="freight-title">{t.freight}</h4>
                {/* FRETE COMPACTO - TABELA LIMPA */}
                <div className="freight-compact">
                  <div className="freight-table">
                    {exportData.freteInternacional > 0 && (
                      <div className="freight-row">
                        <span>Freight</span>
                        <span>${exportData.freteInternacional.toFixed(2)}</span>
                      </div>
                    )}
                    {exportData.seguroInternacional > 0 && (
                      <div className="freight-row">
                        <span>Insurance</span>
                        <span>${exportData.seguroInternacional.toFixed(2)}</span>
                      </div>
                    )}
                    {exportData.taxasDesaduanagem > 0 && (
                      <div className="freight-row">
                        <span>Customs</span>
                        <span>${exportData.taxasDesaduanagem.toFixed(2)}</span>
                      </div>
                    )}
                    {exportData.totalFreteInternacional > 0 && (
                      <div className="freight-row freight-total">
                        <strong>Total Freight</strong>
                        <strong>${exportData.totalFreteInternacional.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TOTAIS */}
        <section className="totals-section">
          <h3 className="section-title">{t.totals}</h3>
          
          <div className="totals-layout">
            <div className="exchange-info">
              <div className="exchange-rate">
                <strong>{t.exchangeRate}:</strong>
                <span>USD 1 = BRL {exchangeRate.toFixed(4)}</span>
              </div>
            </div>
            
            <div className="totals-table">
              <div className="total-row">
                <span>{t.subtotal}:</span>
                <div className="price-display">
                  <span>{formatCurrency(orcamento.subtotal, 'BRL')}</span>
                  <small>({formatCurrency(orcamento.subtotal, 'USD')})</small>
                </div>
              </div>
              
              {orcamento.desconto > 0 && (
                <div className="total-row">
                  <span>{t.discount}:</span>
                  <div className="price-display discount">
                    <span>-{formatCurrency(orcamento.desconto, 'BRL')}</span>
                    <small>(-{formatCurrency(orcamento.desconto, 'USD')})</small>
                  </div>
                </div>
              )}
              
              {orcamento.frete > 0 && (
                <div className="total-row">
                  <span>{t.freight}:</span>
                  <div className="price-display">
                    <span>{formatCurrency(orcamento.frete, 'BRL')}</span>
                    <small>({formatCurrency(orcamento.frete, 'USD')})</small>
                  </div>
                </div>
              )}
              
              <div className="total-row grand-total">
                <span>{t.grandTotal}:</span>
                <div className="price-display">
                  {language === 'en' ? (
                    <>
                      <span><strong>{formatCurrency(orcamento.total, 'USD')}</strong></span>
                      <small>(<strong>{formatCurrency(orcamento.total, 'BRL')}</strong>)</small>
                    </>
                  ) : (
                    <>
                      <span><strong>{formatCurrency(orcamento.total, 'BRL')}</strong></span>
                      <small>(<strong>{formatCurrency(orcamento.total, 'USD')}</strong>)</small>
                    </>
                  )}
                </div>
              </div>
              
              {totalCIF > (orcamento.total / exchangeRate) && (
                <div className="total-row cif-total">
                  <span>TOTAL CIF (c/ frete internacional):</span>
                  <div className="price-display">
                    <span><strong>{formatCurrency(totalCIF * exchangeRate, 'USD')}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* OBSERVAÇÕES */}
        <section className="notes-section">
          <h3 className="section-title">{t.notes}</h3>
          <div className="notes-content">
            {orcamento.observacoes && (
              <p><strong>Observações específicas:</strong> {orcamento.observacoes}</p>
            )}
            <p><strong>Importante:</strong> {t.customsNote}</p>
            <p><strong>Mercosul:</strong> {t.mercosurNote}</p>
            <p><strong>Validade:</strong> {t.quoteNote}</p>
          </div>
        </section>

        {/* RODAPÉ */}
        <footer className="page-footer">
          <div className="footer-content">
            <p>{orcamento.empresa.nome} - {orcamento.empresa.endereco}, {orcamento.empresa.cidade}/{orcamento.empresa.estado}</p>
            <p>Documento gerado em {formatDate(new Date().toISOString())} • {orcamento.numero}</p>
          </div>
        </footer>

      </div>
    </div>
  )
}
