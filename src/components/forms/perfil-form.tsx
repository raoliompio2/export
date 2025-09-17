'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Upload, Loader2, Save, X } from 'lucide-react'
import Image from 'next/image'

// Schemas de validação
const userDataSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
})

const clienteDataSchema = z.object({
  empresa: z.string().optional(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
})

const vendedorDataSchema = z.object({
  comissao: z.number().min(0).max(100),
  meta: z.number().min(0),
})

type UserData = z.infer<typeof userDataSchema>
type ClienteData = z.infer<typeof clienteDataSchema>
type VendedorData = z.infer<typeof vendedorDataSchema>

interface ClienteProfile {
  id: string
  empresa?: string
  cnpj?: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo: boolean
}

interface VendedorProfile {
  id: string
  comissao: number | string
  meta: number | string
  ativo: boolean
}

interface PerfilFormProps {
  initialData: {
    user: {
      id: string
      nome: string
      email: string
      telefone?: string
      avatar?: string
      role: string
    }
    clienteProfile?: ClienteProfile
    vendedorProfile?: VendedorProfile
  }
  onClose: () => void
  onSuccess: () => void
}

export default function PerfilForm({ initialData, onClose, onSuccess }: PerfilFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(initialData.user.avatar)

  // Formulário de dados pessoais
  const userForm = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      nome: initialData.user.nome,
      email: initialData.user.email,
      telefone: initialData.user.telefone || '',
    },
  })

  // Formulário de dados do cliente
  const clienteForm = useForm<ClienteData>({
    resolver: zodResolver(clienteDataSchema),
    defaultValues: {
      empresa: initialData.clienteProfile?.empresa || '',
      cnpj: initialData.clienteProfile?.cnpj || '',
      cpf: initialData.clienteProfile?.cpf || '',
      endereco: initialData.clienteProfile?.endereco || '',
      cidade: initialData.clienteProfile?.cidade || '',
      estado: initialData.clienteProfile?.estado || '',
      cep: initialData.clienteProfile?.cep || '',
      observacoes: initialData.clienteProfile?.observacoes || '',
    },
  })

  // Formulário de dados do vendedor
  const vendedorForm = useForm<VendedorData>({
    resolver: zodResolver(vendedorDataSchema),
    defaultValues: {
      comissao: Number(initialData.vendedorProfile?.comissao || 0),
      meta: Number(initialData.vendedorProfile?.meta || 0),
    },
  })

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do avatar')
      }

      const data = await response.json()
      setCurrentAvatar(data.avatarUrl)
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload do avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const userData = userForm.getValues()
      const clienteData = initialData.clienteProfile ? clienteForm.getValues() : null
      const vendedorData = initialData.vendedorProfile ? vendedorForm.getValues() : null

      const response = await fetch('/api/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: {
            ...userData,
            avatar: currentAvatar,
          },
          clienteData,
          vendedorData,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Editar Perfil
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Upload de Avatar */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {currentAvatar ? (
                    <Image
                      src={currentAvatar}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover"
                      onError={() => setCurrentAvatar('')}
                      priority
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto de Perfil
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Dados Pessoais</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      {...userForm.register('nome')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {userForm.formState.errors.nome && (
                      <p className="text-red-500 text-sm mt-1">{userForm.formState.errors.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...userForm.register('email')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {userForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{userForm.formState.errors.email.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Email usado para login e representação pública</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      {...userForm.register('telefone')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Dados do Cliente */}
                {initialData.clienteProfile && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Dados do Cliente</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa
                      </label>
                      <input
                        type="text"
                        {...clienteForm.register('empresa')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          {...clienteForm.register('cnpj')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CPF
                        </label>
                        <input
                          type="text"
                          {...clienteForm.register('cpf')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        {...clienteForm.register('endereco')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          {...clienteForm.register('cidade')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          {...clienteForm.register('estado')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP
                        </label>
                        <input
                          type="text"
                          {...clienteForm.register('cep')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        {...clienteForm.register('observacoes')}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Dados do Vendedor */}
                {initialData.vendedorProfile && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Dados do Vendedor</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comissão (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...vendedorForm.register('comissao', { valueAsNumber: true })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {vendedorForm.formState.errors.comissao && (
                        <p className="text-red-500 text-sm mt-1">{vendedorForm.formState.errors.comissao.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Mensal (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...vendedorForm.register('meta', { valueAsNumber: true })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {vendedorForm.formState.errors.meta && (
                        <p className="text-red-500 text-sm mt-1">{vendedorForm.formState.errors.meta.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
