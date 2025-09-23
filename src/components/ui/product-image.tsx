'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, AlertCircle } from 'lucide-react'

interface ProductImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  useOptimization?: boolean // Se false, usa img comum
  fallbackText?: string
}

export default function ProductImage({ 
  src, 
  alt, 
  width = 300, 
  height = 300, 
  className = '',
  useOptimization = true,
  fallbackText = 'Imagem não disponível'
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset error state when src changes
  useState(() => {
    setImageError(false)
    setIsLoading(true)
  })

  if (imageError || !src) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 ${className}`}>
        <Package className="h-12 w-12 text-gray-300 mb-2" />
        <span className="text-xs text-gray-400 text-center px-2">{fallbackText}</span>
      </div>
    )
  }

  if (useOptimization) {
    // Usa Next.js Image com otimização
    return (
      <div className="relative">
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${className}`}>
            <div className="animate-pulse">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true)
            setIsLoading(false)
          }}
          // Configurações para melhor compatibilidade
          unoptimized={false}
          priority={false}
        />
      </div>
    )
  } else {
    // Usa img comum (URL direta) - fallback para casos problemáticos
    return (
      <div className="relative">
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${className}`}>
            <div className="animate-pulse">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true)
            setIsLoading(false)
          }}
          // Configurações para melhor compatibilidade
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }
}
