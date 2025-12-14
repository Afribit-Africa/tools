import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import { Users, MapPin, Video, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/cbaf';
import GroupedEconomies from './GroupedEconomies';
import FloatingNav from '@/components/ui/FloatingNav';

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
    <div className="min-h-screen bg-black pb-20">
      <FloatingNav role={session.user.role} />

      {/* Hero Header */}
      <header className="bg-gradient-to-r from-bitcoin/80 to-orange-600/80 backdrop-blur-xl border-b border-white/10 pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold flex items-center gap-3 mb-2 text-white">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Globe className="w-8 h-8" />
                </div>
                Bitcoin Circular Economies
              </h1>
              <p className="text-white/80 text-lg">
                {allEconomies.length} {allEconomies.length === 1 ? 'economy' : 'economies'} across {uniqueCountries} {uniqueCountries === 1 ? 'country' : 'countries'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {allEconomies.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
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
              <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                    TOTAL
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{allEconomies.length}</div>
                <div className="text-sm text-gray-400 font-medium">
                  {allEconomies.length === 1 ? 'Economy' : 'Economies'}
                </div>
              </div>

              {/* Countries */}
              <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                    REGIONS
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{uniqueCountries}</div>
                <div className="text-sm text-gray-400 font-medium">
                  {uniqueCountries === 1 ? 'Country' : 'Countries'}
                </div>
              </div>

              {/* Total Videos */}
              <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                    APPROVED
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{totalVideos}</div>
                <div className="text-sm text-gray-400 font-medium">
                  {totalVideos === 1 ? 'Video' : 'Videos'}
                </div>
              </div>

              {/* Total Merchants */}
              <div className="bg-bitcoin/10 backdrop-blur-sm border border-bitcoin/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-bitcoin/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-bitcoin" />
                  </div>
                  <span className="text-xs font-bold text-bitcoin bg-bitcoin/20 px-2 py-1 rounded-full">
                    MERCHANTS
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{totalMerchants}</div>
                <div className="text-sm text-gray-400 font-medium">
                  Registered
                </div>
              </div>
            </div>

            {/* Grouped Economies Component */}
            <GroupedEconomies economies={allEconomies} />
          </>
        )}
      </main>
    </div>
  );
}
