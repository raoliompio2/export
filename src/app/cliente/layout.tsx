import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import ClienteLayout from '@/components/layouts/cliente-layout'

export default async function ClienteLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (user.role !== UserRole.CLIENTE) {
    redirect('/vendedor/dashboard')
  }

  return (
    <ClienteLayout>
      {children}
    </ClienteLayout>
  )
}
