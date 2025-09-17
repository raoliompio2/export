import { prisma } from '@/lib/prisma'

/**
 * Gera número de orçamento no formato OPDEXPORT20250917001
 * OPDEXPORT + DATA (YYYYMMDD) + NÚMERO SEQUENCIAL DO DIA (001, 002, etc)
 */
export async function gerarNumeroOrcamento(): Promise<string> {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  const dataFormatada = `${ano}${mes}${dia}`

  // Buscar orçamentos criados hoje para determinar o próximo número
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)

  const orcamentosHoje = await prisma.orcamento.count({
    where: {
      createdAt: {
        gte: inicioHoje,
        lt: fimHoje
      },
      numero: {
        startsWith: `OPDEXPORT${dataFormatada}`
      }
    }
  })

  // Próximo número sequencial (001, 002, 003...)
  const proximoNumero = String(orcamentosHoje + 1).padStart(3, '0')

  return `OPDEXPORT${dataFormatada}${proximoNumero}`
}

/**
 * Função auxiliar para extrair data de um número de orçamento
 */
export function extrairDataDoNumero(numero: string): Date | null {
  const match = numero.match(/OPDEXPORT(\d{4})(\d{2})(\d{2})(\d{3})/)
  if (!match) return null
  
  const [, ano, mes, dia] = match
  return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
}

/**
 * Função auxiliar para validar formato do número
 */
export function validarFormatoNumero(numero: string): boolean {
  return /^OPDEXPORT\d{8}\d{3}$/.test(numero)
}
