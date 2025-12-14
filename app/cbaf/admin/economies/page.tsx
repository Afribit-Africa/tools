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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Hero Header */}
      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-xl pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Globe className="w-8 h-8" />
                </div>
                Bitcoin Circular Economies
              </h1>
              <p className="text-bitcoin-50 text-lg">
                {allEconomies.length} {allEconomies.length === 1 ? 'economy' : 'economies'} across {uniqueCountries} {uniqueCountries === 1 ? 'country' : 'countries'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {allEconomies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12">
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
              <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    TOTAL
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{allEconomies.length}</div>
                <div className="text-sm text-gray-500 font-medium">
                  {allEconomies.length === 1 ? 'Economy' : 'Economies'}
                </div>
              </div>

              {/* Countries */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-green-50 rounded-xl border-2 border-green-100">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    REGIONS
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{uniqueCountries}</div>
                <div className="text-sm text-gray-500 font-medium">
                  {uniqueCountries === 1 ? 'Country' : 'Countries'}
                </div>
              </div>

              {/* Total Videos */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-100">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    APPROVED
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{totalVideos}</div>
                <div className="text-sm text-gray-500 font-medium">
                  {totalVideos === 1 ? 'Video' : 'Videos'}
                </div>
              </div>

              {/* Total Merchants */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-bitcoin-50 rounded-xl border-2 border-bitcoin-200">
                    <TrendingUp className="w-6 h-6 text-bitcoin-600" />
                  </div>
                  <span className="text-xs font-bold text-bitcoin-600 bg-bitcoin-50 px-2 py-1 rounded-full">
                    MERCHANTS
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{totalMerchants}</div>
                <div className="text-sm text-gray-500 font-medium">
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
