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
      <aside className={`fixed top-4 left-4 bottom-4 z-50 w-72 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl transform transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-sm">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Portal Cliente</h1>
              <p className="text-xs text-gray-500">Sua central de compras</p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Status VIP</span>
              </div>
              <CheckCircle className="h-4 w-4 opacity-80" />
            </div>
            <div className="text-lg font-bold mb-1">Cliente Premium</div>
            <div className="text-purple-100 text-sm flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Últimos pedidos entregues
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-4 space-y-2">
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
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${
                    isActive ? 'text-purple-100' : 'text-gray-500'
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

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Solicitar Orçamento</div>
                  <div className="text-xs text-gray-500">Cotação rápida</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <div className="text-xs text-gray-500">Membro VIP</div>
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
                <span className="text-sm font-medium">VIP</span>
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
