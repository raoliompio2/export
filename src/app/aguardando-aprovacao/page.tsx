import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Clock, Mail, CheckCircle } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'

export default async function AguardandoAprovacao() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  // Se não está mais pendente, redirecionar
  if (user.status !== 'PENDENTE') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          
          {/* Ícone */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Aguardando Aprovação
          </h1>

          {/* Mensagem */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              Olá <strong>{user.nome}</strong>! Sua conta foi criada com sucesso.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Conta registrada</p>
                  <p>Agora você precisa aguardar a aprovação de um administrador para acessar o sistema.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Próximos passos</p>
                  <p>Você receberá um email quando sua conta for aprovada. Enquanto isso, pode fazer logout e aguardar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da conta */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Dados registrados:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nome:</strong> {user.nome}</p>
              <p><strong>Data:</strong> {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Botão de logout */}
          <SignOutButton>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Fazer Logout
            </button>
          </SignOutButton>

          {/* Nota */}
          <p className="text-xs text-gray-500 mt-4">
            Em caso de dúvidas, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
