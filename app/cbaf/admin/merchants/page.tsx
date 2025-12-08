import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants, economies } from '@/lib/db/schema';
import { eq, isNull, or, desc, and } from 'drizzle-orm';
import { CheckCircle, XCircle, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import BulkVerifyButton from './BulkVerifyButton';

export default async function AdminMerchantsPage() {
  await requireAdmin();

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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Merchant Verification</h1>
              <p className="text-text-secondary mt-1">
                Manage BTCMap verification for all registered merchants
              </p>
            </div>
            <Link href="/cbaf/admin" className="btn-secondary">
              ← Back to Admin
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-bg-primary border border-border-primary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Total Merchants</p>
                  <p className="text-2xl font-bold">{totalMerchants}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-text-muted" />
              </div>
            </div>

            <div className="bg-bg-primary border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Verified</p>
                  <p className="text-2xl font-bold text-green-500">{verifiedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-bg-primary border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Errors</p>
                  <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-bg-primary border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
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
                  key={key}
                  className="bg-bg-secondary border border-border-primary rounded-lg p-4"
                >
                  <h3 className="font-heading font-bold mb-2">{economyName}</h3>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="text-green-500">✓ {economyVerified}</span>
                    <span className="text-red-500">✗ {economyErrors}</span>
                    <span className="text-yellow-500">⏳ {economyPending}</span>
                  </div>
                  <BulkVerifyButton economyId={economyId} economyName={economyName} />
                </div>
              );
            })}
          </div>
        </section>

        {/* All Merchants Table */}
        <section>
          <h2 className="text-xl font-heading font-bold mb-4">All Merchants</h2>
          <div className="bg-bg-secondary border border-border-primary rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-primary border-b border-border-primary">
                  <tr>
                    <th className="text-left p-4 font-medium">Merchant</th>
                    <th className="text-left p-4 font-medium">Economy</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Location</th>
                    <th className="text-left p-4 font-medium">Registered</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  {allMerchants.map(({ merchant, economyName }) => (
                    <tr key={merchant.id} className="hover:bg-bg-primary/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">
                            {merchant.localName || merchant.merchantName || 'Unnamed'}
                          </p>
                          {merchant.merchantName && merchant.localName && (
                            <p className="text-xs text-text-muted">{merchant.merchantName}</p>
                          )}
                          {merchant.category && (
                            <p className="text-xs text-text-muted">{merchant.category}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{economyName || 'Unknown'}</td>
                      <td className="p-4">
                        {merchant.btcmapVerified ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500">Verified</span>
                          </div>
                        ) : merchant.verificationError ? (
                          <div
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-full cursor-help"
                            title={merchant.verificationError}
                          >
                            <XCircle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-500">Error</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
                            <Clock className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-500">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {merchant.address || 'No address'}
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {new Date(merchant.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <a
                          href={merchant.btcmapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-bitcoin hover:underline flex items-center gap-1"
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
          <h3 className="font-heading font-bold mb-2">ℹ️ About Verification</h3>
          <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
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
