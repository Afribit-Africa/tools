import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EconomyEditForm from './EconomyEditForm';
import FloatingNav from '@/components/ui/FloatingNav';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <FloatingNav role={session.user.role} />

      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-xl pt-28 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Edit Economy Profile
          </h1>
          <p className="text-bitcoin-100">
            Update {economy.economyName}'s information and settings
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        <EconomyEditForm
          economy={economy}
          userRole={session.user.role}
          userEmail={session.user.email}
        />
      </main>
    </div>
  );
}
