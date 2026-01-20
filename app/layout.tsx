import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react';
import PWAInstaller from '@/components/PWAInstaller'

export const metadata = {
  title: "レゾナンス：無限号列車 相場チェッカー",
  description: "レゾナンス：無限号列車のゲーム内の取引品の相場をチェックできるサイトです。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "相場チェッカー",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-gray-50">
        <main className="mx-auto">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="acme-theme">
            {children}
            <PWAInstaller />
          </ThemeProvider>
          <Analytics />
        </main>
      </body>
    </html>
  );
}
