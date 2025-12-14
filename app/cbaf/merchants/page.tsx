import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Users, ExternalLink, MapPin, TrendingUp, CheckCircle, XCircle, Clock, Plus, Zap } from 'lucide-react';
import Link from 'next/link';
import { Badge, EmptyState } from '@/components/cbaf';
import CSVUploadButton from './CSVUploadButton';
import CSVExportButton from './CSVExportButton';
import FloatingNav from '@/components/ui/FloatingNav';

export default async function MerchantsPage() {
  const session = await requireBCEProfile();
  const economyId = session.user.economyId!;

  // Fetch all merchants for this economy
  const economyMerchants = await db.query.merchants.findMany({
    where: eq(merchants.economyId, economyId),
    orderBy: [desc(merchants.registeredAt)],
  });

  const stats = {
    total: economyMerchants.length,
    verified: economyMerchants.filter(m => m.btcmapVerified).length,
    withBlink: economyMerchants.filter(m => m.lightningAddress && m.paymentProvider === 'blink').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold">Your Merchants</h1>
              <p className="text-gray-300 mt-1">
                Manage your registered merchants and their payment details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/cbaf/dashboard"
                className="px-3 py-2 text-sm font-medium text-black bg-white hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                ← Back
              </Link>
              <CSVExportButton economyId={economyId} />
              <CSVUploadButton economyId={economyId} variant="secondary" />
              <Link
                href="/cbaf/merchants/register"
                className="px-3 py-2 text-sm font-medium text-white bg-bitcoin-500 hover:bg-bitcoin-600 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Merchant
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-gray-300 text-xs mb-1">Total Merchants</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-gray-300 text-xs mb-1">BTCMap Verified</div>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-gray-300 text-xs mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                With Blink Address
              </div>
              <div className="text-2xl font-bold">{stats.withBlink}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {economyMerchants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No merchants yet"
            description="Start building your circular economy network by adding merchants from BTCMap or importing them via CSV"
          >
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/cbaf/merchants/register" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Register Your First Merchant
              </Link>
              <CSVUploadButton economyId={economyId} variant="secondary" />
            </div>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {economyMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-bitcoin-300 hover:shadow-md transition-all"
              >
                {/* Verification Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                    </h3>
                    {merchant.category && (
                      <p className="text-xs text-gray-500 mt-1">{merchant.category}</p>
                    )}
                  </div>
                  {merchant.btcmapVerified ? (
                    <Badge variant="success" icon={CheckCircle}>
                      Verified
                    </Badge>
                  ) : merchant.verificationError ? (
                    <Badge variant="error" icon={XCircle}>
                      Error
                    </Badge>
                  ) : (
                    <Badge variant="warning" icon={Clock}>
                      Pending
                    </Badge>
                  )}
                </div>

                {/* Location */}
                {merchant.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{merchant.address}</span>
                  </div>
                )}

                {/* Statistics */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-bitcoin-500" />
                    <span className="font-medium text-gray-900">{merchant.timesAppearedInVideos || 0}</span>
                    <span className="text-gray-500">appearances</span>
                  </div>
                </div>

                {/* Lightning Address */}
                {merchant.lightningAddress && (
                  <div className="mb-4 p-3 bg-bitcoin-50 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Zap className="w-3 h-3 text-bitcoin-500" />
                      <span className="font-medium">Lightning Address</span>
                      {merchant.paymentProvider && (
                        <span className="px-2 py-0.5 bg-bitcoin-100 text-bitcoin-700 rounded text-xs capitalize">
                          {merchant.paymentProvider}
                        </span>
                      )}
                    </div>
                    <code className="text-xs text-gray-900 font-mono break-all">
                      {merchant.lightningAddress}
                    </code>
                  </div>
                )}

                {/* Dates */}
                <div className="text-xs text-gray-500 mb-4">
                  <p>Registered: {new Date(merchant.registeredAt).toLocaleDateString()}</p>
                  {merchant.firstAppearanceDate && (
                    <p>First appearance: {new Date(merchant.firstAppearanceDate).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Notes */}
                {merchant.notes && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{merchant.notes}</p>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <a
                    href={merchant.btcmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on BTCMap
                  </a>
                  {merchant.verificationError && (
                    <button
                      title={merchant.verificationError}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      View Error
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {economyMerchants.length > 0 && (
          <div className="mt-8 p-6 bg-bitcoin-50 border-2 border-bitcoin-200 rounded-xl">
            <h3 className="font-heading font-bold text-gray-900 mb-2">💡 Growing Your Network</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Feature merchants in your video submissions to increase their appearance count</li>
              <li>More merchant appearances = higher rankings = more funding</li>
              <li>Verified merchants from BTCMap count toward your credibility score</li>
              <li>New merchant discoveries each month boost your ranking</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
