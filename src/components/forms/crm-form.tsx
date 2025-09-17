'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Briefcase, User, Calendar, AlertCircle } from 'lucide-react'

const crmSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  status: z.enum(['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO']).default('ABERTO'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  dataVencimento: z.string().optional(),
})

interface CrmFormProps {
  item?: any // Para edição, null para criação
  onClose: () => void
  onSuccess: () => void
}

const statusOptions = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'AGUARDANDO_CLIENTE', label: 'Aguardando Cliente' },
  { value: 'RESOLVIDO', label: 'Resolvido' },
  { value: 'FECHADO', label: 'Fechado' }
]

const prioridadeOptions = [
  { value: 'BAIXA', label: 'Baixa', color: 'text-green-600' },
  { value: 'MEDIA', label: 'Média', color: 'text-yellow-600' },
  { value: 'ALTA', label: 'Alta', color: 'text-orange-600' },
  { value: 'URGENTE', label: 'Urgente', color: 'text-red-600' }
]

export default function CrmForm({ item, onClose, onSuccess }: CrmFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [loadingClientes, setLoadingClientes] = useState(true)

  const form = useForm<z.infer<typeof crmSchema>>({
    resolver: zodResolver(crmSchema),
    defaultValues: {
      titulo: item?.titulo || '',
      descricao: item?.descricao || '',
      clienteId: item?.clienteId || '',
      status: item?.status || 'ABERTO',
      prioridade: item?.prioridade || 'MEDIA',
      dataVencimento: item?.dataVencimento ? new Date(item.dataVencimento).toISOString().split('T')[0] : '',
    },
  })

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch('/api/clientes')
        const data = await response.json()
        setClientes(data)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      } finally {
        setLoadingClientes(false)
      }
    }

    fetchClientes()
  }, [])

  const onSubmit = async (values: z.infer<typeof crmSchema>) => {
    setIsSubmitting(true)
    try {
      const url = item ? `/api/crm/${item.id}` : '/api/crm'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar item CRM')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao salvar item CRM:', error)
      alert(error.message || 'Erro ao salvar item CRM')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingClientes) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {item ? 'Editar Tarefa CRM' : 'Nova Tarefa CRM'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Dados Básicos */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informações da Tarefa
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  {...form.register('titulo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Título da tarefa CRM"
                />
                {form.formState.errors.titulo && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.titulo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  {...form.register('clienteId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.user.nome} {cliente.empresa && `- ${cliente.empresa}`}
                    </option>
                  ))}
                </select>
                {form.formState.errors.clienteId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.clienteId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  {...form.register('descricao')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva os detalhes da tarefa..."
                />
              </div>
            </div>
          </div>

          {/* Status e Prioridade */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Status e Prioridade
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...form.register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  {...form.register('prioridade')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {prioridadeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prazo
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                {...form.register('dataVencimento')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Deixe em branco se não houver prazo específico
              </p>
            </div>
          </div>

          {/* Preview das configurações */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium">
                  {statusOptions.find(s => s.value === form.watch('status'))?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Prioridade:</span>
                <span className={`text-sm font-medium ${prioridadeOptions.find(p => p.value === form.watch('prioridade'))?.color || 'text-gray-900'}`}>
                  {prioridadeOptions.find(p => p.value === form.watch('prioridade'))?.label}
                </span>
              </div>
              {form.watch('dataVencimento') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Vencimento:</span>
                  <span className="text-sm font-medium">
                    {new Date(form.watch('dataVencimento')).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
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
              {item ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
