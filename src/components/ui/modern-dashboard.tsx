'use client'

import { ReactNode, useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import ModernCard, { StatsCard, ActionCard } from './modern-card'
import ModernButton from './modern-button'

interface DashboardStats {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

interface ModernDashboardProps {
  title: string
  subtitle?: string
  stats: DashboardStats[]
  quickActions?: Array<{
    title: string
    description: string
    icon: ReactNode
    action: () => void
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }>
  children?: ReactNode
}

export default function ModernDashboard({ 
  title, 
  subtitle, 
  stats, 
  quickActions = [],
  children 
}: ModernDashboardProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
      green: { bg: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-50' },
      purple: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-50' },
      orange: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600', light: 'bg-orange-50' },
      red: { bg: 'from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-50' }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={`space-y-8 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <ModernButton variant="secondary" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            Mais opções
          </ModernButton>
          <ModernButton size="sm">
            Exportar dados
          </ModernButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color)
          const isPositive = stat.change > 0
          
          return (
            <div
              key={index}
              className={`transform transition-all duration-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <ModernCard variant="elevated" className="group hover:scale-105">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses.bg} text-white shadow-sm`}>
                        {stat.icon}
                      </div>
                      <h3 className="font-medium text-gray-600 text-sm">{stat.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform">
                        {stat.value}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isPositive 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(stat.change)}%
                        </div>
                        <span className="text-xs text-gray-500">{stat.changeLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                action={action.action}
                color={action.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Content */}
      {children && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  )
}

// Componente de métrica simples
export function QuickMetric({ 
  label, 
  value, 
  trend, 
  color = 'blue' 
}: {
  label: string
  value: string | number
  trend?: number
  color?: 'blue' | 'green' | 'red' | 'orange'
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50', 
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50'
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      {trend !== undefined && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          trend > 0 ? colorClasses.green : colorClasses.red
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  )
}
