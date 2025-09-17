/**
 * Utilitários para formatação segura de valores
 * Garante que não haverá erros com valores null/undefined
 * 
 * CHANGELOG:
 * - Adicionado formatCurrencySafe para conversão de moeda consistente
 * - Adicionado calcularTotalItem para cálculos corretos dos itens
 * - Adicionado calcularTotaisOrcamento para validar totais
 * - Adicionado debugCalculations para investigar problemas
 */

/**
 * Formata um número com decimais de forma segura
 * @param value - Valor a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada
 */
export const safeToFixed = (value: number | null | undefined, decimals: number = 2): string => {
  const safeValue = Number(value) || 0
  return safeValue.toFixed(decimals)
}

/**
 * Detecta e corrige desconto quando o campo vem null mas o cálculo está aplicado
 * @param item - Item do orçamento
 * @returns Desconto correto (detectado ou informado)
 */
export const detectarDescontoReal = (item: { quantidade?: number; precoUnit?: number; total?: number; desconto?: number }): number => {
  const quantidade = Number(item.quantidade) || 0
  const precoUnit = Number(item.precoUnit) || 0
  const total = Number(item.total) || 0
  const descontoInformado = Number(item.desconto) || 0
  
  if (quantidade === 0 || precoUnit === 0) return 0
  
  // Se tem desconto informado, usar ele
  if (descontoInformado > 0) {
    return descontoInformado
  }
  
  // Se não tem desconto informado, calcular com base no total
  const totalSemDesconto = quantidade * precoUnit
  const descontoAplicado = ((totalSemDesconto - total) / totalSemDesconto) * 100
  
  // Se o desconto calculado é maior que 0.1%, provavelmente foi aplicado
  return descontoAplicado > 0.1 ? descontoAplicado : 0
}

/**
 * Debug para identificar problemas nos cálculos
 * @param orcamento - Objeto do orçamento
 * @param context - Contexto onde está sendo usado
 */
export const debugCalculations = (orcamento: { 
  subtotal?: number; 
  desconto?: number; 
  frete?: number; 
  total?: number; 
  freteInternacional?: number | string; 
  seguroInternacional?: number | string; 
  taxasDesaduanagem?: number | string;
  itens?: Array<{ quantidade?: number; precoUnit?: number; total?: number; desconto?: number; produto?: { nome?: string } }> 
}, context: string = '') => {
  console.log(`=== DEBUG CÁLCULOS ${context} ===`)
  console.log('Subtotal:', orcamento.subtotal)
  console.log('Desconto:', orcamento.desconto)
  console.log('Frete Nacional:', orcamento.frete)
  console.log('Total:', orcamento.total)
  console.log('Frete Internacional:', orcamento.freteInternacional)
  console.log('Seguro Internacional:', orcamento.seguroInternacional)
  console.log('Taxas Desaduanagem:', orcamento.taxasDesaduanagem)
  
  if (orcamento.itens) {
    console.log('=== ITENS ===')
    orcamento.itens?.forEach((item: { quantidade?: number; precoUnit?: number; total?: number; desconto?: number; produto?: { nome?: string } }, index: number) => {
      const descontoReal = detectarDescontoReal(item)
      console.log(`Item ${index + 1}:`, {
        produto: item.produto?.nome,
        quantidade: item.quantidade,
        precoUnit: item.precoUnit,
        descontoInformado: item.desconto,
        descontoDetectado: descontoReal.toFixed(2) + '%',
        total: item.total,
        calculado: calcularTotalItem(item.quantidade, item.precoUnit, descontoReal)
      })
    })
  }
  console.log('=== FIM DEBUG ===')
}

/**
 * Formata um número inteiro de forma segura
 * @param value - Valor a ser formatado
 * @returns Número seguro
 */
export const safeNumber = (value: number | null | undefined): number => {
  return Number(value) || 0
}

/**
 * Formata uma string de forma segura
 * @param value - Valor a ser formatado
 * @param fallback - Valor padrão (padrão: '')
 * @returns String segura
 */
