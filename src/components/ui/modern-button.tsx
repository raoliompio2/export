'use client'

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-sm hover:shadow-md",
        glass: "bg-white/80 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white/90 focus:ring-gray-500"
      },
      size: {
        xs: "px-2 py-1 text-xs rounded-md",
        sm: "px-3 py-1.5 text-sm rounded-lg",
        default: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-3 text-base rounded-xl",
        xl: "px-8 py-4 text-lg rounded-xl"
      },
      animation: {
        none: "",
        bounce: "hover:-translate-y-0.5 hover:scale-105",
        pulse: "hover:animate-pulse",
        glow: "hover:shadow-lg hover:shadow-blue-500/25"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      animation: "bounce"
    }
  }
)

interface ModernButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className = "", 
    variant, 
    size, 
    animation,
    children, 
    loading = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={`${buttonVariants({ variant, size, animation })} ${className}`}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex items-center">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex items-center">{icon}</span>
        )}
      </button>
    )
  }
)

ModernButton.displayName = "ModernButton"

// Botões específicos para casos comuns
export function PrimaryButton(props: Omit<ModernButtonProps, 'variant'>) {
  return <ModernButton variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ModernButtonProps, 'variant'>) {
  return <ModernButton variant="secondary" {...props} />
}

export function DangerButton(props: Omit<ModernButtonProps, 'variant'>) {
  return <ModernButton variant="danger" {...props} />
}

export function GhostButton(props: Omit<ModernButtonProps, 'variant'>) {
  return <ModernButton variant="ghost" animation="none" {...props} />
}

export default ModernButton
