import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "レゾナンス：無限号列車 相場チェッカー",
};

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
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
