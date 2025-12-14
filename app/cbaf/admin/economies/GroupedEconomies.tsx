'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin, Video, Users, CheckCircle, Calendar, ExternalLink, Search, X } from 'lucide-react';
import Link from 'next/link';

interface Economy {
  id: string;
  economyName: string;
  slug: string;
  country: string;
  city: string | null;
  description: string | null;
  website: string | null;
  twitter: string | null;
  lightningAddress: string | null;
  isVerified: boolean | null;
  totalVideosSubmitted: number | null;
  totalVideosApproved: number | null;
  totalMerchantsRegistered: number | null;
  createdAt: Date;
  lastActivityAt: Date | null;
}

interface GroupedEconomiesProps {
  economies: Economy[];
}

// Country flag emoji mapping
const countryFlags: Record<string, string> = {
  'South Africa': '🇿🇦',
  'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪',
  'Ghana': '🇬🇭',
  'Tanzania': '🇹🇿',
  'Uganda': '🇺🇬',
  'Rwanda': '🇷🇼',
  'Senegal': '🇸🇳',
  'Ethiopia': '🇪🇹',
  'Zambia': '🇿🇲',
  'Zimbabwe': '🇿🇼',
  'Botswana': '🇧🇼',
  'Mozambique': '🇲🇿',
  'Malawi': '🇲🇼',
  'Morocco': '🇲🇦',
  'Egypt': '🇪🇬',
  'Tunisia': '🇹🇳',
  'Algeria': '🇩🇿',
  // Add more as needed
};

export default function GroupedEconomies({ economies }: GroupedEconomiesProps) {
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter economies by search query
  const filteredEconomies = economies.filter(economy => {
    const query = searchQuery.toLowerCase();
    return (
      economy.economyName.toLowerCase().includes(query) ||
      economy.country.toLowerCase().includes(query) ||
      economy.city?.toLowerCase().includes(query) ||
      economy.slug.toLowerCase().includes(query)
    );
  });

  // Group economies by country
  const groupedByCountry = filteredEconomies.reduce((acc, economy) => {
    if (!acc[economy.country]) {
      acc[economy.country] = [];
    }
    acc[economy.country].push(economy);
    return acc;
  }, {} as Record<string, Economy[]>);

  // Sort countries by number of economies
  const sortedCountries = Object.keys(groupedByCountry).sort((a, b) => {
    return groupedByCountry[b].length - groupedByCountry[a].length;
  });

  const toggleCountry = (country: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(country)) {
      newExpanded.delete(country);
    } else {
      newExpanded.add(country);
    }
    setExpandedCountries(newExpanded);
  };

  const expandAll = () => {
    setExpandedCountries(new Set(sortedCountries));
  };

  const collapseAll = () => {
    setExpandedCountries(new Set());
  };

  const getApprovalRate = (economy: Economy) => {
    const submitted = economy.totalVideosSubmitted || 0;
    const approved = economy.totalVideosApproved || 0;
    return submitted > 0 ? Math.round((approved / submitted) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search economies, countries, or cities..."
              className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-bitcoin/50 focus:outline-none focus:ring-1 focus:ring-bitcoin/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Expand/Collapse Controls */}
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-400">
          {searchQuery && (
            <span>
              Found <strong className="text-white">{filteredEconomies.length}</strong> {filteredEconomies.length === 1 ? 'economy' : 'economies'}
              {' '}in <strong className="text-white">{sortedCountries.length}</strong> {sortedCountries.length === 1 ? 'country' : 'countries'}
            </span>
          )}
          {!searchQuery && (
            <span>
              <strong className="text-white">{economies.length}</strong> {economies.length === 1 ? 'economy' : 'economies'}
              {' '}across <strong className="text-white">{sortedCountries.length}</strong> {sortedCountries.length === 1 ? 'country' : 'countries'}
            </span>
          )}
        </div>
      </div>

      {/* Grouped Economies */}
      {sortedCountries.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
          <Search className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No economies found</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCountries.map((country) => {
            const countryEconomies = groupedByCountry[country];
            const isExpanded = expandedCountries.has(country);
            const flag = countryFlags[country] || '🌍';
            const totalVideos = countryEconomies.reduce((sum, e) => sum + (e.totalVideosApproved || 0), 0);
            const totalMerchants = countryEconomies.reduce((sum, e) => sum + (e.totalMerchantsRegistered || 0), 0);

            return (
              <div key={country} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {/* Country Header */}
                <button
                  onClick={() => toggleCountry(country)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-bitcoin/10 rounded-xl border border-bitcoin/30">
                      <span className="text-2xl">{flag}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{country}</h3>
                      <p className="text-sm text-gray-500">
                        {countryEconomies.length} {countryEconomies.length === 1 ? 'economy' : 'economies'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-300">{totalVideos}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-300">{totalMerchants}</span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Economies List */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {countryEconomies.map((economy) => {
                        const approvalRate = getApprovalRate(economy);

                        return (
                          <Link
                            key={economy.id}
                            href={`/cbaf/admin/economies/${economy.id}`}
                            className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:border-bitcoin/30 hover:bg-white/10 transition-all group cursor-pointer"
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-white group-hover:text-bitcoin transition-colors">
                                  {economy.economyName}
                                </h4>
                                <p className="text-sm text-gray-500">@{economy.slug}</p>
                              </div>
                              {economy.isVerified && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  <span className="text-xs font-bold text-green-400">Verified</span>
                                </div>
                              )}
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>{economy.city || country}</span>
                            </div>

                            {/* Description */}
                            {economy.description && (
                              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                {economy.description}
                              </p>
                            )}

                            {/* Statistics */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                <p className="text-xs text-blue-400 mb-1">Submitted</p>
                                <p className="text-lg font-bold text-blue-400">{economy.totalVideosSubmitted || 0}</p>
                              </div>
                              <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                                <p className="text-xs text-green-400 mb-1">Approved</p>
                                <p className="text-lg font-bold text-green-400">{economy.totalVideosApproved || 0}</p>
                              </div>
                            </div>

                            {/* Approval Rate */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-gray-500 font-medium">Approval Rate</span>
                                <span className="font-bold text-white">{approvalRate}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                                  style={{ width: `${approvalRate}%` }}
                                />
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(economy.createdAt).toLocaleDateString()}
                              </div>
                              {(economy.website || economy.twitter) && (
                                <div className="flex gap-2">
                                  {economy.website && (
                                    <a
                                      href={economy.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                      title="Website"
                                    >
                                      <ExternalLink className="w-4 h-4 text-gray-500 hover:text-bitcoin" />
                                    </a>
                                  )}
                                  {economy.twitter && (
                                    <a
                                      href={`https://twitter.com/${economy.twitter.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                      title="Twitter"
                                    >
                                      <svg className="w-4 h-4 text-gray-500 hover:text-bitcoin" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
