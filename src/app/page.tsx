import { redirect } from 'next/navigation'
import { getCurrentUser, isUserApproved } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    // Verificar status de aprovação
    if (user.status === 'PENDENTE') {
      redirect('/aguardando-aprovacao')
    } else if (user.status === 'REJEITADO') {
      redirect('/acesso-negado')
    } else if (user.status === 'SUSPENSO') {
      redirect('/conta-suspensa')
    } else if (isUserApproved(user)) {
      // Redirecionar baseado no role do usuário (só se aprovado)
      if (user.role === UserRole.ADMIN) {
        redirect('/admin/dashboard')
      } else if (user.role === UserRole.VENDEDOR) {
        redirect('/vendedor/dashboard')
      } else {
        redirect('/cliente/produtos')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Exportação
          </h1>
          <p className="text-gray-600 mb-8">
            Sistema completo de vendas e gestão de clientes
          </p>
          
          <SignedOut>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Faça login para acessar o sistema
              </p>
              <SignInButton mode="modal">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Entrar
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Redirecionando...</p>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  )
}
