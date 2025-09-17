'use client'

import { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  "group relative overflow-hidden transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg",
        glass: "bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90",
        gradient: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100",
        elevated: "bg-white shadow-sm hover:shadow-xl hover:-translate-y-1",
        bordered: "bg-white border-2 border-gray-100 hover:border-blue-200"
      },
      size: {
        sm: "p-4 rounded-lg",
        default: "p-6 rounded-xl", 
        lg: "p-8 rounded-2xl"
      },
      interactive: {
        true: "cursor-pointer transform hover:scale-[1.02]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false
    }
  }
)

interface ModernCardProps extends VariantProps<typeof cardVariants> {
  children: ReactNode
  className?: string
  onClick?: () => void
  icon?: ReactNode
  badge?: ReactNode
  loading?: boolean
}

export default function ModernCard({ 
  children, 
  className = "", 
  variant, 
  size, 
  interactive,
  onClick,
  icon,
  badge,
  loading = false
}: ModernCardProps) {
  return (
    <div
      className={`${cardVariants({ variant, size, interactive })} ${className}`}
      onClick={onClick}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-20">
          {badge}
        </div>
      )}

      {/* Icon Header */}
      {icon && (
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}

// Componentes específicos
export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  loading = false 
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; label: string }
  loading?: boolean
}) {
  return (
    <ModernCard variant="elevated" icon={icon} loading={loading}>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend.value > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}%</span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  )
}

export function ActionCard({ 
  title, 
  description, 
  icon, 
  action,
  color = "blue" 
}: {
  title: string
  description: string
  icon: ReactNode
  action: () => void
  color?: "blue" | "green" | "purple" | "orange"
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700", 
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
  }

  return (
    <ModernCard variant="bordered" interactive onClick={action}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-sm group-hover:shadow-md transition-shadow`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          →
        </div>
      </div>
    </ModernCard>
  )
}
