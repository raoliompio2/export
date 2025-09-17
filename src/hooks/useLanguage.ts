'use client'

import { useState, useEffect } from 'react'

type Language = 'pt' | 'en' | 'es'

const STORAGE_KEY = 'preferred-language'
const DEFAULT_LANGUAGE: Language = 'pt'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar idioma salvo na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Language
      if (saved && ['pt', 'en', 'es'].includes(saved)) {
        setLanguage(saved)
      }
      setIsLoaded(true)
    }
  }, [])

  // Escutar mudanças de idioma
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<{ language: Language }>) => {
      const newLanguage = event.detail.language
      if (['pt', 'en', 'es'].includes(newLanguage)) {
        setLanguage(newLanguage)
      }
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    // Salvar localmente (permanente)
    localStorage.setItem(STORAGE_KEY, newLanguage)
    document.cookie = `NEXT_LOCALE=${newLanguage}; path=/; max-age=31536000`
    
    // Atualizar estado
    setLanguage(newLanguage)
    
    // Notificar outros componentes
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: newLanguage } 
    }))
  }

  return {
    language,
    changeLanguage,
    isLoaded
  }
}
