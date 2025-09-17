import { requireAdmin } from '@/lib/auth'
import AdminLayout from '@/components/layouts/admin-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Verificar se o usuário é ADMIN antes de renderizar
  await requireAdmin()
  
  return <AdminLayout>{children}</AdminLayout>
}
