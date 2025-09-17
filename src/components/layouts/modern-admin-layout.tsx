'use client'

import { useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { 
  Shield, 
  Users, 
  Package, 
  Building2, 
  Settings, 
  BarChart3,
  Menu,
  X,
  ChevronRight,
  UserCheck,
  Bell,
  Search,
  Globe,
  Link as LinkIcon
} from 'lucide-react'
import LanguageSelector from '@/components/ui/language-selector'
import ExchangeRateDisplay from '@/components/ui/exchange-rate-display'
import ProfileSwitcher from '@/components/ui/profile-switcher'

interface ModernAdminLayoutProps {
  children: ReactNode
}

// Navegação será traduzida dinamicamente no componente

export default function ModernAdminLayout({ children }: ModernAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: BarChart3,
      description: 'Visão geral do sistema'
    },
    { 
      name: 'Aprovação de Usuários', 
      href: '/admin/aprovacao-usuarios', 
      icon: UserCheck,
      description: 'Aprovar novos usuários'
    },
    { 
      name: 'Usuários', 
      href: '/admin/usuarios', 
      icon: Users,
      description: 'Gestão de usuários'
    },
    { 
      name: 'Representações', 
      href: '/admin/representacoes', 
      icon: LinkIcon,
      description: 'Aprovar vendedores'
    },
    { 
      name: 'Empresas', 
      href: '/admin/empresas', 
      icon: Building2,
      description: 'Empresas cadastradas'
    },
    { 
      name: 'Produtos', 
      href: '/admin/produtos', 
      icon: Package,
      description: 'Catálogo de produtos'
    },
    { 
      name: 'Configurações', 
      href: '/admin/config', 
      icon: Settings,
      description: 'Config. do sistema'
    },
    { 
      name: 'Config. Observações', 
      href: '/admin/config-observacoes', 
      icon: Settings,
      description: 'Textos dos orçamentos'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
          <Shield className="h-20 w-20 text-red-400 hidden" />
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-2 top-2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
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
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${
                    isActive ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-300'
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
                <div className="font-medium text-gray-900 text-sm">Admin User</div>
                <div className="text-xs text-gray-500">Acesso total</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                <span className="text-gray-500">Admin</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <span className="text-gray-900 font-medium">
                  {navigation.find(item => item.href === pathname)?.name || 'Página'}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Profile Switcher */}
              <ProfileSwitcher />
              
              {/* Exchange Rate */}
              <ExchangeRateDisplay size="sm" className="hidden lg:flex" />
              
              {/* Language Selector */}
              <LanguageSelector variant="dropdown" className="hidden md:block" />
              
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="text-sm">Buscar...</span>
                <span className="text-xs bg-gray-300 px-1.5 py-0.5 rounded">⌘K</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
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
