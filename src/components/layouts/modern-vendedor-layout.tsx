'use client'

import { useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { 
  BarChart3, 
  Package, 
  Users, 
  FileText, 
  Building2,
  Heart,
  User,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  TrendingUp,
  Target,
  Award,
  Globe,
  Shield,
  ArrowRight
} from 'lucide-react'
import LanguageSelector from '@/components/ui/language-selector'
import ExchangeRateDisplay from '@/components/ui/exchange-rate-display'

interface ModernVendedorLayoutProps {
  children: ReactNode
}

// Navegação será traduzida dinamicamente no componente

interface VendedorStats {
  meta: number
  vendas: number
  percentualMeta: number
  nome: string
}

export default function ModernVendedorLayout({ children }: ModernVendedorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [vendedorStats, setVendedorStats] = useState<VendedorStats>({
    meta: 0,
    vendas: 0,
    percentualMeta: 0,
    nome: 'Vendedor'
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const navigation = [
    { 
      name: t('dashboard'), 
      href: '/vendedor/dashboard', 
      icon: BarChart3,
      description: 'Visão geral de vendas'
    },
    { 
      name: t('produtos'), 
      href: '/vendedor/produtos', 
      icon: Package,
      description: 'Catálogo de produtos'
    },
    { 
      name: t('clientes'), 
      href: '/vendedor/clientes', 
      icon: Users,
      description: 'Base de clientes'
    },
    { 
      name: t('orcamentos'), 
      href: '/vendedor/orcamentos', 
      icon: FileText,
      description: 'Propostas e vendas'
    },
    { 
      name: t('empresas'), 
      href: '/vendedor/empresas', 
      icon: Building2,
      description: 'Representações'
    },
    { 
      name: t('crm'), 
      href: '/vendedor/crm', 
      icon: Heart,
      description: 'Relacionamento'
    },
    { 
      name: t('perfil'), 
      href: '/vendedor/perfil', 
      icon: User,
      description: 'Dados pessoais'
    },
    { 
      name: t('configuracoes'), 
      href: '/vendedor/configuracoes', 
      icon: Settings,
      description: 'Preferências'
    },
  ]

  useEffect(() => {
    fetchVendedorStats()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setIsAdmin(userData.role === 'ADMIN')
      }
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error)
    }
  }

  const fetchVendedorStats = async () => {
    try {
      const response = await fetch('/api/vendedor/dashboard')
      if (!response.ok) throw new Error('Erro ao carregar stats')
      
      const data = await response.json()
      
      // Calcular dados da meta
      const vendedorProfile = data.vendedorData?.vendedorProfile
      const meta = vendedorProfile?.meta || 50000 // Meta padrão
      const vendas = data.totalVendas || 0
      const percentualMeta = meta > 0 ? (vendas / meta * 100) : 0
      const nome = data.vendedorData?.user?.nome || 'Vendedor'
      
      setVendedorStats({
        meta,
        vendas,
        percentualMeta,
        nome: nome.split(' ')[0] // Primeiro nome apenas
      })
    } catch (error) {
      console.error('Erro ao carregar stats do vendedor:', error)
      // Manter valores padrão em caso de erro
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{vendedorStats.nome} Pro</h1>
              <p className="text-xs text-gray-500">Painel de vendas</p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Meta/Status Card */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Meta do Mês</span>
              </div>
              <Award className="h-4 w-4 opacity-80" />
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold mb-1">
                  R$ {vendedorStats.meta.toLocaleString('pt-BR')}
                </div>
                <div className="text-emerald-100 text-sm">
                  {vendedorStats.percentualMeta.toFixed(1)}% atingido
                </div>
                <div className="text-emerald-100 text-xs mt-1">
                  R$ {vendedorStats.vendas.toLocaleString('pt-BR')} vendido
                </div>
              </>
            )}
            <div className="w-full bg-emerald-400/30 rounded-full h-2 mt-2">
              <div 
                className="bg-white/80 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(vendedorStats.percentualMeta, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-4 space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
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
                    isActive ? 'text-emerald-100' : 'text-gray-500'
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
                <div className="font-medium text-gray-900 text-sm">
                  {loading ? 'Carregando...' : vendedorStats.nome}
                </div>
                <div className="text-xs text-gray-500">Online agora</div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
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
                <span className="text-gray-500">Vendedor</span>
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
              
              {/* Admin Shortcut - Only for ADMIN users */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg text-purple-700 hover:from-purple-200 hover:to-indigo-200 transition-all duration-200 border border-purple-200 hover:border-purple-300 shadow-sm"
                  title="Ir para Painel Admin"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Admin</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              
              {/* Performance Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-100 rounded-lg text-emerald-700">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Meta: {loading ? '...' : `${vendedorStats.percentualMeta.toFixed(1)}%`}
                </span>
              </div>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="text-sm">Buscar...</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
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
