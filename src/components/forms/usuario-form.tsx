'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, User, Mail, Phone, Shield } from 'lucide-react'

const usuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  role: z.enum(['ADMIN', 'VENDEDOR', 'CLIENTE']),
  ativo: z.boolean().default(true)
})

interface UsuarioFormProps {
  usuario?: any // Para edição, null para criação
  onClose: () => void
  onSuccess: () => void
}

export default function UsuarioForm({ usuario, onClose, onSuccess }: UsuarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof usuarioSchema>>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      telefone: usuario?.telefone || '',
      role: usuario?.role || 'CLIENTE',
      ativo: usuario?.ativo ?? true,
    },
  })

  const onSubmit = async (values: z.infer<typeof usuarioSchema>) => {
    setIsSubmitting(true)
    try {
      const url = usuario ? `/api/usuarios/${usuario.id}` : '/api/usuarios'
      const method = usuario ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar usuário')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      alert(error.message || 'Erro ao salvar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            {usuario ? 'Editar Usuário' : 'Novo Usuário'}
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
              <User className="h-4 w-4" />
              Dados Básicos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  {...form.register('nome')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nome completo do usuário"
                />
                {form.formState.errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...form.register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  {...form.register('telefone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário *
                </label>
                <select
                  {...form.register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CLIENTE">Cliente</option>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {form.formState.errors.role && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Status
            </h4>
            <div className="flex items-center gap-2">
              <input
                {...form.register('ativo')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                Usuário ativo no sistema
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {usuario ? 'Atualizar' : 'Criar'} Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
