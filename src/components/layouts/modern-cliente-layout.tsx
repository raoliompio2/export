'use client'

import { useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { 
  Package, 
  FileText, 
  User,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  ShoppingCart,
  Star,
  Clock,
  CheckCircle,
  Globe
} from 'lucide-react'
import LanguageSelector from '@/components/ui/language-selector'
import ExchangeRateDisplay from '@/components/ui/exchange-rate-display'
import CartBadge from '@/components/ui/cart-badge'
import { useCarrinho } from '@/hooks/useCarrinho'

interface ModernClienteLayoutProps {
  children: ReactNode
}

// Navegação será traduzida dinamicamente no componente

export default function ModernClienteLayout({ children }: ModernClienteLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navigation')
  
  const navigation = [
    { 
      name: t('produtos'), 
      href: '/cliente/produtos', 
      icon: Package,
      description: 'Catálogo disponível'
    },
    { 
      name: 'Carrinho', 
      href: '/cliente/carrinho', 
      icon: ShoppingCart,
      description: 'Produtos selecionados'
    },
    { 
      name: t('orcamentos'), 
      href: '/cliente/orcamentos', 
      icon: FileText,
      description: 'Minhas cotações'
    },
    { 
      name: t('perfil'), 
      href: '/cliente/perfil', 
      icon: User,
      description: 'Dados pessoais'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Backdrop para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Flutuante */}
      <aside className={`fixed top-4 left-4 bottom-4 z-50 w-72 bg-[#0F1729]/95 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl transform transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Header da Sidebar */}
        <div className="flex items-center justify-center px-4 py-1 border-b border-gray-700/50 relative">
          <img 
            src="https://res.cloudinary.com/dq0bovaz5/image/upload/v1756767669/OPD_1_uu58f5.png" 
            alt="OPD Logo" 
            className="h-20 w-auto max-w-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <ShoppingCart className="h-20 w-20 text-purple-400 hidden" />
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-2 top-2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 text-white backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-200">Status Ativo</span>
              </div>
              <CheckCircle className="h-4 w-4 opacity-80 text-purple-400" />
            </div>
            <div className="text-lg font-bold mb-1 text-white">Cliente</div>
            <div className="text-gray-300 text-sm flex items-center gap-2">
              <Clock className="h-3 w-3 text-purple-400" />
              Últimos pedidos entregues
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-4 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-sm'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {item.name}
                    {item.href === '/cliente/carrinho' && (
                      <CartBadge showIcon={false} />
                    )}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-purple-100' : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {item.description}
                  </div>
                </div>
                
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-white/70" />
                )}
              </Link>
            )
          })}
        </nav>


        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10 rounded-lg"
                  }
                }}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">Cliente</div>
                <div className="text-xs text-gray-500">Membro Ativo</div>
              </div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-500">Cliente</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <span className="text-gray-900 font-medium">
                  {navigation.find(item => item.href === pathname)?.name || 'Página'}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Exchange Rate */}
              <ExchangeRateDisplay size="sm" className="hidden lg:flex" />
              
              {/* Language Selector */}
              <LanguageSelector variant="dropdown" className="hidden md:block" />
              
              {/* Status Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg text-purple-700">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Ativo</span>
              </div>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="text-sm">Buscar produtos...</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
