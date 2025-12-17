import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import { Users, MapPin, Video, Globe, TrendingUp, Home } from 'lucide-react';
import Link from 'next/link';
import { EmptyState, DashboardLayout, AdminSidebarSections, PageHeader } from '@/components/cbaf';
import GroupedEconomies from './GroupedEconomies';

export default async function EconomiesPage() {
  const session = await requireAdmin();

  // Fetch all economies with statistics
  const allEconomies = await db.query.economies.findMany({
    orderBy: [desc(economies.totalVideosApproved), desc(economies.createdAt)],
  });

  // Calculate aggregate statistics
  const totalVideos = allEconomies.reduce((sum, e) => sum + (e.totalVideosApproved || 0), 0);
  const totalMerchants = allEconomies.reduce((sum, e) => sum + (e.totalMerchantsRegistered || 0), 0);
  const uniqueCountries = new Set(allEconomies.map(e => e.country)).size;
  const verifiedCount = allEconomies.filter(e => e.isVerified).length;

  return (
    <DashboardLayout
      sidebar={{
        sections: AdminSidebarSections,
        userRole: 'admin',
      }}
    >
      <PageHeader
        title="Bitcoin Circular Economies"
        description={`${allEconomies.length} ${allEconomies.length === 1 ? 'economy' : 'economies'} across ${uniqueCountries} ${uniqueCountries === 1 ? 'country' : 'countries'}`}
        icon={Globe}
        breadcrumbs={[
          { label: 'Dashboard', href: '/cbaf/dashboard' },
          { label: 'Economies' },
        ]}
      />
      {allEconomies.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 backdrop-blur-xl">
          <EmptyState
            icon={Users}
            title="No economies registered"
            description="Waiting for Bitcoin circular economies to join CBAF"
          />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Economies */}
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                  TOTAL
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{allEconomies.length}</div>
              <div className="text-sm text-white/60 font-medium">
                {allEconomies.length === 1 ? 'Economy' : 'Economies'}
              </div>
            </div>

            {/* Countries */}
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                  REGIONS
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{uniqueCountries}</div>
              <div className="text-sm text-white/60 font-medium">
                {uniqueCountries === 1 ? 'Country' : 'Countries'}
              </div>
            </div>

            {/* Total Videos */}
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Video className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                  APPROVED
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{totalVideos}</div>
              <div className="text-sm text-white/60 font-medium">
                {totalVideos === 1 ? 'Video' : 'Videos'}
              </div>
            </div>

            {/* Total Merchants */}
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-bitcoin-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-bitcoin-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-bitcoin-400" />
                </div>
                <span className="text-xs font-bold text-bitcoin-400 bg-bitcoin-500/20 px-2 py-1 rounded-full">
                  MERCHANTS
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{totalMerchants}</div>
              <div className="text-sm text-white/60 font-medium">
                Registered
              </div>
            </div>
          </div>

          {/* Grouped Economies Component */}
          <GroupedEconomies economies={allEconomies} />
        </>
      )}
    </DashboardLayout>
  );
}
