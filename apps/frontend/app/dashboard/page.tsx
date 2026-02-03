import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Default redirect to buyer dashboard
  // In a real app, you would check user role and redirect accordingly
  redirect('/dashboard/buyer');
}
