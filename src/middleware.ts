import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/',
  '/api/setup',  // Apenas setup inicial
  '/orcamento/(.*)/public',  // Páginas públicas de orçamento
  '/api/orcamentos/(.*)/public',  // API pública de orçamento
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Set locale header for server components
  const acceptLanguage = req.headers.get('accept-language') || ''
  let locale = 'pt' // default
  
  // Simple locale detection
  if (acceptLanguage.includes('en')) locale = 'en'
  if (acceptLanguage.includes('es')) locale = 'es'
  
  // Override with stored preference from cookie
  const localeCookie = req.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && ['pt', 'en', 'es'].includes(localeCookie)) {
    locale = localeCookie
  }
  
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)

  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
