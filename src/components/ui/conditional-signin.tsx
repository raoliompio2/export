'use client'

import { SignInButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'

interface ConditionalSignInProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConditionalSignIn({ children, fallback }: ConditionalSignInProps) {
  const { isSignedIn } = useUser()
  
  // Se já está logado, não renderiza o botão de login
  if (isSignedIn) {
    return fallback || null
  }
  
  return (
    <SignInButton mode="modal">
      {children}
    </SignInButton>
  )
}
