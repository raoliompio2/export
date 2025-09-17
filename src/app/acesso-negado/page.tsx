import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { XCircle, Mail } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'

export default async function AcessoNegado() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  // Se não está rejeitado, redirecionar
  if (user.status !== 'REJEITADO') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          
          {/* Ícone */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>

          {/* Mensagem */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              Olá <strong>{user.nome}</strong>, infelizmente sua solicitação de acesso foi negada.
            </p>
            
            {user.motivoRejeicao && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Motivo:</p>
                  <p>{user.motivoRejeicao}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Em caso de dúvidas</p>
                  <p>Entre em contato com o administrador do sistema para mais informações ou para contestar esta decisão.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da conta */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Dados da solicitação:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>Data:</strong> {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
              {user.aprovadoEm && (
                <p><strong>Decisão em:</strong> {new Date(user.aprovadoEm).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          </div>

          {/* Botão de logout */}
          <SignOutButton>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Fazer Logout
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}
