import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AppProviders } from '@/components/providers/app-providers';
import { RouteTransitionProvider } from '@/components/providers/route-transition-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Peakees | Second-Hand Fashion Store',
  description: 'Unique second-hand clothing, shoes, toys and books in Israel. Quality pre-owned fashion for everyone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
