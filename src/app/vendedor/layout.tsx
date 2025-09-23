import { redirect } from 'next/navigation'
import { requireVendedor, getCurrentUser } from '@/lib/auth'
import VendedorLayout from '@/components/layouts/vendedor-layout'

export default async function VendedorLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar se o usuário é VENDEDOR ou ADMIN
  const vendedorUser = await requireVendedor()
  
  if (!vendedorUser) {
    // Se não é vendedor/admin, verificar se está logado para redirecionar adequadamente
    const user = await getCurrentUser()
    
    if (!user) {
      // Não está logado, redirecionar para login
      redirect('/')
    } else if (user.role === 'ADMIN') {
      // É admin, pode acessar área de vendedor também, mas redirecionar para admin
      redirect('/admin/dashboard')
    } else if (user.role === 'CLIENTE') {
      // É cliente, redirecionar para área do cliente
      redirect('/cliente/produtos')
    } else {
      // Usuário sem role válido ou pendente de aprovação
      redirect('/aguardando-aprovacao')
    }
  }

  return (
    <VendedorLayout>
      {children}
    </VendedorLayout>
  )
}
