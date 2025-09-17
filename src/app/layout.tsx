import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import "./globals.css";
import "../styles/professional-print.css";
import { ToastProvider } from "@/components/ui/modern-toast";

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
    <ClerkProvider>
      <html lang="pt-BR">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
          suppressHydrationWarning={true}
        >
          <NextIntlClientProvider messages={messages}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
