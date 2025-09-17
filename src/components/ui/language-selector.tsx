'use client'

import { useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

interface LanguageSelectorProps {
  currentLocale?: string
  variant?: 'dropdown' | 'buttons'
  className?: string
}

export default function LanguageSelector({ 
  currentLocale = 'pt', 
  variant = 'dropdown',
  className = ''
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  const handleLanguageChange = (locale: string) => {
    // Remove locale prefix from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    
    // Create new path with selected locale
    const newPath = locale === 'pt' ? pathnameWithoutLocale : `/${locale}${pathnameWithoutLocale}`
    
    // Store language preference
    localStorage.setItem('preferred-language', locale)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000` // 1 year
    
    // Navigate to new path
    router.push(newPath)
    setIsOpen(false)
  }

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${currentLocale === language.code
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }
            `}
          >
            <span className="mr-1">{language.flag}</span>
            {language.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <Globe className="h-4 w-4" />
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>{language.flag}</span>
                  <span className="flex-1 text-left">{language.name}</span>
                  {currentLocale === language.code && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
