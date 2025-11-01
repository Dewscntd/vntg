import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AppProviders } from '@/components/providers/app-providers';
import { RouteTransitionProvider } from '@/components/providers/route-transition-provider';

const rubik = Rubik({ subsets: ['hebrew'] });

export const metadata: Metadata = {
  title: 'Peakees | חנות יד שנייה לכל המשפחה',
  description:
    'Peakees מציעה ביגוד, נעליים, צעצועים וספרים במצב מצוין לכל המשפחה – עם חוויית קנייה מקומית ואישית.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={rubik.className}>
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
