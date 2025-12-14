import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Redirect based on role
  if (session.user.role === 'super_admin') {
    redirect('/cbaf/super-admin');
  } else {
    // Regular admins get their own simplified dashboard
    redirect('/cbaf/admin/reviews');
  }
}
