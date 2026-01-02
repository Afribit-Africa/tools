import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EconomyEditForm from './EconomyEditForm';
import { DashboardLayout, AdminSidebarSections, PageHeader } from '@/components/cbaf';
import { Globe } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EconomyEditPage({ params }: Props) {
  const session = await requireAdmin();
  const { id } = await params;

  // Fetch economy
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, id),
  });

  if (!economy) {
    notFound();
  }

  // Check if BCE user is editing their own profile
  const isBCE = session.user.role === 'bce';
  const isOwnProfile = isBCE && session.user.email === economy.googleEmail;

  // BCE users can only edit their own profile
  if (isBCE && !isOwnProfile) {
    throw new Error('Unauthorized: BCE users can only edit their own profile');
  }

  return (
    <DashboardLayout
      sidebar={{
        sections: AdminSidebarSections,
        userRole: session.user.role
      }}
    >
      <PageHeader
        title="Edit Economy Profile"
        description={`Update ${economy.economyName}'s information and settings`}
        icon={Globe}
        breadcrumbs={[
          { label: 'Admin', href: '/cbaf/admin' },
          { label: 'Economies', href: '/cbaf/admin/economies' },
          { label: economy.economyName, href: `/cbaf/admin/economies/${id}` },
          { label: 'Edit' }
        ]}
      />

      <div className="max-w-5xl mx-auto">
        <EconomyEditForm
          economy={economy}
          userRole={session.user.role}
          userEmail={session.user.email}
        />
      </div>
    </DashboardLayout>
  );
}
