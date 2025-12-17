import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants, economies } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Users, ExternalLink, MapPin, TrendingUp, CheckCircle, XCircle, Clock, Plus, Zap, Home } from 'lucide-react';
import Link from 'next/link';
import { Badge, EmptyState, DashboardLayout, BCESidebarSections, PageHeader, Button } from '@/components/cbaf';
import CSVUploadButton from './CSVUploadButton';
import CSVExportButton from './CSVExportButton';

export default async function MerchantsPage() {
  const session = await requireBCEProfile();
  const economyId = session.user.economyId!;

  // Fetch all merchants for this economy
  const economyMerchants = await db.query.merchants.findMany({
    where: eq(merchants.economyId, economyId),
    orderBy: [desc(merchants.registeredAt)],
  });

  // Fetch economy for sidebar
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, economyId),
  });

  const stats = {
    total: economyMerchants.length,
    verified: economyMerchants.filter(m => m.btcmapVerified).length,
    withBlink: economyMerchants.filter(m => m.lightningAddress && m.paymentProvider === 'blink').length,
  };

  return (
    <DashboardLayout
      sidebar={{
        sections: BCESidebarSections,
        userRole: 'bce',
        economyName: economy?.economyName,
      }}
    >
      <PageHeader
        title="Your Merchants"
        description="Manage your registered merchants and their payment details"
        icon={Users}
        breadcrumbs={[
          { label: 'Dashboard', href: '/cbaf/dashboard' },
          { label: 'Merchants' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <CSVExportButton economyId={economyId} />
            <CSVUploadButton economyId={economyId} variant="secondary" />
            <Link href="/cbaf/merchants/register">
              <Button variant="primary" icon={Plus} darkMode={true}>
                Add Merchant
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-lg p-4">
          <div className="text-white/60 text-sm mb-1">Total Merchants</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-white/60 text-sm mb-1">BTCMap Verified</div>
          <div className="text-3xl font-bold text-white">{stats.verified}</div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="text-white/60 text-sm mb-1 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            With Blink Address
          </div>
          <div className="text-3xl font-bold text-white">{stats.withBlink}</div>
        </div>
      </div>
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
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-bitcoin/30 hover:bg-white/10 transition-all"
              >
                {/* Verification Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-white">
                      {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                    </h3>
                    {merchant.category && (
                      <p className="text-xs text-gray-500 mt-1">{merchant.category}</p>
                    )}
                  </div>
                  {merchant.btcmapVerified ? (
                    <Badge variant="success" icon={CheckCircle} darkMode={true}>
                      Verified
                    </Badge>
                  ) : merchant.verificationError ? (
                    <Badge variant="error" icon={XCircle} darkMode={true}>
                      Error
                    </Badge>
                  ) : (
                    <Badge variant="warning" icon={Clock} darkMode={true}>
                      Pending
                    </Badge>
                  )}
                </div>

                {/* Location */}
                {merchant.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{merchant.address}</span>
                  </div>
                )}

                {/* Statistics */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-bitcoin" />
                    <span className="font-medium text-white">{merchant.timesAppearedInVideos || 0}</span>
                    <span className="text-gray-500">appearances</span>
                  </div>
                </div>

                {/* Lightning Address */}
                {merchant.lightningAddress && (
                  <div className="mb-4 p-3 bg-bitcoin/10 border border-bitcoin/30 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Zap className="w-3 h-3 text-bitcoin" />
                      <span className="font-medium">Lightning Address</span>
                      {merchant.paymentProvider && (
                        <span className="px-2 py-0.5 bg-bitcoin/20 text-bitcoin rounded text-xs capitalize">
                          {merchant.paymentProvider}
                        </span>
                      )}
                    </div>
                    <code className="text-xs text-white font-mono break-all">
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
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{merchant.notes}</p>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <a
                    href={merchant.btcmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bitcoin hover:text-bitcoin/80 font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on BTCMap
                  </a>
                  {merchant.verificationError && (
                    <button
                      title={merchant.verificationError}
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
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
          <div className="mt-8 p-6 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl backdrop-blur-xl">
            <h3 className="font-heading font-bold text-white mb-2">💡 Growing Your Network</h3>
            <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
              <li>Feature merchants in your video submissions to increase their appearance count</li>
              <li>More merchant appearances = higher rankings = more funding</li>
              <li>Verified merchants from BTCMap count toward your credibility score</li>
              <li>New merchant discoveries each month boost your ranking</li>
            </ul>
          </div>
        )}
    </DashboardLayout>
  );
}
