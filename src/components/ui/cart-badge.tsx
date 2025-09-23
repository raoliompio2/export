'use client'

import { ShoppingCart } from 'lucide-react'
import { useCarrinho } from '@/hooks/useCarrinho'

interface CartBadgeProps {
  className?: string
  showIcon?: boolean
}

export default function CartBadge({ className = '', showIcon = true }: CartBadgeProps) {
  const { totalItens, loading } = useCarrinho()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <ShoppingCart className="h-4 w-4" />
      )}
      
      {loading ? (
        <div className="bg-gray-300 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
          ...
        </div>
      ) : totalItens > 0 ? (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
          {totalItens > 99 ? '99+' : totalItens}
        </span>
      ) : null}
    </div>
  )
}
