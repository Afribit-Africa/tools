import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Users, MapPin, Video, CheckCircle, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function EconomiesPage() {
  const session = await requireAdmin();

  // Fetch all economies
  const allEconomies = await db.query.economies.findMany({
    orderBy: [desc(economies.totalVideosApproved), desc(economies.createdAt)],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">All Economies</h1>
              <p className="text-text-secondary mt-1">
                {allEconomies.length} Bitcoin circular econom{allEconomies.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
            <Link href="/cbaf/admin" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {allEconomies.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">No economies registered</h2>
            <p className="text-text-muted">
              Waiting for Bitcoin circular economies to join CBAF
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEconomies.map((economy) => {
              const approvalRate = economy.totalVideosSubmitted && economy.totalVideosSubmitted > 0
                ? Math.round(((economy.totalVideosApproved || 0) / economy.totalVideosSubmitted) * 100)
                : 0;

              return (
                <div
                  key={economy.id}
                  className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg hover:border-bitcoin/50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-lg">
                        {economy.economyName}
                      </h3>
                      <p className="text-sm text-text-muted">@{economy.slug}</p>
                    </div>
                    {economy.isVerified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{economy.city ? `${economy.city}, ` : ''}{economy.country}</span>
                  </div>

                  {/* Description */}
                  {economy.description && (
                    <p className="text-sm text-text-muted mb-4 line-clamp-2">
                      {economy.description}
                    </p>
                  )}

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Videos Submitted</p>
                      <p className="text-xl font-bold">{economy.totalVideosSubmitted || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Videos Approved</p>
                      <p className="text-xl font-bold text-green-500">
                        {economy.totalVideosApproved || 0}
                      </p>
                    </div>
                  </div>

                  {/* Approval Rate Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-muted">Approval Rate</span>
                      <span className="font-medium">{approvalRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-text-muted mb-4 space-y-1">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined: {new Date(economy.createdAt).toLocaleDateString()}
                    </p>
                    {economy.lastActivityAt && (
                      <p>Last active: {new Date(economy.lastActivityAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="pt-4 border-t border-border-primary flex items-center justify-between gap-2">
                    {economy.website && (
                      <a
                        href={economy.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-bitcoin hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Website
                      </a>
                    )}
                    {economy.twitter && (
                      <a
                        href={`https://twitter.com/${economy.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-bitcoin hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Twitter
                      </a>
                    )}
                    {economy.lightningAddress && (
                      <span className="text-xs text-text-muted truncate" title={economy.lightningAddress}>
                        ⚡ {economy.lightningAddress}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
