import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import "./globals.css";
import "../styles/professional-print.css";
import { ToastProvider } from "@/components/ui/modern-toast";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painel de Exportação",
  description: "Sistema completo de vendas e gestão de clientes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from middleware or default to 'pt'
  const messages = await getMessages()
  
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
          formFieldInput: 'border border-gray-300 focus:border-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
      localization={{
        signIn: {
          start: {
            title: "Bem-vindo ao Painel de Exportação",
            subtitle: "Faça login para acessar o sistema",
          },
        },
      }}
    >
      <html lang="pt-BR">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
          suppressHydrationWarning={true}
        >
          <NextIntlClientProvider messages={messages}>
            <CurrencyProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </CurrencyProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
