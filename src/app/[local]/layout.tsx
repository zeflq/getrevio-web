// app/layout.tsx
import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Providers } from "./providers"; // client wrapper for QueryProvider + Toaster
import { ThemeProvider } from "next-themes";
import { Source_Sans_3, Fraunces, JetBrains_Mono } from 'next/font/google';


export const fontSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600'],
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Reviw App",
  description: "",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <NextIntlClientProvider locale={locale}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}
