import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClienteLayout from '@/components/layouts/cliente-layout'

export default async function ClienteLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    // Não está logado, redirecionar para login
    redirect('/')
  }

  // Verificar se é cliente ou se tem acesso (admin pode ver como cliente)
  if (user.role !== 'CLIENTE' && user.role !== 'ADMIN') {
    // Se não é cliente nem admin, redirecionar baseado no role
    if (user.role === 'VENDEDOR') {
      redirect('/vendedor/dashboard')
    } else {
      // Usuário sem role válido ou pendente de aprovação
      redirect('/aguardando-aprovacao')
    }
  }

  return (
    <ClienteLayout>
      {children}
    </ClienteLayout>
  )
}
