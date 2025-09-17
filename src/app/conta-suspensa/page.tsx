import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AlertTriangle, Mail } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'

export default async function ContaSuspensa() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  // Se não está suspenso, redirecionar
  if (user.aprovadoEm && !user.motivoRejeicao) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          
          {/* Ícone */}
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Conta Suspensa
          </h1>

          {/* Mensagem */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              Olá <strong>{user.nome}</strong>, sua conta foi temporariamente suspensa.
            </p>
            
            {user.motivoRejeicao && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Motivo da suspensão:</p>
                  <p>{user.motivoRejeicao}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Para reativar sua conta</p>
                  <p>Entre em contato com o administrador do sistema para mais informações sobre como resolver esta situação.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da conta */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Informações da conta:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nome:</strong> {user.nome}</p>
              {user.aprovadoEm && (
                <p><strong>Suspensa em:</strong> {new Date(user.aprovadoEm).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          </div>

          {/* Botão de logout */}
          <SignOutButton>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Fazer Logout
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}
