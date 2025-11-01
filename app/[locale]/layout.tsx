import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AppProviders } from '@/components/providers/app-providers';
import { RouteTransitionProvider } from '@/components/providers/route-transition-provider';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Peakees | Second-Hand Fashion Store',
  description:
    'Unique second-hand clothing, shoes, toys and books in Israel. Quality pre-owned fashion for everyone.',
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <AppProviders>
                <RouteTransitionProvider>{children}</RouteTransitionProvider>
              </AppProviders>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
