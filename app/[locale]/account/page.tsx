import { redirect } from 'next/navigation';

export default async function AccountPage() {
  // Redirect to dashboard
  redirect('/account/dashboard');
}
