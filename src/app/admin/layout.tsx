import { redirect } from 'next/navigation'
import { requireAdmin, getCurrentUser } from '@/lib/auth'
import AdminLayout from '@/components/layouts/admin-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Verificar se o usuário é ADMIN antes de renderizar
  const adminUser = await requireAdmin()
  
  if (!adminUser) {
    // Se não é admin, verificar se está logado para redirecionar adequadamente
    const user = await getCurrentUser()
    
    if (!user) {
      // Não está logado, redirecionar para login
      redirect('/')
    } else if (user.role === 'VENDEDOR') {
      // É vendedor, redirecionar para área do vendedor
      redirect('/vendedor/dashboard')
    } else if (user.role === 'CLIENTE') {
      // É cliente, redirecionar para área do cliente
      redirect('/cliente/produtos')
    } else {
      // Usuário sem role válido ou pendente de aprovação
      redirect('/aguardando-aprovacao')
    }
  }
  
  return <AdminLayout>{children}</AdminLayout>
}
