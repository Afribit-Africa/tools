import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function SuperAdminEconomiesPage() {
  await requireAdmin();

  // Redirect to admin economies page (same functionality)
  redirect('/cbaf/admin/economies');
}
