'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, ArrowRight } from 'lucide-react'

export default function ProfileSwitcher() {
  const pathname = usePathname()
  const isOnAdmin = pathname.startsWith('/admin')
  
  // Componente simples para mostrar apenas quando necessário
  if (!isOnAdmin) {
    return (
      <Link
        href="/vendedor/dashboard"
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white text-sm"
      >
        <User className="h-4 w-4" />
        <span className="hidden md:block">Ir para Vendedor</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <Link
      href="/vendedor/dashboard"
      className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white text-sm"
    >
      <User className="h-4 w-4" />
      <span className="hidden md:block">Painel Vendedor</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}
