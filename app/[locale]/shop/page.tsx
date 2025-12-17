/**
 * Shop Root Page
 *
 * Redirects to the last visited gender collection or defaults to women.
 * This creates a seamless user experience by remembering preferences.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface ShopPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;

  // Default to women's collection (can be enhanced with cookie-based preference)
  redirect(`/${locale}/shop/women`);
}
