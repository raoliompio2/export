import { requireVendedor } from '@/lib/auth'
import VendedorLayout from '@/components/layouts/vendedor-layout'

export default async function VendedorLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  await requireVendedor()

  return (
    <VendedorLayout>
      {children}
    </VendedorLayout>
  )
}
