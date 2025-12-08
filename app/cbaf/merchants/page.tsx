import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Users, ExternalLink, MapPin, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function MerchantsPage() {
  const session = await requireBCEProfile();
  const economyId = session.user.economyId!;

  // Fetch all merchants for this economy
  const economyMerchants = await db.query.merchants.findMany({
    where: eq(merchants.economyId, economyId),
    orderBy: [desc(merchants.registeredAt)],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Your Merchants</h1>
              <p className="text-text-secondary mt-1">
                {economyMerchants.length} merchant{economyMerchants.length !== 1 ? 's' : ''} registered
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/cbaf/dashboard" className="btn-secondary">
                ← Back to Dashboard
              </Link>
              <Link href="/cbaf/merchants/register" className="btn-primary">
                <Users className="w-4 h-4 mr-2" />
                Add Merchant
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {economyMerchants.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">No merchants yet</h2>
            <p className="text-text-muted mb-6">
              Start building your circular economy network by adding merchants from BTCMap
            </p>
            <Link href="/cbaf/merchants/register" className="btn-primary inline-flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Register Your First Merchant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {economyMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg hover:border-bitcoin/50 transition-colors"
              >
                {/* Verification Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg">
                      {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                    </h3>
                    {merchant.category && (
                      <p className="text-xs text-text-muted mt-1">{merchant.category}</p>
                    )}
                  </div>
                  {merchant.btcmapVerified ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">Verified</span>
                    </div>
                  ) : merchant.verificationError ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-full">
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500 font-medium">Error</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-500 font-medium">Pending</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                {merchant.address && (
                  <div className="flex items-start gap-2 text-sm text-text-muted mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{merchant.address}</span>
                  </div>
                )}

                {/* Statistics */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-bitcoin" />
                    <span className="font-medium">{merchant.timesAppearedInVideos || 0}</span>
                    <span className="text-text-muted">appearances</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-text-muted mb-4">
                  <p>Registered: {new Date(merchant.registeredAt).toLocaleDateString()}</p>
                  {merchant.firstAppearanceDate && (
                    <p>First appearance: {new Date(merchant.firstAppearanceDate).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Notes */}
                {merchant.notes && (
                  <p className="text-sm text-text-muted mb-4 line-clamp-2">{merchant.notes}</p>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-border-primary flex items-center justify-between">
                  <a
                    href={merchant.btcmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bitcoin hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on BTCMap
                  </a>
                  {merchant.verificationError && (
                    <button
                      title={merchant.verificationError}
                      className="text-xs text-red-500 hover:underline"
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
          <div className="mt-8 p-6 bg-bitcoin/10 border border-bitcoin/30 rounded-xl">
            <h3 className="font-heading font-bold mb-2">💡 Growing Your Network</h3>
            <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
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
