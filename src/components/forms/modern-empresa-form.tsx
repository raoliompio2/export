'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Building2, 
  MapPin, 
  CreditCard, 
  Palette,
  Check
} from 'lucide-react'
import ModernStepperForm, { FormField, ModernInput, ModernSelect } from '@/components/ui/modern-stepper-form'

const empresaSchema = z.object({
  // Dados básicos
  nome: z.string().min(1, 'Nome é obrigatório'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
  inscricaoEstadual: z.string().optional(),
  
  // Contato
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  website: z.string().optional(),
  
  // Endereço
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  
  // Financeiro
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  
  // Visual
  logo: z.string().url('URL inválida').optional().or(z.literal('')),
  corPrimaria: z.string(),
  ativa: z.boolean()
})

type EmpresaFormData = z.infer<typeof empresaSchema>

interface ModernEmpresaFormProps {
  empresa?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ModernEmpresaForm({ empresa, onClose, onSuccess }: ModernEmpresaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: empresa?.nome || '',
      nomeFantasia: empresa?.nomeFantasia || '',
      cnpj: empresa?.cnpj || '',
      inscricaoEstadual: empresa?.inscricaoEstadual || '',
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
    }
  })

  const { watch, formState: { errors } } = form

  // Validações por etapa
  const validateStep1 = async () => {
    const fields = ['nome', 'cnpj', 'email', 'telefone']
    const values = form.getValues()
    
    for (const field of fields) {
      if (!values[field as keyof EmpresaFormData]) {
        form.setError(field as keyof EmpresaFormData, { 
          message: 'Campo obrigatório' 
        })
        return false
      }
    }
    return true
  }

  const validateStep2 = async () => {
    const fields = ['endereco', 'numero', 'bairro', 'cidade', 'estado', 'cep']
    const values = form.getValues()
    
    for (const field of fields) {
      if (!values[field as keyof EmpresaFormData]) {
        form.setError(field as keyof EmpresaFormData, { 
          message: 'Campo obrigatório' 
        })
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const values = form.getValues()
      console.log('📤 Dados sendo enviados:', JSON.stringify(values, null, 2))
      
      const url = empresa ? `/api/empresas/${empresa.id}` : '/api/empresas'
      const method = empresa ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Erro da API:', JSON.stringify(error, null, 2))
        if (error.details) {
          console.error('❌ Detalhes da validação:', JSON.stringify(error.details, null, 2))
          error.details.forEach((detail, index) => {
            console.error(`❌ Erro ${index + 1}:`, JSON.stringify(detail, null, 2))
          })
        }
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

  const steps = [
    {
      id: 'basic',
      title: 'Dados Básicos',
      description: 'Informações principais da empresa',
      icon: <Building2 className="h-4 w-4" />,
      validation: validateStep1,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Razão Social" required error={errors.nome?.message}>
              <ModernInput
                {...form.register('nome')}
                placeholder="Nome completo da empresa"
                error={!!errors.nome}
              />
            </FormField>

            <FormField label="Nome Fantasia" error={errors.nomeFantasia?.message}>
              <ModernInput
                {...form.register('nomeFantasia')}
                placeholder="Nome comercial"
                error={!!errors.nomeFantasia}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="CNPJ" required error={errors.cnpj?.message}>
              <ModernInput
                {...form.register('cnpj')}
                placeholder="00.000.000/0000-00"
                error={!!errors.cnpj}
              />
            </FormField>

            <FormField label="Inscrição Estadual" error={errors.inscricaoEstadual?.message}>
              <ModernInput
                {...form.register('inscricaoEstadual')}
                placeholder="000.000.000.000"
                error={!!errors.inscricaoEstadual}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Email" required error={errors.email?.message}>
              <ModernInput
                type="email"
                {...form.register('email')}
                placeholder="contato@empresa.com"
                error={!!errors.email}
              />
            </FormField>

            <FormField label="Telefone" required error={errors.telefone?.message}>
              <ModernInput
                {...form.register('telefone')}
                placeholder="(11) 99999-9999"
                error={!!errors.telefone}
              />
            </FormField>
          </div>

          <FormField label="Website" error={errors.website?.message}>
            <ModernInput
              type="url"
              {...form.register('website')}
              placeholder="https://www.empresa.com"
              error={!!errors.website}
            />
          </FormField>
        </div>
      )
    },
    {
      id: 'address',
      title: 'Endereço',
      description: 'Localização da empresa',
      icon: <MapPin className="h-4 w-4" />,
      validation: validateStep2,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FormField label="Endereço" required error={errors.endereco?.message}>
                <ModernInput
                  {...form.register('endereco')}
                  placeholder="Rua, avenida, etc."
                  error={!!errors.endereco}
                />
              </FormField>
            </div>

            <FormField label="Número" required error={errors.numero?.message}>
              <ModernInput
                {...form.register('numero')}
                placeholder="123"
                error={!!errors.numero}
              />
            </FormField>
          </div>

          <FormField label="Complemento" error={errors.complemento?.message}>
            <ModernInput
              {...form.register('complemento')}
              placeholder="Sala, andar, bloco"
              error={!!errors.complemento}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Bairro" required error={errors.bairro?.message}>
              <ModernInput
                {...form.register('bairro')}
                placeholder="Nome do bairro"
                error={!!errors.bairro}
              />
            </FormField>

            <FormField label="Cidade" required error={errors.cidade?.message}>
              <ModernInput
                {...form.register('cidade')}
                placeholder="Nome da cidade"
                error={!!errors.cidade}
              />
            </FormField>

            <FormField label="Estado" required error={errors.estado?.message}>
              <ModernSelect
                {...form.register('estado')}
                error={!!errors.estado}
              >
                <option value="">Selecione</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                {/* Adicionar outros estados */}
              </ModernSelect>
            </FormField>
          </div>

          <FormField label="CEP" required error={errors.cep?.message}>
            <ModernInput
              {...form.register('cep')}
              placeholder="00000-000"
              error={!!errors.cep}
              className="max-w-xs"
            />
          </FormField>
        </div>
      )
    },
    {
      id: 'financial',
      title: 'Dados Bancários',
      description: 'Informações financeiras (opcional)',
      icon: <CreditCard className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Banco" error={errors.banco?.message}>
              <ModernInput
                {...form.register('banco')}
                placeholder="Nome do banco"
                error={!!errors.banco}
              />
            </FormField>

            <FormField label="Agência" error={errors.agencia?.message}>
              <ModernInput
                {...form.register('agencia')}
                placeholder="0000-0"
                error={!!errors.agencia}
              />
            </FormField>

            <FormField label="Conta" error={errors.conta?.message}>
              <ModernInput
                {...form.register('conta')}
                placeholder="00000-0"
                error={!!errors.conta}
              />
            </FormField>
          </div>
        </div>
      )
    },
    {
      id: 'visual',
      title: 'Personalização',
      description: 'Logo e cores da empresa',
      icon: <Palette className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <FormField label="URL da Logo" error={errors.logo?.message}>
            <ModernInput
              type="url"
              {...form.register('logo')}
              placeholder="https://empresa.com/logo.png"
              error={!!errors.logo}
            />
          </FormField>

          <FormField label="Cor Primária">
            <div className="flex items-center gap-4">
              <input
                type="color"
                {...form.register('corPrimaria')}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                Cor principal da marca
              </span>
            </div>
          </FormField>

          <FormField label="Status">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...form.register('ativa')}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Empresa ativa no sistema</span>
            </label>
          </FormField>

          {/* Preview */}
          {(watch('logo') || watch('corPrimaria')) && (
            <div className="mt-8 p-4 border border-gray-200 rounded-xl">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
              <div 
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: watch('corPrimaria') }}
              >
                <div className="flex items-center gap-3">
                  {watch('logo') && (
                    <img 
                      src={watch('logo')} 
                      alt="Logo"
                      className="w-8 h-8 object-contain bg-white rounded"
                    />
                  )}
                  <span className="font-medium">
                    {watch('nome') || 'Nome da Empresa'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <p className="text-gray-600 mt-1">
            Preencha as informações nos passos abaixo
          </p>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <ModernStepperForm
            steps={steps}
            onComplete={handleSubmit}
            onCancel={onClose}
            loading={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