export const safeString = (value: string | null | undefined, fallback: string = ''): string => {
  return value || fallback
}

/**
 * Verifica se um valor numérico é válido e maior que zero
 * @param value - Valor a ser verificado
 * @returns Boolean
 */
export const isValidPositiveNumber = (value: number | null | undefined): boolean => {
  const num = Number(value) || 0
  return num > 0
}

/**
 * Calcula subtotal, descontos e total final de um orçamento
 * @param itens - Array de itens do orçamento
 * @param desconto - Desconto geral
 * @param frete - Frete nacional
 * @returns Objeto com os cálculos
 */
export const calcularTotaisOrcamento = (itens: Array<{ quantidade?: number; precoUnit?: number; desconto?: number }>, desconto: number = 0, frete: number = 0) => {
  const subtotal = itens.reduce((acc, item) => {
    const totalItem = calcularTotalItem(item.quantidade, item.precoUnit, item.desconto)
    return acc + totalItem
  }, 0)
  
  const descontoTotal = Number(desconto) || 0
  const freteTotal = Number(frete) || 0
  const total = subtotal - descontoTotal + freteTotal
  
  return {
    subtotal,
    desconto: descontoTotal,
    frete: freteTotal,
    total
  }
}

/**
 * Formata moeda de forma segura
 * @param value - Valor a ser formatado
 * @param currency - Moeda (BRL ou USD)
 * @param exchangeRate - Taxa de câmbio (USD para BRL)
 * @returns String formatada
 */
export const formatCurrencySafe = (value: number | null | undefined, currency: 'BRL' | 'USD', exchangeRate: number = 5.42): string => {
  const safeValue = Number(value) || 0
  const convertedValue = currency === 'USD' ? safeValue / exchangeRate : safeValue
  
  return new Intl.NumberFormat(
    currency === 'BRL' ? 'pt-BR' : 'en-US',
    {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }
  ).format(convertedValue)
}

/**
 * Calcula o total correto de um item do orçamento
 * @param quantidade - Quantidade do item
 * @param precoUnit - Preço unitário
 * @param desconto - Desconto em percentual
 * @returns Total calculado
 */
export const calcularTotalItem = (quantidade: number, precoUnit: number, desconto: number = 0): number => {
  const qtd = Number(quantidade) || 0
  const preco = Number(precoUnit) || 0
  const desc = Number(desconto) || 0
  
  return qtd * preco * (1 - desc / 100)
}

/**
 * Dados de exportação seguros
 * Aplica todas as validações necessárias para campos de exportação
 */
export const createSafeExportData = (orcamento: { 
  numero?: string; 
  incoterm?: string;
  portoDestino?: string;
  tipoFrete?: string;
  diasTransito?: number;
  pesoBruto?: number;
  volume?: number;
  medidas?: string;
  numeroCaixas?: number;
  freteInternacional?: number;
  seguroInternacional?: number;
  taxasDesaduanagem?: number;
  itens?: Array<{ produto?: { nome?: string } }> 
}) => {
  const data = {
    incoterm: safeString(orcamento.incoterm, 'CIF'),
    portoDestino: safeString(orcamento.portoDestino, 'A definir'),
    tipoFrete: safeString(orcamento.tipoFrete, 'Marítimo + Terrestre'),
    diasTransito: safeNumber(orcamento.diasTransito),
    pesoBruto: safeNumber(orcamento.pesoBruto),
    volume: safeNumber(orcamento.volume),
    medidas: safeString(orcamento.medidas, 'A medir'),
    numeroCaixas: safeNumber(orcamento.numeroCaixas) || 1,
    freteInternacional: safeNumber(orcamento.freteInternacional),
    seguroInternacional: safeNumber(orcamento.seguroInternacional),
    taxasDesaduanagem: safeNumber(orcamento.taxasDesaduanagem),
    get totalFreteInternacional() {
      return this.freteInternacional + this.seguroInternacional + this.taxasDesaduanagem
    }
  }
  
  return data
}
