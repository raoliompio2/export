import { redirect } from 'next/navigation'
import { getCurrentUser, isUserApproved } from '@/lib/auth'
import { currentUser } from '@clerk/nextjs/server'
import { ConditionalSignIn } from '@/components/ui/conditional-signin'

export default async function Home() {
  try {
    // Primeiro verificar se há usuário do Clerk
    const clerkUser = await currentUser()
    
    if (clerkUser) {
      console.log('🔍 Usuário Clerk encontrado:', clerkUser.id)
      
      // Tentar obter usuário do banco
      const user = await getCurrentUser()
      
      if (user) {
        console.log('🔍 Usuário do banco encontrado:', { id: user.id, role: user.role, aprovadoEm: user.aprovadoEm })
        
        // Verificar status de aprovação
        if (!user.aprovadoEm) {
          console.log('→ Redirecionando para aguardando aprovação')
          redirect('/aguardando-aprovacao')
        } else if (user.motivoRejeicao) {
          console.log('→ Redirecionando para acesso negado')
          redirect('/acesso-negado')
        } else if (isUserApproved(user)) {
          // Redirecionar baseado no role do usuário (só se aprovado)
          if (user.role === 'ADMIN') {
            console.log('→ Redirecionando para admin dashboard')
            redirect('/admin/dashboard')
          } else if (user.role === 'VENDEDOR') {
            console.log('→ Redirecionando para vendedor dashboard')
            redirect('/vendedor/dashboard')
          } else {
            console.log('→ Redirecionando para cliente produtos')
            redirect('/cliente/produtos')
          }
        }
      } else {
        console.log('⚠️ Usuário Clerk existe mas não encontrado no banco')
        // Se há usuário Clerk mas não no banco, mostrar loading e tentar criar
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Configurando sua conta...</p>
              <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
            </div>
          </div>
        )
      }
    } else {
      console.log('❌ Nenhum usuário Clerk encontrado')
    }
  } catch (error) {
    // Se o erro for NEXT_REDIRECT, não é um erro real - é comportamento esperado
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // Re-throw para que o Next.js trate o redirecionamento
      throw error
    }
    console.error('❌ Erro ao verificar autenticação:', error)
    // Em caso de erro, continuar para página de login
  }

  // Se chegou até aqui, mostrar página de login
  console.log('📝 Mostrando página de login')
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
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Faça login para acessar o sistema
            </p>
            
            {/* Botão principal de login - só renderiza se não há usuário logado */}
            <ConditionalSignIn>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Entrar
              </button>
            </ConditionalSignIn>
            
            {/* Botão alternativo para usuários já logados */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-2">Já está logado?</p>
              <a 
                href="/admin/dashboard" 
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
              >
                Acessar Painel Admin
              </a>
              <div className="flex gap-2 mt-2">
                <a 
                  href="/vendedor/dashboard" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-center text-sm"
                >
                  Vendedor
                </a>
                <a 
                  href="/cliente/produtos" 
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-center text-sm"
                >
                  Cliente
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}