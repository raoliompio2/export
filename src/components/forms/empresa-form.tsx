'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Building2, MapPin, CreditCard } from 'lucide-react'

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(1, 'CNPJ é obrigatório')
    .transform((val) => val.replace(/\D/g, '')) // Remove tudo que não é dígito
    .refine((val) => val.length === 14, 'CNPJ deve ter 14 dígitos')
    .transform((val) => val.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')), // Formata
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  website: z.string().optional(),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(1, 'CEP é obrigatório')
    .transform((val) => val.replace(/\D/g, '')) // Remove tudo que não é dígito
    .refine((val) => val.length === 8, 'CEP deve ter 8 dígitos')
    .transform((val) => val.replace(/^(\d{5})(\d{3})$/, '$1-$2')), // Formata
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  logo: z.string().optional(),
  corPrimaria: z.string().default('#3B82F6'),
  ativa: z.boolean().default(true)
})

interface EmpresaFormProps {
  empresa?: any
  onClose: () => void
  onSuccess: () => void
}

export default function EmpresaForm({ empresa, onClose, onSuccess }: EmpresaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof empresaSchema>>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: empresa?.nome || '',
      nomeFantasia: empresa?.nomeFantasia || '',
      cnpj: empresa?.cnpj || '',
      inscricaoEstadual: empresa?.inscricaoEstadual || '',
      inscricaoMunicipal: empresa?.inscricaoMunicipal || '',
      email: empresa?.email || '',
      telefone: empresa?.telefone || '',
      website: empresa?.website || '',
      endereco: empresa?.endereco || '',
      numero: empresa?.numero || '',
      complemento: empresa?.complemento || '',
      bairro: empresa?.bairro || '',
      cidade: empresa?.cidade || '',
      estado: empresa?.estado || '',
      cep: empresa?.cep || '',
      banco: empresa?.banco || '',
      agencia: empresa?.agencia || '',
      conta: empresa?.conta || '',
      logo: empresa?.logo || '',
      corPrimaria: empresa?.corPrimaria || '#3B82F6',
      ativa: empresa?.ativa ?? true
    },
  })

  const onSubmit = async (values: z.infer<typeof empresaSchema>) => {
    setIsSubmitting(true)
    try {
      const url = empresa ? `/api/empresas/${empresa.id}` : '/api/empresas'
      const method = empresa ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar empresa')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error)
      alert(error.message || 'Erro ao salvar empresa')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Dados da Empresa */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social *
                </label>
                <input
                  type="text"
                  {...form.register('nome')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {form.formState.errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  {...form.register('nomeFantasia')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  {...form.register('cnpj')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="00.000.000/0000-00"
                />
                {form.formState.errors.cnpj && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.cnpj.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inscrição Estadual
                </label>
                <input
                  type="text"
                  {...form.register('inscricaoEstadual')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...form.register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  {...form.register('telefone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  {...form.register('website')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://www.empresa.com.br"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  {...form.register('endereco')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {form.formState.errors.endereco && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.endereco.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  {...form.register('numero')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  {...form.register('complemento')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  {...form.register('bairro')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {form.formState.errors.bairro && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.bairro.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  {...form.register('cidade')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {form.formState.errors.cidade && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.cidade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  {...form.register('estado')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SP"
                  maxLength={2}
                />
                {form.formState.errors.estado && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.estado.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP *
                </label>
                <input
                  type="text"
                  {...form.register('cep')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="00000-000"
                />
                {form.formState.errors.cep && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.cep.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Dados Bancários (Opcional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco
                </label>
                <input
                  type="text"
                  {...form.register('banco')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agência
                </label>
                <input
                  type="text"
                  {...form.register('agencia')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta
                </label>
                <input
                  type="text"
                  {...form.register('conta')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Configurações Visuais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Logo
                </label>
                <input
                  type="url"
                  {...form.register('logo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Primária
                </label>
                <input
                  type="color"
                  {...form.register('corPrimaria')}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...form.register('ativa')}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-900">Empresa ativa</span>
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {empresa ? 'Salvar Alterações' : 'Criar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
