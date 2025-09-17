import { redirect } from 'next/navigation'
import { getCurrentUser, isUserApproved } from '@/lib/auth'
import { SignInButton } from '@clerk/nextjs'

export default async function Home() {
  const user = await getCurrentUser()

  // Se usuário está logado, redirecionar baseado no status
  if (user) {
    if (!user.aprovadoEm) {
      redirect('/aguardando-aprovacao')
    } else if (user.motivoRejeicao) {
      redirect('/acesso-negado')
    } else if (isUserApproved(user)) {
      // Redirecionar baseado no role do usuário (só se aprovado)
      if (user.role === 'ADMIN') {
        redirect('/admin/dashboard')
      } else if (user.role === 'VENDEDOR') {
        redirect('/vendedor/dashboard')
      } else {
        redirect('/cliente/produtos')
      }
    }
    
    // Se chegou até aqui, usuário está logado mas aguardando algo - mostrar loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
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
          
          {/* Só mostra componentes de login se não há usuário logado */}
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
        </div>
      </div>
    </div>
  )
}
