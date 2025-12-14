import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants, economies } from '@/lib/db/schema';
import { eq, isNull, or, desc, and } from 'drizzle-orm';
import { CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import BulkVerifyButton from './BulkVerifyButton';
import { Badge } from '@/components/cbaf';
import FloatingNav from '@/components/ui/FloatingNav';

export default async function AdminMerchantsPage() {
  const session = await requireAdmin();

  // Fetch all merchants with their economy information
  const allMerchants = await db
    .select({
      merchant: merchants,
      economyName: economies.economyName,
    })
    .from(merchants)
    .leftJoin(economies, eq(merchants.economyId, economies.id))
    .orderBy(desc(merchants.registeredAt));

  // Statistics
  const totalMerchants = allMerchants.length;
  const verifiedCount = allMerchants.filter((m) => m.merchant.btcmapVerified).length;
  const errorCount = allMerchants.filter((m) => m.merchant.verificationError).length;
  const pendingCount = totalMerchants - verifiedCount - errorCount;

  // Group by economy for bulk operations
  interface EconomyGroup {
    economyId: string;
    economyName: string;
    merchants: typeof allMerchants[0]['merchant'][];
  }

  const economyGroups = allMerchants.reduce((acc, { merchant, economyName }) => {
    if (!economyName || !merchant.economyId) return acc;
    const key = merchant.economyId;
    if (!acc[key]) {
      acc[key] = { economyId: merchant.economyId, economyName, merchants: [] };
    }
    acc[key].merchants.push(merchant);
    return acc;
  }, {} as Record<string, EconomyGroup>);

  return (
    <div className="min-h-screen bg-black pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">Merchant Verification</h1>
              <p className="text-gray-400 mt-1">
                Manage BTCMap verification for all registered merchants
              </p>
            </div>
            <Link href="/cbaf/dashboard" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalMerchants}</p>
                  <p className="text-sm text-gray-500">Total Merchants</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
                  <p className="text-sm text-green-400/70">Verified</p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{errorCount}</p>
                  <p className="text-sm text-red-400/70">Errors</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                  <p className="text-sm text-yellow-400/70">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bulk Verification by Economy */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-bold mb-4 text-white">Bulk Verification by Economy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(economyGroups).map(([key, { economyId, economyName, merchants }]) => {
              const economyVerified = merchants.filter((m) => m.btcmapVerified).length;
              const economyErrors = merchants.filter((m) => m.verificationError).length;
              const economyPending = merchants.length - economyVerified - economyErrors;

              return (
                <div
                  key={economyId}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-bitcoin/30 transition-colors"
                >
                  <h3 className="font-heading font-bold mb-2 text-white">{economyName}</h3>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="text-green-400 inline-flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {economyVerified}
                    </span>
                    <span className="text-red-400 inline-flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {economyErrors}
                    </span>
                    <span className="text-yellow-400 inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {economyPending}
                    </span>
                  </div>
                  <BulkVerifyButton economyId={economyId} economyName={economyName} />
                </div>
              );
            })}
          </div>
        </section>

        {/* All Merchants Table */}
        <section>
          <h2 className="text-xl font-heading font-bold mb-4 text-white">All Merchants</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-300">Merchant</th>
                    <th className="text-left p-4 font-medium text-gray-300">Economy</th>
                    <th className="text-left p-4 font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 font-medium text-gray-300">Location</th>
                    <th className="text-left p-4 font-medium text-gray-300">Registered</th>
                    <th className="text-left p-4 font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allMerchants.map(({ merchant, economyName }) => (
                    <tr key={merchant.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">
                            {merchant.localName || merchant.merchantName || 'Unnamed'}
                          </p>
                          {merchant.merchantName && merchant.localName && (
                            <p className="text-xs text-gray-500">{merchant.merchantName}</p>
                          )}
                          {merchant.category && (
                            <p className="text-xs text-gray-500">{merchant.category}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{economyName || 'Unknown'}</td>
                      <td className="p-4">
                        {merchant.btcmapVerified ? (
                          <Badge variant="success" icon={CheckCircle}>
                            Verified
                          </Badge>
                        ) : merchant.verificationError ? (
                          <div title={merchant.verificationError}>
                            <Badge variant="error" icon={XCircle}>
                              Error
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="warning" icon={Clock}>
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {merchant.address || 'No address'}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(merchant.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <a
                          href={merchant.btcmapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-bitcoin hover:text-bitcoin/80 flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          BTCMap
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-bitcoin/10 border border-bitcoin/30 rounded-xl">
          <h3 className="font-heading font-bold mb-2 text-white">ℹ️ About Verification</h3>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Merchants are automatically verified on registration</li>
            <li>Verified merchants have their details auto-populated from BTCMap</li>
            <li>Use bulk verification to retry failed merchants or update stale data</li>
            <li>Rate limiting: 200ms delay between requests to respect BTCMap API</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
