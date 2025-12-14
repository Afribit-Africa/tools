import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants, economies } from '@/lib/db/schema';
import { eq, isNull, or, desc, and } from 'drizzle-orm';
import { CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import BulkVerifyButton from './BulkVerifyButton';
import { StatCard, Badge } from '@/components/cbaf';
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200 pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Merchant Verification</h1>
              <p className="text-gray-300 mt-1">
                Manage BTCMap verification for all registered merchants
              </p>
            </div>
            <Link href="/cbaf/admin" className="btn-secondary">
              ← Back to Admin
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <StatCard
              title="Total Merchants"
              value={totalMerchants.toString()}
              icon={RefreshCw}
              iconBgColor="bg-gray-100"
              iconColor="text-gray-600"
            />

            <StatCard
              title="Verified"
              value={verifiedCount.toString()}
              icon={CheckCircle}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />

            <StatCard
              title="Errors"
              value={errorCount.toString()}
              icon={XCircle}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />

            <StatCard
              title="Pending"
              value={pendingCount.toString()}
              icon={Clock}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bulk Verification by Economy */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-bold mb-4">Bulk Verification by Economy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(economyGroups).map(([key, { economyId, economyName, merchants }]) => {
              const economyVerified = merchants.filter((m) => m.btcmapVerified).length;
              const economyErrors = merchants.filter((m) => m.verificationError).length;
              const economyPending = merchants.length - economyVerified - economyErrors;

              return (
                <div
                  key={economyId}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-bitcoin-300 transition-colors"
                >
                  <h3 className="font-heading font-bold mb-2 text-gray-900">{economyName}</h3>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="text-green-600 inline-flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {economyVerified}
                    </span>
                    <span className="text-red-600 inline-flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {economyErrors}
                    </span>
                    <span className="text-yellow-600 inline-flex items-center gap-1">
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
          <h2 className="text-xl font-heading font-bold mb-4 text-gray-900">All Merchants</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Merchant</th>
                    <th className="text-left p-4 font-medium text-gray-900">Economy</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                    <th className="text-left p-4 font-medium text-gray-900">Registered</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allMerchants.map(({ merchant, economyName }) => (
                    <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
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
                      <td className="p-4 text-sm text-gray-900">{economyName || 'Unknown'}</td>
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
                      <td className="p-4 text-sm text-gray-600">
                        {merchant.address || 'No address'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(merchant.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <a
                          href={merchant.btcmapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-bitcoin-600 hover:text-bitcoin-700 flex items-center gap-1 font-medium"
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
        <div className="mt-8 p-6 bg-bitcoin-50 border-2 border-bitcoin-200 rounded-xl">
          <h3 className="font-heading font-bold mb-2 text-gray-900">ℹ️ About Verification</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
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
