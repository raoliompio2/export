'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info,
  X
} from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])

  // Memoizar o valor do contexto
  const contextValue = useMemo(() => ({
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }), [addToast, removeToast, success, error, warning, info])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Memoizar ToastContainer para evitar re-renders desnecessários
const ToastContainer = React.memo(({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
})

ToastContainer.displayName = 'ToastContainer'

// Memoizar ToastItem para melhor performance
const ToastItem = React.memo(({ 
  toast, 
  onRemove 
}: { 
  toast: Toast
  onRemove: () => void 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = useCallback(() => {
    setIsRemoving(true)
    const timer = setTimeout(onRemove, 200)
    return () => clearTimeout(timer)
  }, [onRemove])

  const getIcon = useCallback(() => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }, [toast.type])

  const getStyles = useCallback(() => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
    }
  }, [toast.type])

  return (
    <div
      className={`max-w-sm w-full bg-white shadow-lg rounded-xl border-l-4 p-4 transition-all duration-200 transform ${
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100 scale-100'
          : isRemoving
          ? 'translate-x-full opacity-0 scale-95'
          : 'translate-x-full opacity-0 scale-95'
      } ${getStyles()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-sm text-gray-700 mt-1">
              {toast.message}
            </p>
          )}
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

ToastItem.displayName = 'ToastItem'

// Hook para usar toasts facilmente
export const toast = {
  success: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'success', title, message }
      }))
    }
  },
  error: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', title, message }
      }))
    }
  },
  warning: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'warning', title, message }
      }))
    }
  },
  info: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'info', title, message }
      }))
    }
  }
}