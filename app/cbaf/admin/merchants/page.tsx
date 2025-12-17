import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants, economies } from '@/lib/db/schema';
import { eq, isNull, or, desc, and } from 'drizzle-orm';
import { CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, Check, Home, Users } from 'lucide-react';
import Link from 'next/link';
import BulkVerifyButton from './BulkVerifyButton';
import { Badge, DashboardLayout, AdminSidebarSections, PageHeader } from '@/components/cbaf';

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
    <DashboardLayout
      sidebar={{
        sections: AdminSidebarSections,
        userRole: 'admin',
      }}
    >
      <PageHeader
        title="Merchant Verification"
        description="Manage BTCMap verification for all registered merchants"
        icon={Users}
        breadcrumbs={[
          { label: 'Dashboard', href: '/cbaf/dashboard' },
          { label: 'Merchants' },
        ]}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{totalMerchants}</p>
              <p className="text-sm text-white/50">Total Merchants</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 backdrop-blur-xl border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">{verifiedCount}</p>
              <p className="text-sm text-emerald-400/70">Verified</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 backdrop-blur-xl border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">{errorCount}</p>
              <p className="text-sm text-red-400/70">Errors</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 backdrop-blur-xl border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
              <p className="text-sm text-yellow-400/70">Pending</p>
            </div>
          </div>
        </div>
      </div>
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
                className="glass-card rounded-lg p-4 hover:border-bitcoin-500/50 transition-all backdrop-blur-xl"
              >
                <h3 className="font-heading font-bold mb-2 text-white">{economyName}</h3>
                <div className="flex items-center gap-4 text-sm mb-3">
                  <span className="text-emerald-400 inline-flex items-center gap-1">
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
        <div className="glass-card rounded-lg overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium text-white/70">Merchant</th>
                  <th className="text-left p-4 font-medium text-white/70">Economy</th>
                  <th className="text-left p-4 font-medium text-white/70">Status</th>
                  <th className="text-left p-4 font-medium text-white/70">Location</th>
                  <th className="text-left p-4 font-medium text-white/70">Registered</th>
                  <th className="text-left p-4 font-medium text-white/70">Actions</th>
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
                          <p className="text-xs text-white/50">{merchant.merchantName}</p>
                        )}
                        {merchant.category && (
                          <p className="text-xs text-white/50">{merchant.category}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white/70">{economyName || 'Unknown'}</td>
                    <td className="p-4">
                      {merchant.btcmapVerified ? (
                        <Badge darkMode={true} variant="success" icon={CheckCircle}>
                          Verified
                        </Badge>
                      ) : merchant.verificationError ? (
                        <div title={merchant.verificationError}>
                          <Badge darkMode={true} variant="error" icon={XCircle}>
                            Error
                          </Badge>
                        </div>
                      ) : (
                        <Badge darkMode={true} variant="warning" icon={Clock}>
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {merchant.address || 'No address'}
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {new Date(merchant.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <a
                        href={merchant.btcmapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-bitcoin-400 hover:text-bitcoin-300 flex items-center gap-1 font-medium"
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
      <div className="mt-8 p-6 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl backdrop-blur-xl">
        <h3 className="font-heading font-bold mb-2 text-white">ℹ️ About Verification</h3>
        <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
          <li>Merchants are automatically verified on registration</li>
          <li>Verified merchants have their details auto-populated from BTCMap</li>
          <li>Use bulk verification to retry failed merchants or update stale data</li>
          <li>Rate limiting: 200ms delay between requests to respect BTCMap API</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
